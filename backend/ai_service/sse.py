"""SSE helpers for AI service."""

import json
from typing import Any


def sse_event(event: str, data: dict[str, Any]) -> str:
    """Format a single Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

