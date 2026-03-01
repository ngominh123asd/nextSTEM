"""Admin service – dashboard stats & user management."""

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, update, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.admin import AuditLog


# ── Dashboard ────────────────────────────────────────────────
async def get_dashboard_stats(db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    total = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active = (
        await db.execute(
            select(func.count(User.id)).where(User.is_active.is_(True))
        )
    ).scalar() or 0
    new_today = (
        await db.execute(
            select(func.count(User.id)).where(User.created_at >= today_start)
        )
    ).scalar() or 0
    new_week = (
        await db.execute(
            select(func.count(User.id)).where(User.created_at >= week_start)
        )
    ).scalar() or 0

    role_rows = (
        await db.execute(
            select(User.role, func.count(User.id)).group_by(User.role)
        )
    ).all()
    grade_rows = (
        await db.execute(
            select(User.grade, func.count(User.id))
            .where(User.grade.isnot(None))
            .group_by(User.grade)
        )
    ).all()

    return {
        "total_users": total,
        "active_users": active,
        "inactive_users": total - active,
        "new_users_today": new_today,
        "new_users_week": new_week,
        "users_by_role": {r: c for r, c in role_rows},
        "users_by_grade": {g: c for g, c in grade_rows},
    }
