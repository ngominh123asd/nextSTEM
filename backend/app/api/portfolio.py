"""Portfolio endpoints: projects, certificates, activities."""

import uuid
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse
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

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "certificates"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


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


@router.post("/certificates/upload")
async def upload_cert_file(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload a certificate file (PDF or image, max 5MB)."""
    if not file.filename:
        raise HTTPException(400, "No file provided")

    # Validate file type
    allowed = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"File type not allowed. Allowed: {', '.join(allowed)}")

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Maximum 5MB.")

    # Save with unique name
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_name
    file_path.write_bytes(content)

    file_url = f"/api/v1/portfolio/certificates/files/{unique_name}"
    # Build base URL dynamically from the incoming request
    base_url = str(request.base_url).rstrip("/")
    return {"file_url": f"{base_url}{file_url}", "file_name": file.filename}


@router.get("/certificates/files/{filename}")
async def download_cert_file(filename: str):
    """Serve a certificate file inline (for preview in iframes/img tags)."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, "File not found")

    # Detect mime type so browser renders the file inline
    import mimetypes
    mime, _ = mimetypes.guess_type(str(file_path))
    if mime is None:
        mime = "application/octet-stream"

    return FileResponse(
        file_path,
        media_type=mime,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


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