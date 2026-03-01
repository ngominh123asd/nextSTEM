"""User profile & preferences endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserRead,
    UserUpdate,
    OnboardingRequest,
    PreferenceRead,
    PreferenceUpdate,
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.put("/me", response_model=UserRead)
async def update_profile(
    body: UserUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await user_service.update_profile(db, user, body)
    return updated


@router.post("/me/onboarding", response_model=UserRead)
async def onboarding(
    body: OnboardingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await user_service.complete_onboarding(db, user, body)
    return updated


@router.get("/me/preferences", response_model=PreferenceRead)
async def get_preferences(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.get_preference(db, user.id)


@router.put("/me/preferences", response_model=PreferenceRead)
async def update_preferences(
    body: PreferenceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await user_service.update_preference(db, user.id, body)
