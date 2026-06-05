"""Async SQLAlchemy engine + session.

The engine is created lazily so the app boots even with no DATABASE_URL.
`statement_cache_size=0` keeps asyncpg working behind the Supabase pooler.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


class Base(DeclarativeBase):
    pass


def get_engine() -> AsyncEngine:
    global _engine, _sessionmaker
    if _engine is None:
        if not settings.db_enabled:
            raise RuntimeError("DATABASE_URL is not configured")
        _engine = create_async_engine(
            settings.DATABASE_URL,
            connect_args={"statement_cache_size": 0},
            pool_pre_ping=True,
        )
        _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


async def get_db() -> AsyncIterator[AsyncSession]:
    get_engine()
    assert _sessionmaker is not None
    async with _sessionmaker() as session:
        yield session
