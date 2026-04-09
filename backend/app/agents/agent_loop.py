"""AgentLoop — Vòng lặp chính điều phối multi-agent workflow.

Luồng:
  User Query → classify → [SIMPLE path | COMPLEX path]
  
  SIMPLE:  direct response (không gọi SubAgent)
  COMPLEX: plan → execute_agents → synthesize → [critic → iterate?] → return
"""

import logging
import re
import time
from typing import Any, Callable, Coroutine

from pydantic import BaseModel

from app.agents.advisor_context import (
    extract_profile_facts,
    get_mem0_profile_hints,
)
from app.agents.base import BaseAgent
from app.agents.critic import CriticAgent, CriticReview
from app.agents.memory import memory as conversation_memory
from app.agents.orchestrator import (
    OrchestratorAgent,
    OrchestratorPlan,
    QueryType,
    SubAgentResult,
)

logger = logging.getLogger(__name__)

# Progress callback type
ProgressCallback = Callable[[str, dict], Coroutine[Any, Any, None]]

_CONTINUE_COMMANDS = {
    "tiếp",
    "tiep",
    "tiếp tục",
    "tiep tuc",
    "continue",
    "skip",
    "bỏ qua",
    "bo qua",
}
_CANCEL_COMMANDS = {
    "hủy",
    "huy",
    "cancel",
    "stop",
}
_CLARIFICATION_BYPASS_TOKEN = "__NEXTSTEM_CONTINUE__"


def _normalize_user_command(text: str) -> str:
    t = (text or "").strip().lower()
    # collapse whitespace
    t = re.sub(r"\s+", " ", t)
    return t


def _is_continue_command(text: str) -> bool:
    return _normalize_user_command(text) in _CONTINUE_COMMANDS


def _is_cancel_command(text: str) -> bool:
    return _normalize_user_command(text) in _CANCEL_COMMANDS


# ─────────────────────────── Config & Result ───────────────────────────


class AgentLoopConfig(BaseModel):
    """Cấu hình AgentLoop."""
    max_iterations: int = 3
    require_critic_approval: bool = False  # False vì Critic là stub
    parallel_agent_execution: bool = True
    timeout_seconds: float = 120.0


class AgentLoopResult(BaseModel):
    """Kết quả trả về từ AgentLoop."""
    success: bool
    query: str
    final_answer: str
    query_type: str = "simple"
    iterations: int = 1
    execution_time: float = 0.0
    plan: OrchestratorPlan | None = None
    agent_results: list[SubAgentResult] = []
    critic_reviews: list[CriticReview] = []
    metrics: dict = {}
    error: str | None = None


# ─────────────────────────── AgentLoop ───────────────────────────


class AgentLoop:
    """Vòng lặp chính — điều phối toàn bộ multi-agent workflow."""

    def __init__(
        self,
        agents: dict[str, Any] | None = None,
        config: AgentLoopConfig | None = None,
    ):
        self.config = config or AgentLoopConfig()
        self.orchestrator = OrchestratorAgent()
        self.critic = CriticAgent()

        # Đăng ký SubAgents
        if agents:
            self.orchestrator.register_agents(agents)

    def register_agents(self, agents: dict[str, Any]):
        """Đăng ký SubAgents sau khi khởi tạo."""
        self.orchestrator.register_agents(agents)

    async def execute(
        self,
        user_query: str,
        session_id: str | None = None,
        progress_callback: ProgressCallback | None = None,
        mode: str = "general",
        profile_context: dict[str, Any] | None = None,
    ) -> AgentLoopResult:
        """Entry point — xử lý query từ user."""
        start_time = time.time()
        _session_id = session_id or "default"
        incoming_user_msg = user_query
        current_turn_facts = extract_profile_facts(incoming_user_msg)

        try:
            # Resume / continue flow if we previously asked for clarification.
            pending = conversation_memory.get_pending_clarification(_session_id)
            if pending and isinstance(pending, dict):
                pending_query = pending.get("query") or ""
                mode = pending.get("mode") or mode

                if _is_cancel_command(user_query):
                    conversation_memory.clear_pending_clarification(_session_id)
                    msg = "Đã hủy yêu cầu bổ sung thông tin. Bạn có thể đặt câu hỏi mới bất cứ lúc nào."
                    if progress_callback:
                        await progress_callback("start", {"query": incoming_user_msg})
                        await progress_callback("text_delta", {"delta": msg})
                        await progress_callback("completed", {"metrics": {"mode": "cancel"}})
                    return AgentLoopResult(
                        success=True,
                        query=incoming_user_msg,
                        final_answer=msg,
                        query_type="simple",
                        iterations=1,
                    )

                if _is_continue_command(user_query):
                    # User chose to proceed without extra details.
                    user_query = f"{pending_query}\n\n__NEXTSTEM_CONTINUE__"
                else:
                    # Treat user message as clarification details.
                    user_query = (
                        f"{pending_query}\n\n[Thông tin bổ sung từ người dùng]: {incoming_user_msg}\n\n__NEXTSTEM_CONTINUE__"
                    )

                conversation_memory.clear_pending_clarification(_session_id)

            fact_payload = current_turn_facts.to_resolved_dict()
            if fact_payload and not (
                _is_continue_command(incoming_user_msg) or _is_cancel_command(incoming_user_msg)
            ):
                conversation_memory.update_session_facts(_session_id, fact_payload)

            # Emit: start
            if progress_callback:
                await progress_callback("start", {"query": user_query, "mode": mode})

            # Use this for clarification detection + pending state (avoid using the raw UI command like "tiếp tục").
            resume_query_for_planning = user_query

            # Inject conversation history
            history = conversation_memory.get_context(_session_id)
            enriched_query = user_query
            if history:
                enriched_query = (
                    f"[Lịch sử hội thoại gần đây]:\n{history}\n\n"
                    f"[Câu hỏi hiện tại]: {user_query}"
                )
                logger.info(f"[AgentLoop] Injected {conversation_memory.get_message_count(_session_id)} messages of history")

            # Step 1: Classify (dùng query gốc)
            query_type = await self.orchestrator.classify_query(user_query)

            if progress_callback:
                await progress_callback("query_classified", {
                    "type": query_type.value,
                })

            # Step 2: Route (dùng enriched_query có lịch sử)
            if query_type == QueryType.SIMPLE:
                result = await self._execute_simple(
                    enriched_query, progress_callback
                )
            else:
                result = await self._execute_complex(
                    enriched_query,
                    _session_id,
                    progress_callback,
                    resume_query=resume_query_for_planning,
                    mode=mode,
                    profile_context=profile_context,
                    current_turn_facts=current_turn_facts.to_resolved_dict(),
                )

            # Save exchange to memory
            conversation_memory.add_exchange(
                _session_id, incoming_user_msg, result.final_answer
            )

            # Metrics
            result.execution_time = time.time() - start_time
            result.metrics = self._build_metrics(result)

            # Emit: completed
            if progress_callback:
                await progress_callback("completed", {
                    "metrics": result.metrics,
                })

            return result

        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"[AgentLoop] Error: {e}", exc_info=True)

            if progress_callback:
                await progress_callback("error", {"error": str(e)})

            return AgentLoopResult(
                success=False,
                query=user_query,
                final_answer="Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. Bạn thử lại nhé! 🙏",
                execution_time=execution_time,
                error=str(e),
            )

    # ── Simple Path ──

    async def _execute_simple(
        self,
        query: str,
        progress_callback: ProgressCallback | None = None,
    ) -> AgentLoopResult:
        """SIMPLE PATH: Orchestrator trả lời trực tiếp, không gọi SubAgent."""
        if progress_callback:
            await progress_callback("synthesizing", {
                "message": "Đang trả lời...",
            })

        # Tạo phản hồi trực tiếp
        full_text = ""

        async def delta_cb(delta: str):
            nonlocal full_text
            full_text += delta
            if progress_callback:
                await progress_callback("text_delta", {"delta": delta})

        self.orchestrator.start_session()
        async for chunk in self.orchestrator.generate_response(query):
            await delta_cb(chunk)

        return AgentLoopResult(
            success=True,
            query=query,
            final_answer=full_text,
            query_type="simple",
            iterations=1,
        )

    # ── Complex Path ──

    async def _execute_complex(
        self,
        query: str,
        session_id: str,
        progress_callback: ProgressCallback | None = None,
        *,
        resume_query: str | None = None,
        mode: str = "general",
        profile_context: dict[str, Any] | None = None,
        current_turn_facts: dict[str, Any] | None = None,
    ) -> AgentLoopResult:
        """COMPLEX PATH: Plan → Execute SubAgents → Synthesize → [Critic → Iterate]."""
        critic_reviews = []
        current_query = query
        plan = None
        agent_results = []
        final_answer = ""

        for iteration in range(1, self.config.max_iterations + 1):
            logger.info(f"[AgentLoop] Iteration {iteration}/{self.config.max_iterations}")

            # Step 1: Plan
            if progress_callback:
                await progress_callback("planning", {
                    "message": "Đang phân tích và lập kế hoạch...",
                    "iteration": iteration,
                })

            plan = await self.orchestrator.create_plan(current_query, mode=mode)

            if progress_callback:
                await progress_callback("plan_created", {
                    "plan": plan.model_dump(),
                    "mode": "complex",
                    "agents": [a.agent_name for a in plan.agents],
                })

            allow_incomplete = _CLARIFICATION_BYPASS_TOKEN in current_query
            advisor_bundle = self.orchestrator.build_advisor_bundle(
                query=current_query,
                plan=plan,
                mode=mode,
                current_turn_facts=current_turn_facts or {},
                session_facts=conversation_memory.get_session_facts(session_id),
                profile_context=profile_context,
                mem0_hints=get_mem0_profile_hints(
                    session_id=session_id,
                    user_query=current_query,
                ).to_resolved_dict(),
                allow_incomplete=allow_incomplete,
            )
            if iteration == 1 and advisor_bundle and advisor_bundle.clarification:
                pending_query = str(resume_query or current_query)
                clarification = advisor_bundle.clarification
                msg_lines = [
                    "Mình cần thêm một ít thông tin để dùng đúng công cụ cho bạn:",
                    *[f"{i}. {q}" for i, q in enumerate(clarification.questions, 1)],
                    "",
                    "Nếu bạn muốn tiếp tục ngay, hãy bấm nút Tiếp tục hoặc gửi \"tiep tuc\" để mình trả lời best-effort với các tool còn đủ dữ liệu.",
                ]
                msg = "\n".join(msg_lines)

                conversation_memory.set_pending_clarification(
                    session_id,
                    pending_query,
                    metadata={
                        "mode": mode,
                        "missing_fields": clarification.missing_fields,
                        "blocked_tools": clarification.blocked_tools,
                        "questions": clarification.questions,
                        "resolved_from": clarification.resolved_from,
                    },
                )

                if progress_callback:
                    await progress_callback(
                        "clarification_required",
                        clarification.model_dump(),
                    )
                    await progress_callback("text_delta", {"delta": msg})

                return AgentLoopResult(
                    success=True,
                    query=pending_query,
                    final_answer=msg,
                    query_type="clarification",
                    iterations=1,
                    plan=plan,
                    agent_results=[],
                    critic_reviews=[],
                    metrics={},
                )

            # Clarification gate: if we lack key user info for the planned tools, pause and ask.
            if False and iteration == 1:
                # Use the enriched query (with conversation history) for detection so we don't
                # re-ask things the user already answered earlier in the same session.
                clarification_detection_query = current_query
                questions = self.orchestrator.get_clarification_questions(
                    clarification_detection_query,
                    plan,
                )
                if questions:
                    # Store the raw query (without injected history) so resume doesn't duplicate history.
                    pending_query = str(resume_query or current_query)
                    msg_lines = [
                        "Mình cần thêm một ít thông tin để dùng công cụ chính xác hơn:",
                        *[f"{i}. {q}" for i, q in enumerate(questions, 1)],
                        "",
                        "Nếu bạn không muốn cung cấp thêm, hãy bấm nút Tiếp tục (hoặc gửi \"tiep tuc\") để mình trả lời best-effort với thông tin hiện có.",
                    ]
                    msg = "\n".join(msg_lines)

                    conversation_memory.set_pending_clarification(
                        session_id,
                        pending_query,
                    )

                    if progress_callback:
                        await progress_callback(
                            "clarification_required",
                            {
                                "questions": questions,
                                "continue_message": "tiep tuc",
                                "can_continue": True,
                            },
                        )
                        await progress_callback("text_delta", {"delta": msg})

                    return AgentLoopResult(
                        success=True,
                        query=pending_query,
                        final_answer=msg,
                        query_type="clarification",
                        iterations=1,
                        plan=plan,
                        agent_results=[],
                        critic_reviews=[],
                        metrics={},
                    )

            # Step 2: Execute SubAgents
            if progress_callback:
                await progress_callback("executing", {
                    "message": f"Đang gọi {len(plan.agents)} chuyên gia...",
                    "agents": [a.agent_name for a in plan.agents],
                    "parallel": plan.can_parallel,
                })

            agent_results = await self.orchestrator.execute_agents(
                plan, progress_callback
            )

            if progress_callback:
                success_count = sum(1 for r in agent_results if r.success)
                await progress_callback("agents_completed", {
                    "success": success_count,
                    "total": len(agent_results),
                })

            # Step 3: Synthesize
            if progress_callback:
                await progress_callback("synthesizing", {
                    "message": "Đang tổng hợp kết quả...",
                })

            final_answer = ""

            async def delta_cb(delta: str):
                nonlocal final_answer
                final_answer += delta
                if progress_callback:
                    await progress_callback("text_delta", {"delta": delta})

            final_answer = await self.orchestrator.synthesize_response(
                plan, agent_results, text_delta_callback=delta_cb
            )

            # Step 4: Critic (nếu bật)
            if self.config.require_critic_approval:
                if progress_callback:
                    await progress_callback("reviewing", {
                        "message": "Đang đánh giá chất lượng...",
                    })

                review = await self.critic.review_results(plan, agent_results)
                critic_reviews.append(review)

                if progress_callback:
                    await progress_callback("reviewed", {
                        "score": review.score,
                        "approved": review.approved,
                    })

                if review.score >= 3:
                    break  # Đạt chất lượng
                else:
                    # Iterate: thêm feedback vào query
                    current_query = (
                        f"{query}\n[Feedback]: {review.iteration_feedback}"
                    )
                    if progress_callback:
                        await progress_callback("iterating", {
                            "reason": review.iteration_feedback,
                            "score": review.score,
                            "iteration": iteration,
                        })
            else:
                break  # Không cần Critic → 1 iteration

        return AgentLoopResult(
            success=True,
            query=query,
            final_answer=final_answer,
            query_type="complex",
            iterations=len(critic_reviews) + 1 if not critic_reviews else len(critic_reviews),
            plan=plan,
            agent_results=agent_results,
            critic_reviews=critic_reviews,
        )

    # ── Metrics ──

    @staticmethod
    def _build_metrics(result: AgentLoopResult) -> dict:
        """Tạo metrics summary."""
        return {
            "latency_ms": round(result.execution_time * 1000, 1),
            "mode": result.query_type,
            "iterations": result.iterations,
            "agents_called": len(result.agent_results),
            "agents_success": sum(1 for r in result.agent_results if r.success),
        }
