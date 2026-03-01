"""Redis connection helper (cache + session store)."""

from redis.asyncio import Redis

from app.config import settings

redis: Redis | None = None


async def init_redis() -> Redis:
    """Create and return the global Redis client."""
    global redis
    redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
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
