"""Roadmap endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
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
