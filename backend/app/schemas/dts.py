"""Digital Twin Student (DTS) Pydantic schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class ActivityLogRead(BaseModel):
    """A single learner activity event."""
    id: uuid.UUID
    action: str
    entity_type: str | None = None
    entity_id: str | None = None
    event_metadata: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DTSSnapshotRead(BaseModel):
    """A point-in-time Digital Twin snapshot."""
    id: uuid.UUID
    competency_summary: dict | None = None
    personalization_vars: dict | None = None
    profile_completeness: float
    overall_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class DTSCompetencySummary(BaseModel):
    """Competency summary inside a DTS profile."""
    competency_code: str
    competency_name: str
    avg_score: float
    level: int
    indicators: list[dict]


class DTSProfileRead(BaseModel):
    """Full aggregated DTS profile."""
    user_id: uuid.UUID
    name: str
    email: str
    grade: str | None = None
    school: str | None = None

    # Competency overview
    competency_summary: list[DTSCompetencySummary]
    overall_score: float

    # Portfolio stats
    project_count: int
    certificate_count: int
    activity_count: int

    # Personalization variables (Liu et al., 2024)
    personalization_vars: dict

    # Profile completeness
    profile_completeness: float

    # Recent activities
    recent_activities: list[ActivityLogRead]

    # Assessment stats
    assessed_indicators: int
    total_indicators: int


class DTSTimelinePoint(BaseModel):
    """A single point in the competency timeline."""
    date: datetime
    overall_score: float
    competency_scores: dict  # {code: score}


class DTSTimelineResponse(BaseModel):
    """Timeline of competency changes over time."""
    points: list[DTSTimelinePoint]
    current_score: float
    score_change: float  # difference from first to last
