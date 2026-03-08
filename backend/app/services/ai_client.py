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
        "ai_run  req=%s session=%s user=%s",
        request_id, session_id, user_id,
    )

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"{_base_url()}/api/v1/ai/run",
            json=payload,
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()

    latency = time.monotonic() - t0
    logger.info("ai_run  req=%s latency=%.2fs", request_id, latency)
    return data


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
        "ai_stream  req=%s session=%s user=%s",
        request_id, session_id, user_id,
    )

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        async with client.stream(
            "POST",
            f"{_base_url()}/api/v1/ai/run/stream",
            json=payload,
            headers=_headers(),
        ) as resp:
            resp.raise_for_status()
            # Use aiter_bytes for minimal buffering (true streaming)
            buf = ""
            async for raw in resp.aiter_bytes():
                buf += raw.decode("utf-8", errors="replace")
                # Flush complete SSE blocks (delimited by \n\n)
                while "\n\n" in buf:
                    block, buf = buf.split("\n\n", 1)
                    yield block + "\n\n"

    latency = time.monotonic() - t0
    logger.info("ai_stream  req=%s latency=%.2fs", request_id, latency)
