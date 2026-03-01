"""Admin service – user list, update, audit log."""

import uuid
import math

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.admin import AuditLog


# ── User list with pagination, search, filter ────────────────
async def list_users(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    role: str | None = None,
    status: str | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
) -> dict:
    q = select(User)
    cnt_q = select(func.count(User.id))

    if search:
        like = f"%{search}%"
        flt = or_(User.name.ilike(like), User.email.ilike(like))
        q = q.where(flt)
        cnt_q = cnt_q.where(flt)
    if role:
        q = q.where(User.role == role)
        cnt_q = cnt_q.where(User.role == role)
    if status:
        q = q.where(User.status == status)
        cnt_q = cnt_q.where(User.status == status)

    total = (await db.execute(cnt_q)).scalar() or 0

    col = getattr(User, sort_by, User.created_at)
    order = col.desc() if sort_dir == "desc" else col.asc()
    q = q.order_by(order).offset((page - 1) * page_size).limit(page_size)

    rows = (await db.execute(q)).scalars().all()
    return {
        "items": rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total / page_size)),
    }


# ── Update user (admin) ─────────────────────────────────────
async def admin_update_user(
    db: AsyncSession, user_id: uuid.UUID, data: dict
) -> User | None:
    user = await db.get(User, user_id)
    if user is None:
        return None
    for k, v in data.items():
        if v is not None:
            setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user


# ── Audit log helpers ────────────────────────────────────────
async def write_audit(
    db: AsyncSession,
    actor_id: uuid.UUID,
    action: str,
    target_type: str | None = None,
    target_id: str | None = None,
    details: dict | None = None,
    ip: str | None = None,
) -> None:
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        ip_address=ip,
    )
    db.add(log)
    await db.commit()


async def list_audit_logs(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 50,
    action: str | None = None,
) -> dict:
    q = select(AuditLog)
    cnt_q = select(func.count(AuditLog.id))
    if action:
        q = q.where(AuditLog.action == action)
        cnt_q = cnt_q.where(AuditLog.action == action)
    total = (await db.execute(cnt_q)).scalar() or 0
    q = (
        q.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    rows = (await db.execute(q)).scalars().all()
    return {"items": rows, "total": total, "page": page, "page_size": page_size}
