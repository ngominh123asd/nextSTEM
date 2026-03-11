"""Embedding / vector search schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class EmbedRequest(BaseModel):
    """Request to embed and store a text chunk."""
    content: str = Field(..., min_length=1, max_length=50_000)
    document_id: uuid.UUID | None = None
    source_type: str = "document"


class SemanticSearchRequest(BaseModel):
    """Request to search for similar chunks."""
    query: str = Field(..., min_length=1, max_length=5000)
    top_k: int = Field(default=5, ge=1, le=50)


class ChunkRead(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID | None
    source_type: str
    content: str
    score: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}