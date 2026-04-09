"""Dedicated AI profile model for tool-critical student facts."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AIProfile(Base):
    __tablename__ = "ai_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    gpa_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    gpa_scale: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_countries: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )
    target_fields: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    budget_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    budget_currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
    needs_scholarship: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ielts: Mapped[float | None] = mapped_column(Float, nullable=True)
    toefl: Mapped[float | None] = mapped_column(Float, nullable=True)
    sat: Mapped[int | None] = mapped_column(Integer, nullable=True)
    act: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intake_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intake_term: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User")
