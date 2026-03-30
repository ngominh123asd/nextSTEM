"""Gemini AI proxy endpoint.

Serves Academic Editor, Roadmap, and AI Study Coach Widget.
Does NOT require user authentication (uses Gemini API key from backend config).
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import settings
from app.deps import get_current_user
from app.models.user import User
from app.services.gemini_client import gemini_stream

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gemini", tags=["gemini"])


class GeminiRequest(BaseModel):
    message: str
    system_instruction: str | None = None


@router.post("/stream")
async def gemini_stream_endpoint(
    body: GeminiRequest,
    user: User = Depends(get_current_user),
):
    """
    Stream Gemini AI response via SSE.
    Requires authentication to prevent abuse.
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    logger.info("gemini_stream user=%s len=%d", user.id, len(body.message))

    return StreamingResponse(
        gemini_stream(
            message=body.message,
            system_instruction=body.system_instruction,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )
