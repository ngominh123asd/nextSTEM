"""Competency Pydantic schemas for API serialization."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ── Read schemas ──────────────────────────────────────────────

class IndicatorRead(BaseModel):
    """A single behavioral indicator."""
    id: uuid.UUID
    code: str
    name: str
    description: str | None = None
    level_descriptors: dict | None = None
    display_order: int = 0

    model_config = {"from_attributes": True}


class CompetencyRead(BaseModel):
    """A STEM competency component with its indicators."""
    id: uuid.UUID
    code: str
    name: str
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    display_order: int = 0
    indicators: list[IndicatorRead] = []

    model_config = {"from_attributes": True}


class CompetencyScoreRead(BaseModel):
    """A user's score on a specific behavioral indicator."""
    id: uuid.UUID
    user_id: uuid.UUID
    indicator_id: uuid.UUID
    score: float
    level: int
    source: str
    evidence_note: str | None = None
    assessed_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Write schemas ─────────────────────────────────────────────

class CompetencyScoreCreate(BaseModel):
    """Create or update a competency score."""
    indicator_id: uuid.UUID
    score: float = Field(ge=0, le=100)
    level: int = Field(ge=1, le=5, default=1)
    source: str = "self_assessment"
    evidence_note: str | None = None


class CompetencyScoreBatch(BaseModel):
    """Batch update multiple scores at once."""
    scores: list[CompetencyScoreCreate]


# ── Derived / aggregated schemas ──────────────────────────────

class RadarDataPoint(BaseModel):
    """One axis of the radar chart."""
    competency_code: str
    competency_name: str
    score: float  # 0-100, average of indicators
    indicator_count: int
    scored_count: int  # how many indicators have been assessed


class CompetencyRadarResponse(BaseModel):
    """Full radar chart data."""
    data: list[RadarDataPoint]
    overall_score: float
    assessed_indicators: int
    total_indicators: int


class StrengthWeakness(BaseModel):
    """A single strength or weakness item."""
    indicator_code: str
    indicator_name: str
    competency_name: str
    score: float
    level: int
    source: str


class CompetencyAnalysisResponse(BaseModel):
    """Analysis of strengths and weaknesses."""
    strengths: list[StrengthWeakness]
    weaknesses: list[StrengthWeakness]
    overall_score: float
    profile_status: str  # "not_started", "in_progress", "complete"
    recommendations: list[str]
