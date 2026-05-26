"""Password hashing & JWT token helpers."""

import asyncio
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# 10 rounds: ~100ms instead of ~300-500ms at default 12 rounds.
# Still secure (OWASP minimum is 10), but much faster.
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


async def async_hash_password(plain: str) -> str:
    """Non-blocking bcrypt hash — runs in a thread so the event loop stays free."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, hash_password, plain)


async def async_verify_password(plain: str, hashed: str) -> bool:
    """Non-blocking bcrypt verify — runs in a thread so the event loop stays free."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, verify_password, plain, hashed)


def create_access_token(
    data: dict, expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(
        to_encode, settings.SECRET_KEY.get_secret_value(), algorithm=settings.ALGORITHM
    )


def decode_access_token(token: str) -> dict | None:
    """Return payload dict or None if invalid / expired."""
    try:
        return jwt.decode(
            token, settings.SECRET_KEY.get_secret_value(), algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        return None