"""Roadmap endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.roadmap import RoadmapRead, RoadmapTaskToggle, RoadmapTaskRead
from app.services import roadmap_service

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.get("", response_model=RoadmapRead | None)
async def get_roadmap(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await roadmap_service.get_roadmap(db, user.id)


@router.post("/generate", response_model=RoadmapRead, status_code=201)
async def generate_roadmap(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await roadmap_service.generate_roadmap(db, user.id)


class SaveAIRoadmapRequest(BaseModel):
    ai_json: str  # Raw JSON string from Gemini


@router.post("/save-ai", response_model=RoadmapRead, status_code=201)
async def save_ai_roadmap(
    body: SaveAIRoadmapRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save an AI-generated roadmap from Gemini JSON output.

    Called by frontend after streaming completes with the full JSON text
    from /gemini/roadmap. Parses and persists as real roadmap records.
    """
    roadmap = await roadmap_service.generate_ai_roadmap(db, user.id, body.ai_json)
    return roadmap


@router.patch(
    "/tasks/{task_id}", response_model=RoadmapTaskRead
)
async def toggle_task(
    task_id: uuid.UUID,
    body: RoadmapTaskToggle,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = await roadmap_service.toggle_task(db, task_id, body.done)
    if task is None:
        raise HTTPException(404, "Task not found")
    return task