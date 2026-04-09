"""Service layer for the dedicated AI profile."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_profile import AIProfile
from app.schemas.ai_profile import AIProfileUpdate


async def get_ai_profile(db: AsyncSession, user_id) -> AIProfile:
    result = await db.execute(select(AIProfile).where(AIProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = AIProfile(user_id=user_id)
        db.add(profile)
        await db.flush()
    return profile


async def update_ai_profile(
    db: AsyncSession, user_id, data: AIProfileUpdate
) -> AIProfile:
    profile = await get_ai_profile(db, user_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.flush()
    return profile
