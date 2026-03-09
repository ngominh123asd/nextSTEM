"""Chat session & message endpoints, including AI proxy."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionRead,
    ChatSessionList,
    ChatMessageCreate,
    ChatMessageRead,
)
from app.services import chat_service
from app.services.ai_client import ai_run, ai_run_stream

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/sessions", response_model=list[ChatSessionList])
async def list_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await chat_service.list_sessions(db, user.id)


@router.post("/sessions", response_model=ChatSessionRead, status_code=201)
async def create_session(
    body: ChatSessionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await chat_service.create_session(
        db, user.id, body.mode, body.title
    )
    return session


@router.get("/sessions/{session_id}", response_model=ChatSessionRead)
async def get_session(
    session_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await chat_service.get_session(db, session_id, user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post(
    "/sessions/{session_id}/messages",
    response_model=ChatMessageRead,
    status_code=201,
)
async def send_message(
    session_id: uuid.UUID,
    body: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify session belongs to user
    session = await chat_service.get_session(db, session_id, user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    msg = await chat_service.add_message(db, session_id, "user", body.content)
    return msg


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await chat_service.delete_session(db, session_id, user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")


class SessionRenameRequest(BaseModel):
    title: str


@router.patch("/sessions/{session_id}", response_model=ChatSessionRead)
async def rename_session(
    session_id: uuid.UUID,
    body: SessionRenameRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await chat_service.update_session_title(
        db, session_id, user.id, body.title
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/sessions/{session_id}/messages/{message_id}", status_code=204)
async def delete_message(
    session_id: uuid.UUID,
    message_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ok = await chat_service.delete_message(db, message_id, user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Message not found")


# ────────────────────────────────────────────────────────────
# AI Service proxy
# ────────────────────────────────────────────────────────────

class AIMessageRequest(BaseModel):
    content: str
    mode: str = "general"


@router.post("/sessions/{session_id}/ai")
async def ai_chat(
    session_id: uuid.UUID,
    body: AIMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a user message to the external AI service (non-streaming).
    Saves both user message and AI response in the DB.
    """
    session = await chat_service.get_session(db, session_id, user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    await chat_service.add_message(db, session_id, "user", body.content)

    try:
        result = await ai_run(
            message=body.content,
            session_id=str(session_id),
            user_id=str(user.id),
            workflow="advisor_chat",
        )
        ai_text = result.get("response") or result.get("result", "")
    except Exception as e:
        logger.error("AI service error: %s", e)
        raise HTTPException(status_code=502, detail="AI service unavailable")

    # Save AI response
    ai_msg = await chat_service.add_message(db, session_id, "ai", ai_text)
    await db.commit()

    return {"role": "ai", "content": ai_text, "id": str(ai_msg.id)}


@router.post("/sessions/{session_id}/ai/stream")
async def ai_chat_stream(
    session_id: uuid.UUID,
    body: AIMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Stream AI response via SSE. Saves user message before streaming.
    The frontend is responsible for sending the final AI text back
    to save (or we save it post-stream).
    """
    session = await chat_service.get_session(db, session_id, user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    await chat_service.add_message(db, session_id, "user", body.content)
    await db.commit()

    async def event_generator():
        try:
            async for chunk in ai_run_stream(
                message=body.content,
                session_id=str(session_id),
                user_id=str(user.id),
                workflow="advisor_chat",
            ):
                yield chunk
        except Exception as e:
            logger.error("AI stream error: %s", e)
            yield f"data: {{\"event\":\"error\",\"data\":\"AI service unavailable\"}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )


@router.post("/sessions/{session_id}/ai/save")
async def save_ai_message(
    session_id: uuid.UUID,
    body: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save the final AI response after streaming completes."""
    session = await chat_service.get_session(db, session_id, user.id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    msg = await chat_service.add_message(db, session_id, "ai", body.content)
    await db.commit()
    return {"id": str(msg.id), "role": "ai", "content": body.content}
