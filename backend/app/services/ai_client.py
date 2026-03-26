"""HTTP client for the external nextSTEM AI Service.

Handles both synchronous (JSON) and streaming (SSE) requests.
The AI service base URL and optional API key are read from settings.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from typing import AsyncIterator

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=10.0)
MAX_RETRIES = 3
INITIAL_BACKOFF = 1.0

def is_transient_error(e: Exception) -> bool:
    if isinstance(e, httpx.HTTPStatusError):
        return e.response.status_code in (500, 502, 503, 504)
    if isinstance(e, httpx.RequestError):
        return True
    return False


def _headers() -> dict[str, str]:
    """Build common request headers, including API key if configured."""
    h: dict[str, str] = {"Content-Type": "application/json"}
    if settings.AI_API_KEY:
        h["X-API-Key"] = settings.AI_API_KEY
    return h


def _base_url() -> str:
    return settings.AI_SERVICE_URL.rstrip("/")


# ────────────────────────────────────────────────────────────
# Non-streaming call  →  POST /api/v1/ai/run
# ────────────────────────────────────────────────────────────

async def ai_run(
    message: str,
    *,
    session_id: str | None = None,
    user_id: str | None = None,
    workflow: str = "advisor_chat",
) -> dict:
    """Call the AI service synchronously and return the JSON result."""
    request_id = str(uuid.uuid4())[:8]
    t0 = time.monotonic()

    payload = {
        "message": message,
        "workflow": workflow,
    }
    if session_id:
        payload["session_id"] = session_id
    if user_id:
        payload["user_id"] = user_id

    logger.info(
        "ai_run  req=%s session=%s user=%s workflow=%s",
        request_id, session_id, user_id, workflow,
    )

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(
                    f"{_base_url()}/api/v1/ai/run",
                    json=payload,
                    headers=_headers(),
                )
                resp.raise_for_status()
                data = resp.json()
                latency = time.monotonic() - t0
                logger.info("ai_run  req=%s latency=%.2fs attempt=%d", request_id, latency, attempt)
                return data
        except Exception as e:
            if attempt == MAX_RETRIES or not is_transient_error(e):
                logger.error("ai_run  req=%s failed attempt=%d error='%s'", request_id, attempt, str(e))
                raise
            backoff = INITIAL_BACKOFF * (2 ** (attempt - 1))
            logger.warning("ai_run  req=%s attempt=%d failed, retrying in %.1fs (error: %s)", request_id, attempt, backoff, str(e))
            await asyncio.sleep(backoff)


# ────────────────────────────────────────────────────────────
# Streaming call  →  POST /api/v1/ai/run/stream  (SSE)
# ────────────────────────────────────────────────────────────

async def ai_run_stream(
    message: str,
    *,
    session_id: str | None = None,
    user_id: str | None = None,
    workflow: str = "advisor_chat",
) -> AsyncIterator[str]:
    """
    Stream SSE events from the AI service.

    Yields raw SSE lines (e.g. ``data: {...}\\n\\n``) that can be
    forwarded directly to the frontend via ``StreamingResponse``.
    """
    request_id = str(uuid.uuid4())[:8]
    t0 = time.monotonic()

    payload = {
        "message": message,
        "workflow": workflow,
    }
    if session_id:
        payload["session_id"] = session_id
    if user_id:
        payload["user_id"] = user_id

    logger.info(
        "ai_stream_start  req=%s session=%s user=%s workflow=%s",
        request_id, session_id, user_id, workflow,
    )

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                async with client.stream(
                    "POST",
                    f"{_base_url()}/api/v1/ai/run/stream",
                    json=payload,
                    headers=_headers(),
                ) as resp:
                    resp.raise_for_status()
                    buf = ""
                    async for raw in resp.aiter_bytes():
                        buf += raw.decode("utf-8", errors="replace")
                        while "\n\n" in buf:
                            block, buf = buf.split("\n\n", 1)
                            
                            # Simple SSE structural parsing for logging
                            lines = block.split("\n")
                            event_name = "message"
                            for line in lines:
                                if line.startswith("event:"):
                                    event_name = line.split(":", 1)[1].strip()
                                    break
                            
                            if event_name in ("text_delta", "clarification_required", "final_result", "done"):
                                logger.debug("ai_stream_event  req=%s event=%s", request_id, event_name)

                            yield block + "\n\n"
                    
                    latency = time.monotonic() - t0
                    logger.info("ai_stream_end  req=%s latency=%.2fs attempt=%d", request_id, latency, attempt)
                    return # Successfully finished streaming
        except Exception as e:
            if attempt == MAX_RETRIES or not is_transient_error(e):
                logger.error("ai_stream  req=%s failed attempt=%d error='%s'", request_id, attempt, str(e))
                raise
            backoff = INITIAL_BACKOFF * (2 ** (attempt - 1))
            logger.warning("ai_stream  req=%s attempt=%d failed, retrying in %.1fs (error: %s)", request_id, attempt, backoff, str(e))
            await asyncio.sleep(backoff)