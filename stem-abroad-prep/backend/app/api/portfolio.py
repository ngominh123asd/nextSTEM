"""Portfolio endpoints: projects, certificates, activities."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
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
    return await portfolio_service.create_project(
        db, user.id, **body.model_dump()
    )


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await portfolio_service.delete_project(db, project_id, user.id)
    if not ok:
        raise HTTPException(404, "Project not found")


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
    return await portfolio_service.create_certificate(
        db, user.id, **body.model_dump()
    )


@router.get("/activities", response_model=list[ActivityRead])
async def list_activities(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await portfolio_service.list_activities(db, user.id)
