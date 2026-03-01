"""User profile & preferences service."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserPreference
from app.schemas.user import UserUpdate, OnboardingRequest, PreferenceUpdate


async def update_profile(
    db: AsyncSession, user: User, data: UserUpdate
) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    return user


async def complete_onboarding(
    db: AsyncSession, user: User, data: OnboardingRequest
) -> User:
    user.name = data.name
    user.goals = data.goals
    user.grade = data.grade
    user.school = data.school
    user.subjects = data.subjects
    user.interests = data.interests
    await db.flush()
    return user


async def get_preference(db: AsyncSession, user_id) -> UserPreference:
    result = await db.execute(
        select(UserPreference).where(UserPreference.user_id == user_id)
    )
    pref = result.scalar_one_or_none()
    if pref is None:
        pref = UserPreference(user_id=user_id)
        db.add(pref)
        await db.flush()
    return pref


async def update_preference(
    db: AsyncSession, user_id, data: PreferenceUpdate
) -> UserPreference:
    pref = await get_preference(db, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pref, field, value)
    await db.flush()
    return pref
