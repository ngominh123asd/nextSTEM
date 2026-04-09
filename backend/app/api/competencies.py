"""STEM Competency API endpoints.

Provides access to the STEM competency framework (GDPT 2018),
user scores, radar chart data, and strength/weakness analysis.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.competency import (
    CompetencyRead,
    CompetencyScoreCreate,
    CompetencyScoreRead,
    CompetencyScoreBatch,
    CompetencyRadarResponse,
    CompetencyAnalysisResponse,
)
from app.services import competency_service, dts_service

router = APIRouter(prefix="/competencies", tags=["competencies"])


@router.get("/framework", response_model=list[CompetencyRead])
async def get_framework(
    db: AsyncSession = Depends(get_db),
):
    """Get the full STEM competency framework (public).

    Returns 5 competency components with 15 behavioral indicators.
    """
    framework = await competency_service.get_framework(db)
    if not framework:
        # Auto-seed if empty
        await competency_service.seed_default_framework(db)
        await db.commit()
        framework = await competency_service.get_framework(db)
    return framework


@router.get("/scores", response_model=list[CompetencyScoreRead])
async def get_scores(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's latest competency scores."""
    return await competency_service.get_user_scores(db, user.id)


@router.post("/scores", response_model=CompetencyScoreRead, status_code=201)
async def create_score(
    body: CompetencyScoreCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a new competency score for a behavioral indicator."""
    indicator = await competency_service.get_indicator_by_id(db, body.indicator_id)
    if not indicator:
        raise HTTPException(404, "Behavioral indicator not found")

    score = await competency_service.upsert_score(
        db,
        user_id=user.id,
        indicator_id=body.indicator_id,
        score=body.score,
        level=body.level,
        source=body.source,
        evidence_note=body.evidence_note,
    )

    # Log the assessment activity
    await dts_service.log_activity(
        db, user.id, "skill_assessed",
        entity_type="behavioral_indicator",
        entity_id=str(body.indicator_id),
        event_metadata={
            "score": body.score,
            "level": body.level,
            "source": body.source,
            "indicator_code": indicator.code,
        },
    )

    return score


@router.post("/scores/batch", status_code=201)
async def batch_scores(
    body: CompetencyScoreBatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit multiple competency scores at once."""
    scores = await competency_service.batch_upsert_scores(
        db,
        user_id=user.id,
        scores=[s.model_dump() for s in body.scores],
    )

    # Log batch assessment
    await dts_service.log_activity(
        db, user.id, "batch_skill_assessed",
        entity_type="competency_scores",
        event_metadata={"count": len(scores)},
    )

    return {"created": len(scores)}


@router.get("/radar")
async def get_radar(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get radar chart data for the current user.

    Returns aggregated scores per competency component for visualization.
    """
    # Auto-seed framework if needed
    framework = await competency_service.get_framework(db)
    if not framework:
        await competency_service.seed_default_framework(db)
        await db.commit()

    return await competency_service.get_radar_data(db, user.id)


@router.get("/analysis")
async def get_analysis(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze current user's strengths and weaknesses."""
    return await competency_service.get_analysis(db, user.id)
