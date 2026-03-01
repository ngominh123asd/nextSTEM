"""Document (Academic Editor) service."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate


async def list_documents(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Document]:
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.updated_at.desc())
    )
    return list(result.scalars().all())


async def create_document(
    db: AsyncSession, user_id: uuid.UUID, data: DocumentCreate
) -> Document:
    doc = Document(user_id=user_id, **data.model_dump())
    db.add(doc)
    await db.flush()
    return doc


async def get_document(
    db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID
) -> Document | None:
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id, Document.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def update_document(
    db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID, data: DocumentUpdate
) -> Document | None:
    doc = await get_document(db, doc_id, user_id)
    if doc is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    await db.flush()
    return doc


async def delete_document(
    db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    doc = await get_document(db, doc_id, user_id)
    if doc is None:
        return False
    await db.delete(doc)
    return True
