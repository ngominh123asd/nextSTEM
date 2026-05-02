"""Authentication service (register / login)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserPreference
from app.utils.security import async_hash_password, async_verify_password, create_access_token


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
        hashed_password=await async_hash_password(password),
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

    if user is None or not await async_verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return user, token


async def oauth_login_user(
    db: AsyncSession, *, email: str, name: str, provider: str
) -> tuple[User, str]:
    """
    Handle OAuth login.
    If email exists, return user and token (linking account).
    If email does not exist, create a new user with a highly secure random password.
    Returns (user, access_token).
    """
    import secrets
    import string

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Generate a random 32-character password for OAuth users
        alphabet = string.ascii_letters + string.digits + string.punctuation
        random_password = "".join(secrets.choice(alphabet) for i in range(32))

        user = User(
            name=name,
            email=email,
            hashed_password=await async_hash_password(random_password),
        )
        db.add(user)
        await db.flush()

        pref = UserPreference(user_id=user.id)
        db.add(pref)
        await db.flush()

    # Issue token for the user
    token = create_access_token({"sub": str(user.id)})
    return user, token