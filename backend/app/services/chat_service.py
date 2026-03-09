"""Chat session & message service."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import ChatSession, ChatMessage


async def list_sessions(
    db: AsyncSession, user_id: uuid.UUID
) -> list[dict]:
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc())
        .limit(50)
    )
    sessions = list(result.scalars().all())
    out = []
    for s in sessions:
        last_msg = None
        if s.messages:
            last = sorted(s.messages, key=lambda m: m.created_at)[-1]
            last_msg = last.content[:120]
        out.append({
            "id": s.id,
            "mode": s.mode,
            "title": s.title,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "last_message": last_msg,
        })
    return out


async def get_session(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> ChatSession | None:
    result = await db.execute(
        select(ChatSession)
        .options(selectinload(ChatSession.messages))
        .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_session(
    db: AsyncSession, user_id: uuid.UUID, mode: str, title: str | None
) -> ChatSession:
    session = ChatSession(user_id=user_id, mode=mode, title=title)
    session.messages = []  # eagerly initialise for serialisation
    db.add(session)
    await db.flush()
    return session


async def add_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    role: str,
    content: str,
) -> ChatMessage:
    msg = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(msg)
    await db.flush()
    return msg


async def delete_session(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    session = await get_session(db, session_id, user_id)
    if session is None:
        return False
    await db.delete(session)
    await db.flush()
    return True


async def delete_message(
    db: AsyncSession, message_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    result = await db.execute(
        select(ChatMessage)
        .join(ChatSession, ChatMessage.session_id == ChatSession.id)
        .where(ChatMessage.id == message_id, ChatSession.user_id == user_id)
    )
    msg = result.scalar_one_or_none()
    if msg is None:
        return False
    await db.delete(msg)
    await db.flush()
    return True


async def update_session_title(
    db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID, title: str
) -> ChatSession | None:
    session = await get_session(db, session_id, user_id)
    if session is None:
        return None
    session.title = title
    await db.flush()
    return session
