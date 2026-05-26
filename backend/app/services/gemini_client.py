"""Gemini AI client using Google GenAI SDK.

Provides streaming generation for Academic Editor, Roadmap, and Widget.
Does NOT replace the existing ai_client.py which serves AI Advisor.
"""

from __future__ import annotations

import json
import logging
from typing import AsyncIterator

from google import genai

from app.config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def gemini_stream(
    message: str,
    *,
    system_instruction: str | None = None,
    model: str = "gemini-2.5-flash",
) -> AsyncIterator[bytes]:
    """
    Stream Gemini response as SSE events.

    Yields raw SSE bytes compatible with the frontend SSE parser:
      event: text_delta
      data: {"delta": "..."}

      event: done
      data: [DONE]
    """
    client = _get_client()

    config = {"temperature": 0.7, "max_output_tokens": 4096}
    if system_instruction:
        config["system_instruction"] = system_instruction

    try:
        response = client.models.generate_content_stream(
            model=model,
            contents=message,
            config=config,
        )

        for chunk in response:
            if chunk.text:
                sse_data = json.dumps({"delta": chunk.text}, ensure_ascii=False)
                yield f"event: text_delta\ndata: {sse_data}\n\n".encode("utf-8")

        yield b"event: done\ndata: [DONE]\n\n"

    except Exception as e:
        logger.error("Gemini stream error: %s", e)
        error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
        yield f"event: error\ndata: {error_data}\n\n".encode("utf-8")
        yield b"event: done\ndata: [DONE]\n\n"
