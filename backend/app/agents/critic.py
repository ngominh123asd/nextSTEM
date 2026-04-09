"""CriticAgent — Stub agent for reviewing and iterating on agent outputs."""

import logging
from typing import Any

from pydantic import BaseModel

logger = logging.getLogger(__name__)


class CriticReview(BaseModel):
    """Kết quả đánh giá từ Critic."""

    approved: bool
    score: int  # 1-5
    iteration_feedback: str = ""
    strengths: list[str] = []
    weaknesses: list[str] = []


class CriticAgent:
    """Critic agent — đánh giá chất lượng kết quả từ SubAgents.

    Hiện tại là stub, luôn approve với score 3.
    """

    async def review_results(
        self,
        plan: Any,
        agent_results: list[Any],
    ) -> CriticReview:
        """Đánh giá kết quả từ các SubAgents."""
        logger.info("[Critic] Review called (stub implementation)")

        # Stub: always approve with medium score
        return CriticReview(
            approved=True,
            score=3,
            iteration_feedback="",
            strengths=["Results meet minimum quality bar"],
            weaknesses=[],
        )
