"""SubAgent base — Interface chung cho tất cả SubAgents.

Mỗi SubAgent kế thừa SubAgentBase, define STAGES và tools riêng.
Orchestrator gọi agent.execute(task) — context hoàn toàn isolated.
"""

import logging
import time
from typing import Any, Callable, Coroutine

from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[str, dict], Coroutine[Any, Any, None]]


class SubAgentBase(BaseAgent):
    """Base class cho tất cả SubAgents.

    Mỗi SubAgent cần override:
    - AGENT_NAME: str
    - STAGES: list[str]
    - _execute_stage(stage, context) → str
    """

    AGENT_NAME: str = "base"
    STAGES: list[str] = []

    def __init__(
        self,
        system_prompt: str,
        model_name: str = "gemini-2.5-flash",
        tools: list | None = None,
    ):
        super().__init__(
            system_prompt=system_prompt,
            model_name=model_name,
            tools=tools,
        )
        self.agent_tools: dict[str, Callable] = {}

    async def execute(
        self,
        task: str,
        progress_callback: ProgressCallback | None = None,
        tool_hints: list[str] | None = None,
        user_query: str | None = None,
        agent_context: dict[str, Any] | None = None,
    ) -> str:
        """Chạy Agent qua tất cả stages.

        Args:
            task: Mô tả công việc từ Orchestrator
            progress_callback: Callback để stream progress lên UI

        Returns:
            Kết quả text cuối cùng
        """
        context = {
            "task": task,
            "results": {},
            "start_time": time.time(),
            "progress_callback": progress_callback,
            "tool_hints": tool_hints or [],
            "user_query": user_query or task,
            "agent_context": agent_context or {},
        }

        # Chạy qua từng stage
        for stage in self.STAGES:
            if progress_callback:
                await progress_callback(
                    "agent_stage",
                    {
                        "agent": self.AGENT_NAME,
                        "stage": stage,
                    },
                )

            try:
                stage_result = await self._execute_stage(stage, context)
                context["results"][stage] = stage_result

                if progress_callback:
                    await progress_callback(
                        "agent_stage_result",
                        {
                            "agent": self.AGENT_NAME,
                            "stage": stage,
                            "chars": len(stage_result or ""),
                            "preview": (stage_result or "")[:400],
                        },
                    )
            except Exception as e:
                logger.error(f"[{self.AGENT_NAME}] Stage '{stage}' failed: {e}")
                context["results"][stage] = f"Error: {e}"

        # Compile kết quả
        final = await self._compile_result(context)
        return final

    async def _execute_stage(self, stage: str, context: dict) -> str:
        """Override trong SubAgent cụ thể.

        Returns:
            Kết quả text của stage
        """
        # Default: gửi context cho LLM
        prompt = self._build_stage_prompt(stage, context)
        return await self.generate_content_async(prompt)

    async def _compile_result(self, context: dict) -> str:
        """Tổng hợp kết quả từ tất cả stages thành text cuối.

        Override nếu cần logic compile đặc biệt.
        """
        results = context["results"]
        if not results:
            return "Không có kết quả."

        # Default: ghép kết quả các stages
        parts = []
        for stage, result in results.items():
            if result and not result.startswith("Error:"):
                parts.append(result)

        if parts:
            return "\n\n".join(parts)

        return "Xin lỗi, không thể hoàn thành yêu cầu này."

    def _build_stage_prompt(self, stage: str, context: dict) -> str:
        """Build prompt cho 1 stage (override nếu cần)."""
        task = context["task"]
        previous = "\n".join(
            [
                f"- {k}: {v[:200]}"
                for k, v in context["results"].items()
                if v and not v.startswith("Error:")
            ]
        )
        previous_section = (
            f"\n\nKết quả từ các bước trước:\n{previous}" if previous else ""
        )
        return f"""Bước hiện tại: {stage}
Nhiệm vụ: {task}{previous_section}

Hãy thực hiện bước "{stage}" và trả về kết quả chi tiết."""
