"""Roadmap models: Roadmap → Steps → Tasks."""

import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Boolean, DateTime, ForeignKey, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), default="Lộ trình du học")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    steps: Mapped[list["RoadmapStep"]] = relationship(
        back_populates="roadmap", cascade="all, delete-orphan",
        order_by="RoadmapStep.order",
    )


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    roadmap_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roadmaps.id", ondelete="CASCADE"), index=True
    )
    order: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(50))
    color: Mapped[str | None] = mapped_column(String(80))
    duration: Mapped[str | None] = mapped_column(String(50))

    roadmap: Mapped["Roadmap"] = relationship(back_populates="steps")
    tasks: Mapped[list["RoadmapTask"]] = relationship(
        back_populates="step", cascade="all, delete-orphan",
        order_by="RoadmapTask.order",
    )


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    step_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roadmap_steps.id", ondelete="CASCADE"),
        index=True,
    )
    order: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(String(500))
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    step: Mapped["RoadmapStep"] = relationship(back_populates="tasks")
