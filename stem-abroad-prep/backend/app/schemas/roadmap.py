"""Roadmap schemas."""

import uuid
from pydantic import BaseModel


class RoadmapTaskRead(BaseModel):
    id: uuid.UUID
    order: int
    text: str
    done: bool

    model_config = {"from_attributes": True}


class RoadmapStepRead(BaseModel):
    id: uuid.UUID
    order: int
    title: str
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    duration: str | None = None
    tasks: list[RoadmapTaskRead] = []

    model_config = {"from_attributes": True}


class RoadmapRead(BaseModel):
    id: uuid.UUID
    title: str
    steps: list[RoadmapStepRead] = []

    model_config = {"from_attributes": True}


class RoadmapTaskToggle(BaseModel):
    done: bool
