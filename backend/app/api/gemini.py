"""Gemini AI proxy endpoint — DTS-enhanced.

Serves:
- /gemini/stream          — general streaming (existing)
- /gemini/recommend       — DTS-personalized recommendations (NEW)
- /gemini/roadmap         — AI-generated personalized roadmap (NEW)
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services.gemini_client import gemini_stream
from app.services import dts_service, competency_service
from app.services.recommendation_service import (
    build_recommendation_prompt,
    build_ai_roadmap_prompt,
    build_chat_system_prompt,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gemini", tags=["gemini"])


def _check_gemini():
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API not configured")


# ── Existing general stream ──────────────────────────────────

class GeminiRequest(BaseModel):
    message: str
    system_instruction: str | None = None


@router.post("/stream")
async def gemini_stream_endpoint(
    body: GeminiRequest,
    user: User = Depends(get_current_user),
):
    """Stream Gemini AI response via SSE (general purpose)."""
    _check_gemini()
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


# ── DTS-personalized recommendations ────────────────────────

@router.post("/recommend")
async def gemini_recommend(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream personalized learning recommendations based on DTS profile.

    Fetches the user's DTS profile and competency analysis, builds a
    context-aware prompt, and streams JSON recommendations from Gemini.
    """
    _check_gemini()

    # Gather DTS context
    try:
        dts_profile = await dts_service.get_dts_profile(db, user.id)
        analysis = await competency_service.get_analysis(db, user.id)
    except Exception as e:
        logger.warning("Could not load DTS context: %s", e)
        dts_profile = {}
        analysis = None

    prompt = build_recommendation_prompt(dts_profile, analysis)

    logger.info("gemini_recommend user=%s overall_score=%s",
                user.id, dts_profile.get("overall_score", 0))

    return StreamingResponse(
        gemini_stream(
            message=prompt,
            model="gemini-2.5-flash",
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )


# ── AI-generated personalized roadmap ───────────────────────

@router.post("/roadmap")
async def gemini_roadmap(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream an AI-generated personalized roadmap based on DTS profile.

    Uses the learner's competency gaps, goals, and portfolio state to
    generate a structured 5-phase roadmap as streaming JSON.
    """
    _check_gemini()

    try:
        dts_profile = await dts_service.get_dts_profile(db, user.id)
        analysis = await competency_service.get_analysis(db, user.id)
    except Exception as e:
        logger.warning("Could not load DTS context for roadmap: %s", e)
        dts_profile = {}
        analysis = None

    prompt = build_ai_roadmap_prompt(dts_profile, analysis)

    logger.info("gemini_roadmap user=%s", user.id)

    return StreamingResponse(
        gemini_stream(
            message=prompt,
            model="gemini-2.5-flash",
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )


# ── DTS-enhanced chat context ────────────────────────────────

class DTSChatRequest(BaseModel):
    message: str
    mode: str = "general"


@router.post("/chat-context")
async def gemini_chat_with_context(
    body: DTSChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stream a DTS-context-enriched chat response.

    Builds a personalized system prompt from DTS profile then streams
    Gemini's response. Used by AI Advisor for personalized chat.
    """
    _check_gemini()

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        dts_profile = await dts_service.get_dts_profile(db, user.id)
        analysis = await competency_service.get_analysis(db, user.id)
    except Exception as e:
        logger.warning("Could not load DTS context for chat: %s", e)
        dts_profile = {"name": user.name}
        analysis = None

    system_prompt = build_chat_system_prompt(dts_profile, analysis, body.mode)

    logger.info("gemini_chat_context user=%s mode=%s", user.id, body.mode)

    return StreamingResponse(
        gemini_stream(
            message=body.message,
            system_instruction=system_prompt,
            model="gemini-2.5-flash",
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )
