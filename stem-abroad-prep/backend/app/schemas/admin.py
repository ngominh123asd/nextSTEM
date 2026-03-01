"""Admin-related Pydantic schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel


# ── Dashboard Stats ──────────────────────────────────────────
class DashboardStats(BaseModel):
    total_users: int = 0
    active_users: int = 0
    inactive_users: int = 0
    new_users_today: int = 0
    new_users_week: int = 0
    users_by_role: dict[str, int] = {}
    users_by_grade: dict[str, int] = {}


# ── User Management ─────────────────────────────────────────
class AdminUserRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    status: str
    grade: str | None = None
    school: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AdminUserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    status: str | None = None
    grade: str | None = None
    school: str | None = None
    is_active: bool | None = None


class UserListResponse(BaseModel):
    items: list[AdminUserRead]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Audit Log ────────────────────────────────────────────────
class AuditLogRead(BaseModel):
    id: uuid.UUID
    actor_id: uuid.UUID | None
    action: str
    target_type: str | None
    target_id: str | None
    details: dict | None
    ip_address: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    items: list[AuditLogRead]
    total: int
    page: int
    page_size: int


# ── System Settings ──────────────────────────────────────────
class SystemSettingRead(BaseModel):
    key: str
    value: dict | None
    description: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}


class SystemSettingUpdate(BaseModel):
    value: dict
    description: str | None = None
