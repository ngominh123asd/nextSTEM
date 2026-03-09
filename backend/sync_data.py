"""
Sync data between Supabase (cloud) ↔ Local PostgreSQL (Docker).

Usage:
    # Supabase → Local  (default)
    python sync_data.py pull

    # Local → Supabase
    python sync_data.py push

    # Pull specific tables only
    python sync_data.py pull --tables users,projects

    # Dry-run (show what would happen, no changes)
    python sync_data.py pull --dry-run

    # Copy schema from local to Supabase (create tables)
    python sync_data.py schema --direction push

    # Full setup: create schema then push data
    python sync_data.py push --create-schema

Requires both DATABASE URLs configured in .env or passed via CLI.
"""

import argparse
import asyncio
import os
import ssl as _ssl
import sys
from datetime import datetime

from sqlalchemy import delete, inspect, text, MetaData
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection

# ──────────────────────────── Config ────────────────────────────

# Load .env if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Cloud (Supabase) – reads from DATABASE_URL env var
SUPABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://user:pass@localhost:5432/dbname",
)

# Local Docker PostgreSQL
LOCAL_URL = os.environ.get(
    "LOCAL_DATABASE_URL",
    "postgresql+asyncpg://nextstem:nextstem_secret@localhost:5432/nextstem",
)

# Tables in dependency order (parents before children).
# FK constraints require this ordering to avoid violations.
TABLES_ORDERED = [
    "users",
    "user_preferences",
    "activities",
    "certificates",
    "projects",
    "documents",
    "document_chunks",
    "roadmaps",
    "roadmap_steps",
    "roadmap_tasks",
    "chat_sessions",
    "chat_messages",
    "audit_logs",
    "system_settings",
]

# ──────────────────────────── Helpers ───────────────────────────


async def discover_tables(conn: AsyncConnection) -> list[str]:
    """Return all user tables in 'public' schema (excludes system tables)."""
    result = await conn.execute(
        text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' "
            "  AND table_type = 'BASE TABLE' "
            "  AND table_name NOT IN ('alembic_version') "
            "ORDER BY table_name"
        )
    )
    return [row[0] for row in result.fetchall()]


def merge_table_order(known_order: list[str], discovered: list[str]) -> list[str]:
    """Merge discovered tables into known dependency order.

    Tables in *known_order* keep their position.
    Any extra tables found in *discovered* are appended at the end.
    """
    ordered = [t for t in known_order if t in set(discovered)]
    extra = [t for t in discovered if t not in set(known_order)]
    return ordered + extra


def _engine_kwargs(url: str) -> dict:
    """Build extra engine kwargs – add SSL for Supabase (cloud) URLs."""
    kwargs: dict = {}
    if "supabase.com" in url or "pooler.supabase.com" in url:
        ssl_ctx = _ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = _ssl.CERT_NONE
        kwargs["connect_args"] = {"ssl": ssl_ctx}
    return kwargs


async def get_table_columns(conn: AsyncConnection, table: str) -> list[str]:
    """Return column names for a table."""
    result = await conn.execute(
        text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_schema = 'public' AND table_name = :t "
            "ORDER BY ordinal_position"
        ),
        {"t": table},
    )
    return [row[0] for row in result.fetchall()]


async def get_row_count(conn: AsyncConnection, table: str) -> int:
    result = await conn.execute(text(f'SELECT count(*) FROM "{table}"'))
    return result.scalar()


async def table_exists(conn: AsyncConnection, table: str) -> bool:
    result = await conn.execute(
        text(
            "SELECT EXISTS ("
            "  SELECT 1 FROM information_schema.tables "
            "  WHERE table_schema = 'public' AND table_name = :t"
            ")"
        ),
        {"t": table},
    )
    return result.scalar()


async def fetch_all_rows(conn: AsyncConnection, table: str) -> list[dict]:
    """Fetch all rows from a table as list of dicts."""
    result = await conn.execute(text(f'SELECT * FROM "{table}"'))
    columns = list(result.keys())
    return [dict(zip(columns, row)) for row in result.fetchall()]


async def sync_table(
    source_conn: AsyncConnection,
    target_conn: AsyncConnection,
    table: str,
    dry_run: bool = False,
) -> dict:
    """Sync a single table: DELETE all in target, then INSERT from source."""

    # Check table exists on both sides
    if not await table_exists(source_conn, table):
        return {"table": table, "status": "skipped", "reason": "not in source"}
    if not await table_exists(target_conn, table):
        return {"table": table, "status": "skipped", "reason": "not in target"}

    source_count = await get_row_count(source_conn, table)
    target_count = await get_row_count(target_conn, table)

    if dry_run:
        return {
            "table": table,
            "status": "dry-run",
            "source_rows": source_count,
            "target_rows": target_count,
        }

    # Fetch all source rows
    rows = await fetch_all_rows(source_conn, table)

    if not rows:
        # Source empty → clear target too
        await target_conn.execute(text(f'DELETE FROM "{table}"'))
        return {
            "table": table,
            "status": "synced",
            "rows": 0,
            "note": "source empty, target cleared",
        }

    # Clear target table
    await target_conn.execute(text(f'DELETE FROM "{table}"'))

    # Insert rows in batches
    columns = list(rows[0].keys())
    col_list = ", ".join(f'"{c}"' for c in columns)
    param_list = ", ".join(f":{c}" for c in columns)
    insert_sql = text(f'INSERT INTO "{table}" ({col_list}) VALUES ({param_list})')

    batch_size = 500
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        for row in batch:
            await target_conn.execute(insert_sql, row)

    return {
        "table": table,
        "status": "synced",
        "rows": len(rows),
    }


# ──────────────────────── Schema Sync ───────────────────────────


async def sync_schema(
    source_url: str,
    target_url: str,
    tables: list[str] | None = None,
    dry_run: bool = False,
) -> list[dict]:
    """
    Reflect the schema from *source* and create missing tables on *target*.
    Uses SQLAlchemy MetaData.reflect() then create_all().
    Also handles pgvector extension and alembic_version stamp.
    """
    source_engine = create_async_engine(source_url, echo=False, **_engine_kwargs(source_url))
    target_engine = create_async_engine(target_url, echo=False, **_engine_kwargs(target_url))

    results = []

    try:
        # 1. Enable required extensions on target
        if not dry_run:
            async with target_engine.connect() as tconn:
                for ext in ("vector", "uuid-ossp"):
                    try:
                        await tconn.execute(
                            text(f"CREATE EXTENSION IF NOT EXISTS \"{ext}\"")
                        )
                    except Exception:
                        print(f"  ⚠️  Could not create extension '{ext}' (may need superuser)")
                await tconn.commit()

        # 2. Reflect source schema
        def _reflect_sync(sync_conn):
            meta = MetaData()
            meta.reflect(bind=sync_conn, schema="public")
            return meta

        async with source_engine.connect() as sconn:
            source_meta = await sconn.run_sync(_reflect_sync)

        # Filter tables if requested
        if tables:
            tables_set = set(tables)
            table_objects = [t for t in source_meta.sorted_tables if t.name in tables_set]
        else:
            table_objects = list(source_meta.sorted_tables)

        if dry_run:
            for t in table_objects:
                results.append({"table": t.name, "status": "dry-run", "columns": len(t.columns)})
            return results

        # 3. Check which tables already exist on target
        async with target_engine.connect() as tconn:
            existing = set()
            for t in table_objects:
                if await table_exists(tconn, t.name):
                    existing.add(t.name)

        # 4. Create missing tables on target
        new_meta = MetaData()
        tables_to_create = []
        for t in table_objects:
            if t.name in existing:
                results.append({"table": t.name, "status": "exists"})
                continue
            # Clone table into new metadata so create_all works on target engine
            t.to_metadata(new_meta)
            tables_to_create.append(t.name)

        if tables_to_create:
            def _create_sync(sync_conn):
                new_meta.create_all(bind=sync_conn)

            async with target_engine.connect() as tconn:
                await tconn.run_sync(_create_sync)
                await tconn.commit()

            for name in tables_to_create:
                results.append({"table": name, "status": "created"})

        # 5. Stamp alembic_version on target so future migrations work
        if not dry_run:
            try:
                async with target_engine.connect() as tconn:
                    # Read current alembic head from source
                    async with source_engine.connect() as sconn:
                        if await table_exists(sconn, "alembic_version"):
                            r = await sconn.execute(text("SELECT version_num FROM alembic_version"))
                            head = r.scalar()
                            if head:
                                await tconn.execute(text(
                                    "CREATE TABLE IF NOT EXISTS alembic_version "
                                    "(version_num VARCHAR(32) NOT NULL PRIMARY KEY)"
                                ))
                                await tconn.execute(text("DELETE FROM alembic_version"))
                                await tconn.execute(
                                    text("INSERT INTO alembic_version (version_num) VALUES (:v)"),
                                    {"v": head},
                                )
                                await tconn.commit()
                                print(f"  📌 Stamped alembic_version = {head}")
            except Exception as e:
                print(f"  ⚠️  Could not stamp alembic_version: {e}")

    finally:
        await source_engine.dispose()
        await target_engine.dispose()

    return results


# ──────────────────────────── Main ──────────────────────────────


async def run_sync(
    direction: str,
    tables: list[str] | None = None,
    dry_run: bool = False,
    create_schema: bool = False,
):
    if direction == "pull":
        source_url, target_url = SUPABASE_URL, LOCAL_URL
        label = "Supabase → Local"
    else:
        source_url, target_url = LOCAL_URL, SUPABASE_URL
        label = "Local → Supabase"

    # ── Auto-discover tables from source if not specified ──
    source_engine_tmp = create_async_engine(source_url, echo=False, **_engine_kwargs(source_url))
    try:
        async with source_engine_tmp.connect() as sconn:
            all_source_tables = await discover_tables(sconn)
    finally:
        await source_engine_tmp.dispose()

    if tables:
        tables_to_sync = tables
    else:
        tables_to_sync = merge_table_order(TABLES_ORDERED, all_source_tables)

    # Show any auto-discovered tables not in TABLES_ORDERED
    if not tables:
        extra = [t for t in tables_to_sync if t not in set(TABLES_ORDERED)]
        if extra:
            print(f"  🔍 Auto-discovered extra tables: {', '.join(extra)}")

    # ── Create schema on target if requested ──
    if create_schema:
        print(f"\n{'='*60}")
        print(f"  Schema Sync: {label}")
        print(f"{'='*60}\n")

        schema_results = await sync_schema(
            source_url, target_url, tables_to_sync, dry_run
        )
        for r in schema_results:
            status = r["status"]
            if status == "created":
                print(f"  ✅ Created table '{r['table']}'")
            elif status == "exists":
                print(f"  ⏭️  Table '{r['table']}' already exists")
            elif status == "dry-run":
                print(f"  📋 Would create '{r['table']}' ({r['columns']} columns)")

        if dry_run:
            return schema_results

    # For push/delete operations, reverse order to handle FK deps
    # (children deleted first, parents last → then insert parents first)
    delete_order = list(reversed(tables_to_sync))

    print(f"\n{'='*60}")
    print(f"  Data Sync: {label}")
    print(f"  Tables: {', '.join(tables_to_sync)}")
    print(f"  Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    source_engine = create_async_engine(source_url, echo=False, **_engine_kwargs(source_url))
    target_engine = create_async_engine(target_url, echo=False, **_engine_kwargs(target_url))

    results = []

    try:
        async with source_engine.connect() as source_conn, \
                   target_engine.connect() as target_conn:

            # Disable FK checks during sync for the target connection
            if not dry_run:
                await target_conn.execute(
                    text("SET session_replication_role = 'replica';")
                )

            for table in tables_to_sync:
                print(f"  ⏳ Syncing '{table}'...", end=" ", flush=True)
                try:
                    result = await sync_table(
                        source_conn, target_conn, table, dry_run
                    )
                    results.append(result)

                    if result["status"] == "synced":
                        print(f"✅ {result['rows']} rows")
                    elif result["status"] == "dry-run":
                        print(
                            f"📋 source={result['source_rows']}, "
                            f"target={result['target_rows']}"
                        )
                    else:
                        print(f"⏭️  {result.get('reason', '')}")
                except Exception as e:
                    print(f"❌ Error: {e}")
                    results.append({"table": table, "status": "error", "error": str(e)})

            # Re-enable FK checks
            if not dry_run:
                await target_conn.execute(
                    text("SET session_replication_role = 'origin';")
                )
                await target_conn.commit()

    finally:
        await source_engine.dispose()
        await target_engine.dispose()

    # Summary
    synced = sum(1 for r in results if r["status"] == "synced")
    skipped = sum(1 for r in results if r["status"] == "skipped")
    errors = sum(1 for r in results if r["status"] == "error")
    total_rows = sum(r.get("rows", 0) for r in results if r["status"] == "synced")

    print(f"\n{'─'*60}")
    print(f"  Done! Synced: {synced} tables ({total_rows} rows)")
    if skipped:
        print(f"  Skipped: {skipped}")
    if errors:
        print(f"  Errors: {errors}")
    print(f"{'─'*60}\n")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Sync data between Supabase and Local PostgreSQL"
    )
    parser.add_argument(
        "direction",
        choices=["pull", "push", "schema"],
        help="pull = Supabase→Local, push = Local→Supabase, schema = create tables on target",
    )
    parser.add_argument(
        "--tables",
        type=str,
        default=None,
        help="Comma-separated list of tables to sync (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be synced without making changes",
    )
    parser.add_argument(
        "--create-schema",
        action="store_true",
        help="Create missing tables on target before syncing data",
    )
    parser.add_argument(
        "--target",
        choices=["supabase", "local"],
        default="supabase",
        help="Target for schema command (default: supabase)",
    )

    args = parser.parse_args()
    tables = args.tables.split(",") if args.tables else None

    if args.direction == "schema":
        # Schema-only mode: create tables on target
        if args.target == "supabase":
            source_url, target_url = LOCAL_URL, SUPABASE_URL
            label = "Local → Supabase"
        else:
            source_url, target_url = SUPABASE_URL, LOCAL_URL
            label = "Supabase → Local"

        print(f"\n{'='*60}")
        print(f"  Schema Sync: {label}")
        print(f"  Mode: {'DRY RUN' if args.dry_run else 'LIVE'}")
        print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        results = asyncio.run(sync_schema(source_url, target_url, tables, args.dry_run))
        for r in results:
            status = r["status"]
            if status == "created":
                print(f"  ✅ Created table '{r['table']}'")
            elif status == "exists":
                print(f"  ⏭️  Table '{r['table']}' already exists")
            elif status == "dry-run":
                print(f"  📋 Would create '{r['table']}' ({r['columns']} columns)")

        created = sum(1 for r in results if r["status"] == "created")
        existed = sum(1 for r in results if r["status"] == "exists")
        print(f"\n{'─'*60}")
        print(f"  Done! Created: {created}, Already existed: {existed}")
        print(f"{'─'*60}\n")
    else:
        asyncio.run(run_sync(args.direction, tables, args.dry_run, args.create_schema))


if __name__ == "__main__":
    main()
