"""Portfolio service – projects, certificates, activities."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio import Project, Certificate, Activity


async def list_projects(db: AsyncSession, user_id: uuid.UUID) -> list[Project]:
    result = await db.execute(
        select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
    )
    return list(result.scalars().all())


async def create_project(db: AsyncSession, user_id: uuid.UUID, **kwargs) -> Project:
    proj = Project(user_id=user_id, **kwargs)
    db.add(proj)
    await db.flush()
    return proj


async def delete_project(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    proj = result.scalar_one_or_none()
    if proj is None:
        return False
    await db.delete(proj)
    return True


async def list_certificates(db: AsyncSession, user_id: uuid.UUID) -> list[Certificate]:
    result = await db.execute(select(Certificate).where(Certificate.user_id == user_id))
    return list(result.scalars().all())


async def create_certificate(db: AsyncSession, user_id: uuid.UUID, **kwargs) -> Certificate:
    cert = Certificate(user_id=user_id, **kwargs)
    db.add(cert)
    await db.flush()
    return cert


async def list_activities(db: AsyncSession, user_id: uuid.UUID) -> list[Activity]:
    result = await db.execute(
        select(Activity).where(Activity.user_id == user_id).order_by(Activity.created_at.desc()).limit(20)
    )
    return list(result.scalars().all())
