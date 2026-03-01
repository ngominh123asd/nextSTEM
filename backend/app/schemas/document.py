"""Document schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class DocumentCreate(BaseModel):
    title: str = "Untitled Document"
    content: str | None = None
    doc_type: str = "essay"


class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class DocumentRead(BaseModel):
    id: uuid.UUID
    title: str
    content: str | None = None
    doc_type: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
