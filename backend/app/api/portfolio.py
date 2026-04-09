"""Portfolio endpoints: projects, certificates, activities."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.portfolio import (
    ProjectCreate,
    ProjectRead,
    CertificateCreate,
    CertificateRead,
    ActivityRead,
)
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# ── Projects ─────────────────────────────────────────────────

@router.get("/projects", response_model=list[ProjectRead])
async def list_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.list_projects(db, user.id)


@router.post("/projects", response_model=ProjectRead, status_code=201)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.create_project(db, user.id, **body.model_dump())


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await portfolio_service.delete_project(db, project_id, user.id)
    if not ok:
        raise HTTPException(404, "Project not found")


# ── Certificates ──────────────────────────────────────────────

@router.get("/certificates", response_model=list[CertificateRead])
async def list_certs(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.list_certificates(db, user.id)


@router.post("/certificates", response_model=CertificateRead, status_code=201)
async def create_cert(
    body: CertificateCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.create_certificate(db, user.id, **body.model_dump())


@router.delete("/certificates/{cert_id}", status_code=204)
async def delete_cert(
    cert_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    from app.models.portfolio import Certificate
    result = await db.execute(
        select(Certificate).where(Certificate.id == cert_id, Certificate.user_id == user.id)
    )
    cert = result.scalar_one_or_none()
    if cert is None:
        raise HTTPException(404, "Certificate not found")
    await db.delete(cert)


# ── Activities (Timeline) ─────────────────────────────────────

class ActivityCreate(BaseModel):
    event: str
    icon: str | None = "star"
    color: str | None = "from-blue-500 to-indigo-500"
    date_label: str | None = None


@router.get("/activities", response_model=list[ActivityRead])
async def list_activities(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.list_activities(db, user.id)


@router.post("/activities", response_model=ActivityRead, status_code=201)
async def create_activity(
    body: ActivityCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.create_activity(db, user.id, **body.model_dump())


@router.delete("/activities/{activity_id}", status_code=204)
async def delete_activity(
    activity_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await portfolio_service.delete_activity(db, activity_id, user.id)
    if not ok:
        raise HTTPException(404, "Activity not found")