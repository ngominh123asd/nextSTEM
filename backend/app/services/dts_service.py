"""DTS (Digital Twin Student) service — profile aggregation, snapshots, activity logging."""

import uuid
import logging
from datetime import datetime

from sqlalchemy import select, func as sa_func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.portfolio import Project, Certificate, Activity
from app.models.dts import DTSSnapshot, LearnerActivityLog
from app.services import competency_service

logger = logging.getLogger(__name__)


# ── Activity Logging ──────────────────────────────────────────

async def log_activity(
    db: AsyncSession,
    user_id: uuid.UUID,
    action: str,
    entity_type: str | None = None,
    entity_id: str | None = None,
    event_metadata: dict | None = None,
) -> LearnerActivityLog:
    """Record a learner activity event."""
    log = LearnerActivityLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        event_metadata=event_metadata,
    )
    db.add(log)
    await db.flush()
    return log


async def get_recent_activities(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[LearnerActivityLog]:
    """Get recent activity logs for a user."""
    result = await db.execute(
        select(LearnerActivityLog)
        .where(LearnerActivityLog.user_id == user_id)
        .order_by(LearnerActivityLog.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Profile Aggregation ──────────────────────────────────────

async def get_dts_profile(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Aggregate all data into a single DTS profile view."""
    # Get user info
    user = await db.get(User, user_id)
    if not user:
        return {}

    # Get portfolio stats
    proj_count = await db.scalar(
        select(sa_func.count()).select_from(Project).where(Project.user_id == user_id)
    )
    cert_count = await db.scalar(
        select(sa_func.count()).select_from(Certificate).where(Certificate.user_id == user_id)
    )
    activity_count = await db.scalar(
        select(sa_func.count()).select_from(Activity).where(Activity.user_id == user_id)
    )

    # Get competency data
    radar_data = await competency_service.get_radar_data(db, user_id)

    # Build competency summary
    competency_summary = []
    for point in radar_data["data"]:
        level = max(1, min(5, int(point["score"] / 20) + 1)) if point["score"] > 0 else 0
        competency_summary.append({
            "competency_code": point["competency_code"],
            "competency_name": point["competency_name"],
            "avg_score": point["score"],
            "level": level,
            "indicators": [],  # Could be enriched later
        })

    # Compute profile completeness
    completeness = _compute_profile_completeness(
        user=user,
        proj_count=proj_count or 0,
        cert_count=cert_count or 0,
        assessed_indicators=radar_data["assessed_indicators"],
        total_indicators=radar_data["total_indicators"],
    )

    # Build personalization variables (Liu et al., 2024)
    personalization_vars = _build_personalization_vars(
        user=user,
        proj_count=proj_count or 0,
        cert_count=cert_count or 0,
        overall_score=radar_data["overall_score"],
    )

    # Get recent activities
    recent = await get_recent_activities(db, user_id, limit=10)

    return {
        "user_id": str(user.id),
        "name": user.name,
        "email": user.email,
        "grade": user.grade,
        "school": user.school,
        "competency_summary": competency_summary,
        "overall_score": radar_data["overall_score"],
        "project_count": proj_count or 0,
        "certificate_count": cert_count or 0,
        "activity_count": activity_count or 0,
        "personalization_vars": personalization_vars,
        "profile_completeness": completeness,
        "recent_activities": [
            {
                "id": str(a.id),
                "action": a.action,
                "entity_type": a.entity_type,
                "entity_id": a.entity_id,
                "event_metadata": a.event_metadata,
                "created_at": a.created_at.isoformat(),
            }
            for a in recent
        ],
        "assessed_indicators": radar_data["assessed_indicators"],
        "total_indicators": radar_data["total_indicators"],
    }


def _compute_profile_completeness(
    user: User,
    proj_count: int,
    cert_count: int,
    assessed_indicators: int,
    total_indicators: int,
) -> float:
    """Compute profile completeness percentage (0-100)."""
    score = 0.0
    total = 100.0

    # Basic info (20%)
    if user.name:
        score += 5
    if user.email:
        score += 5
    if user.grade:
        score += 5
    if user.school:
        score += 5

    # Goals & interests (15%)
    if user.goals and len(user.goals) > 0:
        score += 7.5
    if user.interests and len(user.interests) > 0:
        score += 7.5

    # Portfolio (25%)
    if proj_count >= 1:
        score += 10
    if proj_count >= 3:
        score += 5
    if cert_count >= 1:
        score += 5
    if cert_count >= 2:
        score += 5

    # Competency assessment (40%)
    if total_indicators > 0:
        ratio = assessed_indicators / total_indicators
        score += ratio * 40

    return round(min(score, total), 1)


def _build_personalization_vars(
    user: User,
    proj_count: int,
    cert_count: int,
    overall_score: float,
) -> dict:
    """Build personalization variable groups (Liu et al., 2024).

    4 groups:
    1. academic_profile: Foundation knowledge, readiness
    2. learning_style: Visual, hands-on, textual preference
    3. engagement_level: Motivation, focus, interaction
    4. career_orientation: Field alignment
    """
    return {
        "academic_profile": {
            "grade": user.grade,
            "school": user.school,
            "subjects": user.subjects,
            "certificate_count": cert_count,
            "overall_competency_score": overall_score,
        },
        "learning_style": {
            # Will be populated from quiz results / AI analysis
            "preference": "not_assessed",
            "visual_score": None,
            "hands_on_score": None,
            "textual_score": None,
        },
        "engagement_level": {
            "project_count": proj_count,
            "has_active_projects": proj_count > 0,
            "activity_streak": 0,  # Will be computed from activity logs
        },
        "career_orientation": {
            "goals": user.goals or [],
            "interests": user.interests or [],
            "stem_field_alignment": None,  # AI will compute
        },
    }


# ── Snapshots ─────────────────────────────────────────────────

async def create_snapshot(db: AsyncSession, user_id: uuid.UUID) -> DTSSnapshot:
    """Create a new DTS snapshot capturing the current state."""
    profile = await get_dts_profile(db, user_id)

    snapshot = DTSSnapshot(
        user_id=user_id,
        snapshot_data=profile,
        competency_summary={
            cs["competency_code"]: {
                "name": cs["competency_name"],
                "avg_score": cs["avg_score"],
                "level": cs["level"],
            }
            for cs in profile.get("competency_summary", [])
        },
        personalization_vars=profile.get("personalization_vars"),
        profile_completeness=profile.get("profile_completeness", 0),
        overall_score=profile.get("overall_score", 0),
    )
    db.add(snapshot)
    await db.flush()

    # Log the snapshot creation
    await log_activity(
        db, user_id, "snapshot_created",
        entity_type="dts_snapshot", entity_id=str(snapshot.id),
    )

    return snapshot


async def get_snapshots(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[DTSSnapshot]:
    """Get historical snapshots for a user."""
    result = await db.execute(
        select(DTSSnapshot)
        .where(DTSSnapshot.user_id == user_id)
        .order_by(DTSSnapshot.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_timeline(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Build a timeline of competency changes over time from snapshots."""
    snapshots = await get_snapshots(db, user_id, limit=50)

    if not snapshots:
        # If no snapshots, return current state only
        radar = await competency_service.get_radar_data(db, user_id)
        return {
            "points": [{
                "date": datetime.utcnow().isoformat(),
                "overall_score": radar["overall_score"],
                "competency_scores": {
                    p["competency_code"]: p["score"]
                    for p in radar["data"]
                },
            }],
            "current_score": radar["overall_score"],
            "score_change": 0,
        }

    points = []
    for snap in reversed(snapshots):  # oldest first
        comp_scores = {}
        if snap.competency_summary:
            for code, data in snap.competency_summary.items():
                comp_scores[code] = data.get("avg_score", 0)

        points.append({
            "date": snap.created_at.isoformat(),
            "overall_score": snap.overall_score,
            "competency_scores": comp_scores,
        })

    current_score = points[-1]["overall_score"] if points else 0
    first_score = points[0]["overall_score"] if points else 0

    return {
        "points": points,
        "current_score": current_score,
        "score_change": round(current_score - first_score, 1),
    }
