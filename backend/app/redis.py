"""Redis connection helper (cache + session store)."""

import logging
import ssl as _ssl

from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

redis: Redis | None = None


async def init_redis() -> Redis | None:
    """Create and return the global Redis client.

    Returns None (instead of crashing) when Redis is unreachable so the
    API can still serve traffic that doesn't require cache/sessions.
    """
    global redis
    kwargs: dict = {"decode_responses": True}
    # Upstash uses rediss:// (TLS); create an SSL context
    if settings.REDIS_URL.startswith("rediss://"):
        ssl_ctx = _ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = _ssl.CERT_NONE
        kwargs["ssl"] = ssl_ctx
    try:
        redis = Redis.from_url(settings.REDIS_URL, **kwargs)
        # Verify connectivity
        await redis.ping()
        logger.info("Redis connected successfully")
        return redis
    except Exception as exc:
        logger.warning("Redis connection failed (%s): %s — running without cache", type(exc).__name__, exc)
        redis = None
        return None


async def close_redis() -> None:
    """Gracefully shut down the Redis connection."""
    global redis
    if redis:
        await redis.close()
        redis = None


def get_redis() -> Redis | None:
    """Dependency – returns the active Redis instance, or None if unavailable."""
    return redis
