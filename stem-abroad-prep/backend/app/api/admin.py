"""Admin API routes – dashboard, user management, audit logs."""

import uuid
import secrets
import string

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select, func, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_admin, get_current_user
from app.models.user import User, UserPreference
from app.schemas.admin import (
    DashboardStats,
    AdminUserRead,
    AdminUserUpdate,
    UserListResponse,
    AuditLogListResponse,
)
from app.services.admin_stats import get_dashboard_stats
from app.services.admin_users import (
    list_users,
    admin_update_user,
    write_audit,
    list_audit_logs,
)
from app.utils.security import hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Setup: Promote first user to admin ────────────────────────
@router.post("/setup/promote-first-admin")
async def promote_first_admin(
    db: AsyncSession = Depends(get_db),
):
    """Promote the first registered user to super_admin if no admins exist yet."""
    # Check if any admin already exists
    admin_count = ( 
        await db.execute(
            select(func.count(User.id)).where(User.role.in_(["admin", "super_admin"]))
        )
    ).scalar() or 0
    
    if admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin already exists. Cannot create another.",
        )
    
    # Get the first user (oldest registration)
    first_user = (
        await db.execute(
            select(User).order_by(User.created_at.asc()).limit(1)
        )
    ).scalars().first()
    
    if not first_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No users found. Please register first.",
        )
    
    # Promote the first user
    first_user.role = "super_admin"
    first_user.status = "active"
    await db.commit()
    
    return {
        "detail": "Successfully promoted to super_admin",
        "email": first_user.email,
        "role": first_user.role,
    }


# ── Dashboard ────────────────────────────────────────────────
@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_dashboard_stats(db)


# ── User list ────────────────────────────────────────────────
@router.get("/users", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    role: str | None = None,
    status: str | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await list_users(
        db, page, page_size, search, role, status, sort_by, sort_dir
    )


# ── Get single user ─────────────────────────────────────────
@router.get("/users/{user_id}", response_model=AdminUserRead)
async def get_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


# ── Update user ──────────────────────────────────────────────
@router.put("/users/{user_id}", response_model=AdminUserRead)
async def update_user(
    user_id: uuid.UUID,
    body: AdminUserUpdate,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    user = await admin_update_user(db, user_id, data)
    if not user:
        raise HTTPException(404, "User not found")
    await write_audit(
        db, admin.id, "user.update",
        target_type="user", target_id=str(user_id),
        details=data, ip=request.client.host if request.client else None,
    )
    return user


# ── Delete / deactivate user ────────────────────────────────
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    user.status = "deactivated"
    await db.commit()
    await write_audit(
        db, admin.id, "user.deactivate",
        target_type="user", target_id=str(user_id),
        ip=request.client.host if request.client else None,
    )
    return {"detail": "User deactivated"}


# ── Hard delete user (permanent) ─────────────────────────────
@router.delete("/users/{user_id}/hard")
async def hard_delete_user(
    user_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "super_admin":
        raise HTTPException(403, "Cannot delete a super_admin")
    user_email = user.email
    await db.execute(
        sa_delete(UserPreference).where(UserPreference.user_id == user_id)
    )
    await db.delete(user)
    await db.commit()
    await write_audit(
        db, admin.id, "user.hard_delete",
        target_type="user", target_id=str(user_id),
        details={"email": user_email},
        ip=request.client.host if request.client else None,
    )
    return {"detail": "User permanently deleted"}


# ── Reset user password ──────────────────────────────────────
@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    # Generate a random temporary password
    alphabet = string.ascii_letters + string.digits
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))
    user.hashed_password = hash_password(temp_password)
    await db.commit()
    await write_audit(
        db, admin.id, "user.reset_password",
        target_type="user", target_id=str(user_id),
        ip=request.client.host if request.client else None,
    )
    return {"detail": "Password reset", "temp_password": temp_password}


# ── Suspend user ─────────────────────────────────────────────
@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "super_admin":
        raise HTTPException(403, "Cannot suspend a super_admin")
    user.status = "suspended"
    user.is_active = False
    await db.commit()
    await db.refresh(user)
    await write_audit(
        db, admin.id, "user.suspend",
        target_type="user", target_id=str(user_id),
        ip=request.client.host if request.client else None,
    )
    return {"detail": "User suspended", "status": user.status}


# ── Ban user permanently ─────────────────────────────────────
@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "super_admin":
        raise HTTPException(403, "Cannot ban a super_admin")
    user.status = "banned"
    user.is_active = False
    await db.commit()
    await db.refresh(user)
    await write_audit(
        db, admin.id, "user.ban",
        target_type="user", target_id=str(user_id),
        ip=request.client.host if request.client else None,
    )
    return {"detail": "User banned permanently", "status": user.status}


# ── Audit logs ───────────────────────────────────────────────
@router.get("/logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: str | None = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await list_audit_logs(db, page, page_size, action)
