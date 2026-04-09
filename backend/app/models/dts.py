"""Digital Twin Student (DTS) models.

DTSSnapshot: Periodic capture of the learner's full state — competency
scores, profile completeness, personalization variables (academic profile,
learning style, engagement level, career orientation).

LearnerActivityLog: Event stream for every meaningful learner action,
enabling stealth assessment and learning analytics.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Float, DateTime, ForeignKey, func, JSON,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DTSSnapshot(Base):
    """Ảnh chụp trạng thái Digital Twin tại một thời điểm."""
    __tablename__ = "dts_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    # Full aggregate data at this point in time
    snapshot_data: Mapped[dict | None] = mapped_column(JSONB)

    # Competency summary: {competency_code: {avg_score, level, indicators: [...]}}
    competency_summary: Mapped[dict | None] = mapped_column(JSONB)

    # Personalization variables (Liu et al., 2024):
    # academic_profile, learning_style, engagement_level, career_orientation
    personalization_vars: Mapped[dict | None] = mapped_column(JSONB)

    # Profile completeness percentage (0-100)
    profile_completeness: Mapped[float] = mapped_column(Float, default=0.0)

    # Overall competency score (weighted average)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class LearnerActivityLog(Base):
    """Event log: mọi hoạt động có ý nghĩa của người học.

    Actions include:
    - project_created, project_updated, project_completed
    - cert_added, cert_removed
    - skill_assessed (self/peer/ai)
    - quiz_completed, quiz_scored
    - roadmap_task_completed
    - resource_viewed, resource_bookmarked
    - ai_chat_session
    - snapshot_created
    """
    __tablename__ = "learner_activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str | None] = mapped_column(String(50))
    entity_id: Mapped[str | None] = mapped_column(String(100))
    event_metadata: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
