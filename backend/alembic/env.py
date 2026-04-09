"""Alembic env.py – async migration runner."""

import asyncio
import ssl as _ssl
from logging.config import fileConfig

import sys
import os

# Add the backend directory to sys.path so that 'app' module can be found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import settings
from app.database import Base

# Import all models so Alembic sees them
import app.models  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _engine_kwargs() -> dict:
    """Build engine kwargs matching database.py (SSL for production)."""
    kwargs: dict = {}
    if settings.is_production:
        ssl_ctx = _ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = _ssl.CERT_NONE
        kwargs["connect_args"] = {"ssl": ssl_ctx}
    return kwargs


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs())
    async with engine.connect() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())