"""Schemas for the dedicated AI profile."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class AIProfileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    gpa_value: float | None = None
    gpa_scale: float | None = None
    target_countries: list[str] | None = None
    target_fields: list[str] | None = None
    budget_amount: float | None = None
    budget_currency: str | None = None
    needs_scholarship: bool | None = None
    ielts: float | None = None
    toefl: float | None = None
    sat: int | None = None
    act: int | None = None
    intake_year: int | None = None
    intake_term: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AIProfileUpdate(BaseModel):
    gpa_value: float | None = None
    gpa_scale: float | None = None
    target_countries: list[str] | None = None
    target_fields: list[str] | None = None
    budget_amount: float | None = None
    budget_currency: str | None = None
    needs_scholarship: bool | None = None
    ielts: float | None = None
    toefl: float | None = None
    sat: int | None = None
    act: int | None = None
    intake_year: int | None = None
    intake_term: str | None = None
