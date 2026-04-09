"""STEM Competency framework models.

Based on the Vietnamese GDPT 2018 framework (Nguyễn T. Nga et al., 2022):
5 competency components × 15 behavioral indicators.

Assessment sources:
- self_assessment: Tự đánh giá
- project_evaluation: Đánh giá dựa trên hiệu suất dự án
- peer_assessment: Đánh giá đồng đẳng
- ai_stealth: Đánh giá ẩn qua AI
- mentor_feedback: Phản hồi từ mentor/giáo viên
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Float, DateTime, ForeignKey, func, JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class STEMCompetency(Base):
    """Năng lực thành tố STEM (5 thành tố)."""
    __tablename__ = "stem_competencies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(50))
    color: Mapped[str | None] = mapped_column(String(50))
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    indicators: Mapped[list["BehavioralIndicator"]] = relationship(
        back_populates="competency",
        cascade="all, delete-orphan",
        order_by="BehavioralIndicator.display_order",
    )


class BehavioralIndicator(Base):
    """Chỉ số hành vi (15 chỉ số, 3 per competency)."""
    __tablename__ = "behavioral_indicators"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    competency_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stem_competencies.id", ondelete="CASCADE"),
        index=True,
    )
    code: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    # JSON: {"level_1": "Mô tả mức 1", ..., "level_5": "Mô tả mức 5"}
    level_descriptors: Mapped[dict | None] = mapped_column(JSON)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    competency: Mapped["STEMCompetency"] = relationship(
        back_populates="indicators"
    )
    scores: Mapped[list["CompetencyScore"]] = relationship(
        back_populates="indicator",
        cascade="all, delete-orphan",
    )


class CompetencyScore(Base):
    """Điểm năng lực người học theo từng chỉ số hành vi.

    Supports multiple assessment types per the evaluation framework:
    - Đánh giá quá trình (process)
    - Đánh giá hiệu suất (performance)
    - Tự đánh giá & đồng đẳng (self/peer)
    - Đánh giá ẩn AI (stealth)
    """
    __tablename__ = "competency_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    indicator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("behavioral_indicators.id", ondelete="CASCADE"),
        index=True,
    )
    score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-100
    level: Mapped[int] = mapped_column(Integer, default=1)  # 1-5
    source: Mapped[str] = mapped_column(
        String(50), default="self_assessment"
    )
    evidence_note: Mapped[str | None] = mapped_column(Text)
    assessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    indicator: Mapped["BehavioralIndicator"] = relationship(
        back_populates="scores"
    )
