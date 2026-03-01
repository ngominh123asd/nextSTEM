"""Chat schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageRead(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionCreate(BaseModel):
    mode: str = "general"
    title: str | None = None


class ChatSessionRead(BaseModel):
    id: uuid.UUID
    mode: str
    title: str | None = None
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageRead] = []

    model_config = {"from_attributes": True}


class ChatSessionList(BaseModel):
    id: uuid.UUID
    mode: str
    title: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
