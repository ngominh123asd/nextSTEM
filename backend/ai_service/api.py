"""AI API — separate service endpoint(s).

This service is meant to be deployed on its own URL and called by the core backend.

Endpoints:
- POST /api/v1/ai/run/stream   (SSE)
- POST /api/v1/ai/run          (non-stream)
- GET  /api/v1/ai/health
"""

from __future__ import annotations

import asyncio
import logging
from inspect import Parameter, signature
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ai_service.settings import ai_settings
from ai_service.sse import sse_event
from ai_service.workflows import get_agent_loop_for_workflow, get_workflow_spec

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


class AIRunRequest(BaseModel):
    message: str = Field(..., description="User message / query")
    workflow: str = Field("advisor_chat", description="Workflow id")
    session_id: str | None = Field(None, description="Conversation session id")
    profile_context: dict[str, Any] | None = Field(
        None,
        description=(
            "Optional structured profile context from the core backend. "
            "Unknown keys are allowed for forward compatibility."
        ),
    )

    # Optional context provided by the caller (core backend)
    user_id: str | None = None


def _execute_with_optional_profile_context(
    loop: Any,
    *,
    user_query: str,
    session_id: str | None,
    progress_callback: Any,
    profile_context: dict[str, Any] | None,
):
    """Call the agent loop in a backward-compatible way.

    The standalone AI service accepts `profile_context` now, but the running
    loop may not yet support it. We only forward it when the callable signature
    can accept the kwarg, so older runtimes keep working unchanged.
    """

    execute_kwargs: dict[str, Any] = {
        "user_query": user_query,
        "session_id": session_id,
        "progress_callback": progress_callback,
    }

    if profile_context is not None:
        try:
            execute_sig = signature(loop.execute)
            accepts_profile_context = (
                "profile_context" in execute_sig.parameters
                or any(
                    param.kind == Parameter.VAR_KEYWORD
                    for param in execute_sig.parameters.values()
                )
            )
        except (TypeError, ValueError):
            accepts_profile_context = False

        if accepts_profile_context:
            execute_kwargs["profile_context"] = profile_context

    return loop.execute(**execute_kwargs)


def _require_api_key(x_api_key: str | None):
    required = (ai_settings.AI_API_KEY or "").strip()
    if not required:
        return
    if not x_api_key or x_api_key.strip() != required:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.get("/health")
async def ai_health():
    return {
        "status": "ok",
        "workflows": sorted(list(get_workflow_spec(w).workflow_id for w in ["advisor_chat"])),
    }


@router.post("/run")
async def ai_run(body: AIRunRequest, x_api_key: str | None = Header(default=None)):
    """Non-streaming execution."""
    _require_api_key(x_api_key)

    loop = get_agent_loop_for_workflow(body.workflow)
    result = await _execute_with_optional_profile_context(
        loop,
        user_query=body.message,
        session_id=body.session_id,
        progress_callback=None,
        profile_context=body.profile_context,
    )
    return result.model_dump()


@router.post("/run/stream")
async def ai_run_stream(
    body: AIRunRequest,
    request: Request,
    x_api_key: str | None = Header(default=None),
):
    """SSE streaming: trace events + text deltas + final_result."""
    _require_api_key(x_api_key)

    async def event_stream():
        loop = get_agent_loop_for_workflow(body.workflow)

        event_queue: asyncio.Queue[Any] = asyncio.Queue()
        final_result: Any | None = None
        collected: dict[str, Any] = {
            "workflow": body.workflow,
            "session_id": body.session_id,
            "user_id": body.user_id,
            "profile_context": body.profile_context,
            "tool_calls": [],
            "tool_results": [],
        }

        async def _progress_cb(event_type: str, data: dict):
            # collect tool traces to also return at the end
            if event_type == "tool_call":
                collected["tool_calls"].append(data)
            elif event_type == "tool_result":
                collected["tool_results"].append(data)

            await event_queue.put((event_type, data))

        async def _run_agent():
            nonlocal final_result
            try:
                final_result = await _execute_with_optional_profile_context(
                    loop,
                    user_query=body.message,
                    session_id=body.session_id,
                    progress_callback=_progress_cb,
                    profile_context=body.profile_context,
                )
            except Exception as e:
                logger.error("[AIService] Agent error: %s", e, exc_info=True)
                await event_queue.put(("error", {"error": str(e)}))
            finally:
                await event_queue.put(None)  # Signal done

        task = asyncio.create_task(_run_agent())

        # Stream queued events
        while True:
            if await request.is_disconnected():
                task.cancel()
                break

            item = await event_queue.get()
            if item is None:
                break
            event_type, data = item
            yield sse_event(event_type, data)

        # Final result
        if final_result is not None and hasattr(final_result, "model_dump"):
            payload = final_result.model_dump()
            payload["trace"] = collected
            yield sse_event("final_result", payload)

        yield sse_event("done", {})

        # Ensure task completed
        try:
            await task
        except asyncio.CancelledError:
            pass

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

