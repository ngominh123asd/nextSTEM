"""User & preference schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class UserRead(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str = "user"
    grade: str | None = None
    school: str | None = None
    subjects: str | None = None
    goals: list[str] | None = None
    interests: list[str] | None = None
    is_active: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    grade: str | None = None
    school: str | None = None
    subjects: str | None = None
    goals: list[str] | None = None
    interests: list[str] | None = None


class OnboardingRequest(BaseModel):
    name: str
    goals: list[str]
    grade: str
    school: str
    subjects: str
    interests: list[str]


class PreferenceRead(BaseModel):
    language: str = "vi"
    notify_email: bool = True
    notify_push: bool = True
    notify_weekly: bool = False

    model_config = {"from_attributes": True}


class PreferenceUpdate(BaseModel):
    language: str | None = None
    notify_email: bool | None = None
    notify_push: bool | None = None
    notify_weekly: bool | None = None
