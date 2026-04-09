"""Digital Twin Student (DTS) API endpoints.

Provides aggregated learner profile, snapshots, timeline,
and activity log access.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services import dts_service

router = APIRouter(prefix="/dts", tags=["dts"])


@router.get("/profile")
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full aggregated DTS profile.

    Combines: user info, competency scores, portfolio stats,
    personalization variables, and recent activities.
    """
    profile = await dts_service.get_dts_profile(db, user.id)
    if not profile:
        raise HTTPException(404, "User profile not found")
    return profile


@router.post("/snapshot", status_code=201)
async def create_snapshot(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a DTS snapshot of the current learner state.

    Captures all competency scores, profile completeness,
    and personalization variables at this point in time.
    """
    snapshot = await dts_service.create_snapshot(db, user.id)
    return {
        "id": str(snapshot.id),
        "profile_completeness": snapshot.profile_completeness,
        "overall_score": snapshot.overall_score,
        "created_at": snapshot.created_at.isoformat() if snapshot.created_at else None,
    }


@router.get("/snapshots")
async def list_snapshots(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
):
    """Get historical DTS snapshots."""
    snapshots = await dts_service.get_snapshots(db, user.id, limit=limit)
    return [
        {
            "id": str(s.id),
            "competency_summary": s.competency_summary,
            "profile_completeness": s.profile_completeness,
            "overall_score": s.overall_score,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in snapshots
    ]


@router.get("/timeline")
async def get_timeline(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get competency change timeline from snapshots.

    Returns data points showing how competency scores
    have changed over time, enabling trend analysis.
    """
    return await dts_service.get_timeline(db, user.id)


@router.get("/activities")
async def list_activities(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 30,
):
    """Get recent learner activity events."""
    activities = await dts_service.get_recent_activities(db, user.id, limit=limit)
    return [
        {
            "id": str(a.id),
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "event_metadata": a.event_metadata,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]
