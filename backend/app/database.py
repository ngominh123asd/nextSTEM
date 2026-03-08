"""Async SQLAlchemy engine & session factory."""

import ssl as _ssl

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _engine_kwargs() -> dict:
    """Build extra engine kwargs depending on environment."""
    kwargs: dict = {
        "echo": False,
        "pool_pre_ping": True,       # recycle stale connections
    }
    if settings.is_production:
        # Supabase requires SSL; create a default SSL context
        ssl_ctx = _ssl.create_default_context()
        kwargs.update({
            "pool_size": 5,
            "max_overflow": 10,
            "connect_args": {"ssl": ssl_ctx},
        })
    return kwargs


engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs())

async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """Dependency – yields an async DB session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
