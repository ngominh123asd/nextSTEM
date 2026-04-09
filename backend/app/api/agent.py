"""Agent API — SSE streaming endpoint cho AI Agent system.

POST /api/v1/agent/chat → SSE stream (Server-Sent Events)
"""

import json
import logging
import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.ai_profile import AIProfileRead, AIProfileUpdate
from app.services import ai_profile_service
from app.utils.security import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])


class AgentChatRequest(BaseModel):
    message: str
    mode: str = "general"  # general | career | university | essay
    session_id: str | None = None


# ─────────────────────────── Singleton AgentLoop ───────────────────────────

_agent_loop = None


def _get_agent_loop():
    """Lazy-init AgentLoop singleton."""
    global _agent_loop
    if _agent_loop is None:
        from app.agents.agent_loop import AgentLoop
        from app.agents.subagents.advisor import AdvisorAgent

        agents = {
            "advisor": AdvisorAgent(),
            # Phase 4-5: thêm các agents khác
            # "stem_coach": STEMCoachAgent(),
            # "scoring": ScoringAgent(),
            # "counselor": CounselorAgent(),
        }
        _agent_loop = AgentLoop(agents=agents)
        logger.info("AgentLoop initialized with agents: %s", list(agents.keys()))
    return _agent_loop


# ─────────────────────────── SSE Streaming ───────────────────────────


def _sse_event(event: str, data: dict) -> str:
    """Format 1 SSE event."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def _load_profile_context(
    request: Request,
    db: AsyncSession,
) -> tuple[dict | None, str]:
    """Best-effort authenticated profile loading for AI chat."""

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None, "Guest"

    token = auth_header.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload:
        return None, "Guest"

    user_id = payload.get("sub")
    if not user_id:
        return None, "Guest"

    try:
        user = await db.get(User, uuid.UUID(str(user_id)))
    except Exception:
        logger.warning("Failed to resolve auth user for AI chat", exc_info=True)
        return None, "Guest"

    if user is None or not user.is_active:
        return None, "Guest"

    ai_profile = await ai_profile_service.get_ai_profile(db, user.id)
    merged_profile = {
        "grade": user.grade,
        "school": user.school,
        "subjects": user.subjects,
        "goals": user.goals,
        "interests": user.interests,
        "gpa_value": ai_profile.gpa_value,
        "gpa_scale": ai_profile.gpa_scale,
        "target_countries": ai_profile.target_countries,
        "target_fields": ai_profile.target_fields,
        "budget_amount": ai_profile.budget_amount,
        "budget_currency": ai_profile.budget_currency,
        "needs_scholarship": ai_profile.needs_scholarship,
        "ielts": ai_profile.ielts,
        "toefl": ai_profile.toefl,
        "sat": ai_profile.sat,
        "act": ai_profile.act,
        "intake_year": ai_profile.intake_year,
        "intake_term": ai_profile.intake_term,
    }
    return merged_profile, user.name or "Authenticated User"


@router.get("/profile", response_model=AIProfileRead)
async def get_agent_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's dedicated AI profile."""
    return await ai_profile_service.get_ai_profile(db, user.id)


@router.put("/profile", response_model=AIProfileRead)
async def update_agent_profile(
    body: AIProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's dedicated AI profile."""
    return await ai_profile_service.update_ai_profile(db, user.id, body)


@router.post("/chat")
async def agent_chat(
    body: AgentChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """SSE streaming endpoint — gọi AgentLoop và stream kết quả.

    Auth is checked but optional during dev (khi DB chưa chạy).
    """
    # Try to get user context, but do not fail the chat if auth/db is unavailable.
    user_name = "Guest"
    profile_context = None
    try:
        profile_context, user_name = await _load_profile_context(request, db)
    except Exception:
        logger.warning("Failed to load AI profile context for chat", exc_info=True)

    async def event_stream():
        agent_loop = _get_agent_loop()
        collected_text = ""

        async def progress_callback(event_type: str, data: dict):
            """Gửi SSE events cho từng stage của AgentLoop."""
            nonlocal collected_text

            if event_type == "text_delta":
                delta = data.get("delta", "")
                collected_text += delta
                yield _sse_event("text_delta", {"delta": delta})
            else:
                yield _sse_event(event_type, data)

        # Vì progress_callback là async generator, ta cần approach khác
        # Dùng asyncio.Queue để bridge giữa callback và SSE stream
        import asyncio

        event_queue: asyncio.Queue = asyncio.Queue()
        final_result = {}

        async def _progress_cb(event_type: str, data: dict):
            await event_queue.put((event_type, data))

        async def _run_agent():
            nonlocal final_result
            try:
                result = await agent_loop.execute(
                    user_query=body.message,
                    session_id=body.session_id,
                    progress_callback=_progress_cb,
                    mode=body.mode,
                    profile_context=profile_context,
                )
                final_result = result
            except Exception as e:
                logger.error(f"Agent error: {e}", exc_info=True)
                await event_queue.put(("error", {"error": str(e)}))
            finally:
                await event_queue.put(None)  # Signal done

        # Start agent task
        task = asyncio.create_task(_run_agent())

        # Stream events from queue
        while True:
            item = await event_queue.get()
            if item is None:
                break
            event_type, data = item
            yield _sse_event(event_type, data)

        # Final result
        if final_result and hasattr(final_result, "model_dump"):
            yield _sse_event("final_result", {
                "success": final_result.success,
                "answer": final_result.final_answer,
                "mode": final_result.query_type,
                "metrics": final_result.metrics,
            })

        yield _sse_event("done", {})

        # Ensure task completed
        await task

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/health")
async def agent_health():
    """Health check — kiểm tra agent system."""
    try:
        loop = _get_agent_loop()
        agents = list(loop.orchestrator.agents.keys())
        return {
            "status": "ok",
            "agents": agents,
            "agent_count": len(agents),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
