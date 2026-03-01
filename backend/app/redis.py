"""Redis connection helper (cache + session store)."""

import ssl as _ssl

from redis.asyncio import Redis

from app.config import settings

redis: Redis | None = None


async def init_redis() -> Redis:
    """Create and return the global Redis client."""
    global redis
    kwargs: dict = {"decode_responses": True}
    # Upstash uses rediss:// (TLS); create an SSL context
    if settings.REDIS_URL.startswith("rediss://"):
        ssl_ctx = _ssl.create_default_context()
        kwargs["ssl"] = ssl_ctx
    redis = Redis.from_url(settings.REDIS_URL, **kwargs)
    # Verify connectivity
    await redis.ping()
    return redis


async def close_redis() -> None:
    """Gracefully shut down the Redis connection."""
    global redis
    if redis:
        await redis.close()
        redis = None


def get_redis() -> Redis:
    """Dependency – returns the active Redis instance."""
    if redis is None:
        raise RuntimeError("Redis not initialised")
    return redis
