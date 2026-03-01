"""Redis-backed session helpers (store / retrieve / revoke)."""

import json
import uuid

from app.redis import get_redis


SESSION_PREFIX = "session:"
SESSION_TTL = 3600  # 1 hour


async def create_session(user_id: uuid.UUID) -> str:
    """Create a session in Redis. Returns session_id."""
    r = get_redis()
    sid = str(uuid.uuid4())
    key = f"{SESSION_PREFIX}{sid}"
    await r.set(key, json.dumps({"user_id": str(user_id)}), ex=SESSION_TTL)
    return sid


async def get_session(sid: str) -> dict | None:
    """Retrieve session data or None if expired / missing."""
    r = get_redis()
    raw = await r.get(f"{SESSION_PREFIX}{sid}")
    if raw is None:
        return None
    return json.loads(raw)


async def revoke_session(sid: str) -> None:
    """Delete a session from Redis."""
    r = get_redis()
    await r.delete(f"{SESSION_PREFIX}{sid}")


async def extend_session(sid: str) -> None:
    """Refresh TTL for an active session."""
    r = get_redis()
    await r.expire(f"{SESSION_PREFIX}{sid}", SESSION_TTL)
