"""Authentication service (register / login)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserPreference
from app.utils.security import hash_password, verify_password, create_access_token


async def register_user(
    db: AsyncSession, *, name: str, email: str, password: str
) -> tuple[User, str]:
    """Create user + default prefs. Returns (user, access_token)."""
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(user)
    await db.flush()

    pref = UserPreference(user_id=user.id)
    db.add(pref)
    await db.flush()

    token = create_access_token({"sub": str(user.id)})
    return user, token


async def authenticate_user(
    db: AsyncSession, *, email: str, password: str
) -> tuple[User, str]:
    """Verify credentials. Returns (user, access_token)."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return user, token
