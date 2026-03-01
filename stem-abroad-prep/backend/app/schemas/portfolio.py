"""Portfolio schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    status: str = "Đang phát triển"
    progress: int = 0
    date_label: str | None = None


class ProjectRead(ProjectCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class CertificateCreate(BaseModel):
    title: str
    score: str | None = None
    date: str | None = None
    organisation: str | None = None


class CertificateRead(CertificateCreate):
    id: uuid.UUID

    model_config = {"from_attributes": True}


class ActivityRead(BaseModel):
    id: uuid.UUID
    event: str
    icon: str | None = None
    color: str | None = None
    date_label: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
