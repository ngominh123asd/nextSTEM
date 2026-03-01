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

Requires both DATABASE URLs configured in .env or passed via CLI.
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime

from sqlalchemy import delete, inspect, text
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
    "roadmaps",
    "roadmap_steps",
    "roadmap_tasks",
    "chat_sessions",
    "chat_messages",
    "audit_logs",
    "system_settings",
]

# ──────────────────────────── Helpers ───────────────────────────


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


# ──────────────────────────── Main ──────────────────────────────


async def run_sync(
    direction: str,
    tables: list[str] | None = None,
    dry_run: bool = False,
):
    if direction == "pull":
        source_url, target_url = SUPABASE_URL, LOCAL_URL
        label = "Supabase → Local"
    else:
        source_url, target_url = LOCAL_URL, SUPABASE_URL
        label = "Local → Supabase"

    tables_to_sync = tables or TABLES_ORDERED

    # For push/delete operations, reverse order to handle FK deps
    # (children deleted first, parents last → then insert parents first)
    delete_order = list(reversed(tables_to_sync))

    print(f"\n{'='*60}")
    print(f"  Data Sync: {label}")
    print(f"  Tables: {', '.join(tables_to_sync)}")
    print(f"  Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    source_engine = create_async_engine(source_url, echo=False)
    target_engine = create_async_engine(target_url, echo=False)

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
        choices=["pull", "push"],
        help="pull = Supabase→Local, push = Local→Supabase",
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

    args = parser.parse_args()
    tables = args.tables.split(",") if args.tables else None

    asyncio.run(run_sync(args.direction, tables, args.dry_run))


if __name__ == "__main__":
    main()
