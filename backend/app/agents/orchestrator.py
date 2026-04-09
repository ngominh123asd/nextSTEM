"""OrchestratorAgent â€” Bá»™ nÃ£o Ä‘iá»u phá»‘i, coi 4 SubAgents nhÆ° 4 tools.

Luá»“ng:
1. classify_query(query) â†’ SIMPLE | COMPLEX
2. create_plan(query) â†’ OrchestratorPlan (chá»n agents + phÃ¢n task)
3. execute_agents(plan) â†’ list[SubAgentResult] (song song/tuáº§n tá»±)
4. synthesize_response(plan, results) â†’ Final answer (streaming)
"""

import asyncio
import json
import logging
import re
import time
import unicodedata
from enum import Enum
from typing import Any, Callable, Coroutine

from pydantic import BaseModel

from app.agents.advisor_context import (
    AdvisorExecutionBundle,
    build_advisor_execution_bundle,
    infer_advisor_tools,
)
from app.agents.base import BaseAgent
from app.agents.prompts.orchestrator import (
    CLASSIFY_PROMPT_TEMPLATE,
    ORCHESTRATOR_SYSTEM_PROMPT,
    PLAN_PROMPT_TEMPLATE,
    SYNTHESIZE_PROMPT_TEMPLATE,
)

logger = logging.getLogger(__name__)

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Data Models â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


class QueryType(str, Enum):
    SIMPLE = "simple"
    COMPLEX = "complex"


class SubAgentPlan(BaseModel):
    agent_name: str
    task: str
    reason: str
    priority: int = 1
    tools: list[str] | None = None
    context: dict[str, Any] | None = None


class OrchestratorPlan(BaseModel):
    original_query: str
    interpreted_intent: str
    agents: list[SubAgentPlan]
    can_parallel: bool = True
    expected_outcome: str
    query_type: QueryType


class SubAgentResult(BaseModel):
    agent_name: str
    success: bool
    result: str
    execution_time: float = 0.0
    stages_completed: list[str] = []
    error: str | None = None


class OrchestratorResponse(BaseModel):
    success: bool
    plan: OrchestratorPlan
    agent_results: list[SubAgentResult]
    synthesized_answer: str
    needs_iteration: bool = False
    iteration_reason: str | None = None


# Progress callback type
ProgressCallback = Callable[[str, dict], Coroutine[Any, Any, None]]


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Smart Routing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

# Simple query patterns â€” bypass LLM classification
_SIMPLE_PATTERNS = [
    r"^(chÃ o|hello|hi|xin chÃ o|hey)\b",
    r"^(cáº£m Æ¡n|thanks|thank you|ok|okay)\b",
    r"^nextstem\s*(lÃ  gÃ¬|lÃ  ai)",
    r"^(báº¡n lÃ  ai|báº¡n tÃªn gÃ¬)",
]

# Complex indicators â€” force COMPLEX classification
_COMPLEX_INDICATORS = [
    "du học",
    "du hoc",
    "hồ sơ",
    "ho so",
    "láº­p lá»™ trÃ¬nh",
    "lá»™ trÃ¬nh du há»c",
    "tÆ° váº¥n trÆ°á»ng",
    "tÃ¬m trÆ°á»ng",
    "cháº¥m bÃ i",
    "cháº¥m luáº­n",
    "Ä‘Ã¡nh giÃ¡ bÃ i",
    "review essay",
    "dá»± Ã¡n",
    "nghiÃªn cá»©u",
    "viáº¿t code",
    "debug",
    "phÃ¢n tÃ­ch dá»¯ liá»‡u",
    "há»c bá»•ng",
    "scholarship",
    "ranking",
    "xáº¿p háº¡ng",
    "stress",
    "Ã¡p lá»±c",
    "má»‡t má»i",
    "lo láº¯ng",
    "chÃ¡n náº£n",
    "so sÃ¡nh",
    "phÃ¢n tÃ­ch",
    "tÆ° váº¥n",
    "gá»£i Ã½",
    "personal statement",
    "common app",
    "UCAS",
    "CV",
    "resume",
    "STEM",
    "khoa há»c",
    "sÃ¡ng cháº¿",
    "ISEF",
]

_ADVISOR_AVAILABLE_TOOLS = {
    "university_explorer",
    "career_knowledge",
    "scholarship_finder",
    "roadmap_generator",
}

_CLARIFICATION_BYPASS_TOKEN = "__NEXTSTEM_CONTINUE__"
_URL_PATTERN = re.compile(r"https?://[^\s<>()\"'\]]+")


def _extract_current_query(text: str) -> str:
    """Return current user query when message includes injected history wrapper."""
    if not text:
        return ""
    match = re.search(r"\[CÃ¢u há»i hiá»‡n táº¡i\]:\s*(.+)$", text, flags=re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def _has_country_hint(text: str) -> bool:
    t = text.lower()
    return any(
        k in t
        for k in [
            "usa",
            "us ",
            "united states",
            "má»¹",
            "canada",
            "singapore",
            "uk",
            "united kingdom",
            "anh",
            "australia",
            "Ãºc",
            "japan",
            "nháº­t",
            "korea",
            "hÃ n",
            "switzerland",
            "thá»¥y sÄ©",
            "chÃ¢u Ã¢u",
            "chau au",
            "europe",
            "eu",
        ]
    )


def _has_grade_or_timeline_hint(text: str) -> bool:
    t = text.lower()
    if any(k in t for k in ["lá»›p", "grade", "intake", "nÄƒm", "thÃ¡ng", "timeline"]):
        return True
    # years like 2026/2027
    return bool(re.search(r"\b20\d{2}\b", t))


def _has_gpa_hint(text: str) -> bool:
    t = text.lower()
    return bool(re.search(r"\bgpa\s*[:=]?\s*\d(\.\d+)?\b", t)) or ("Ä‘iá»ƒm" in t)


def _has_field_hint(text: str) -> bool:
    t = text.lower()
    return any(
        k in t
        for k in [
            "computer science",
            "cs",
            "ai",
            "machine learning",
            "data",
            "bio",
            "engineering",
            "robot",
            "toÃ¡n",
            "math",
            "khoa há»c",
            "stem",
            "ngÃ nh",
            "major",
        ]
    )


def _has_budget_hint(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["$", "usd", "vnd", "triá»‡u", "million", "budget", "ngÃ¢n sÃ¡ch", "tÃ i chÃ­nh"])


def _has_test_scores_hint(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["ielts", "toefl", "sat", "act", "ap", "gre", "gmat"])


def _is_profile_analysis_query(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["há»“ sÆ¡", "ho so", "profile", "Ä‘Ã¡nh giÃ¡ há»“ sÆ¡", "review há»“ sÆ¡"])


def _is_roadmap_query(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["lá»™ trÃ¬nh", "káº¿ hoáº¡ch", "12 thÃ¡ng", "timeline", "roadmap"])


def _build_clarification_questions(query: str, tools: set[str]) -> list[str]:
    if _CLARIFICATION_BYPASS_TOKEN in query:
        return []

    # Use current-query text for intent classification, but full text (with history)
    # for missing-info detection to avoid re-asking answered fields.
    current_query = _extract_current_query(query)

    questions: list[str] = []

    # High-signal intent: user wants us to analyze their profile but provided no profile.
    if _is_profile_analysis_query(current_query):
        has_grade = _has_grade_or_timeline_hint(query)
        has_gpa = _has_gpa_hint(query)
        has_country = _has_country_hint(query)
        has_field = _has_field_hint(query)
        has_tests = _has_test_scores_hint(query)
        has_budget = _has_budget_hint(query)

        if not (has_grade and has_gpa):
            questions.append(
                "Báº¡n Ä‘ang há»c lá»›p máº¥y vÃ  GPA/Ä‘iá»ƒm trung bÃ¬nh hiá»‡n táº¡i bao nhiÃªu? (thang 10 hoáº·c 4)"
            )

        # Ask for country/field, but avoid repeating what the user already provided.
        if not has_country and not has_field:
            questions.append(
                "Báº¡n muá»‘n du há»c nÆ°á»›c nÃ o vÃ  muá»‘n há»c ngÃ nh nÃ o? (VD: Singapore + CS/AI/Data)"
            )
        elif not has_country:
            questions.append(
                "Báº¡n muá»‘n du há»c nÆ°á»›c nÃ o/khu vá»±c nÃ o? (VD: Singapore/Netherlands/UK)"
            )
        elif not has_field:
            questions.append(
                "Báº¡n muá»‘n há»c ngÃ nh nÃ o? (VD: CS/AI/Data/Bio/Engineering)"
            )

        # Ask for tests/budget, but avoid repeating.
        if not has_tests and not has_budget:
            questions.append(
                "Báº¡n Ä‘Ã£ cÃ³ IELTS/TOEFL/SAT (hoáº·c tÆ°Æ¡ng Ä‘Æ°Æ¡ng) chÆ°a vÃ  ngÃ¢n sÃ¡ch/há»c bá»•ng má»¥c tiÃªu lÃ  gÃ¬?"
            )
        elif not has_tests:
            questions.append(
                "Báº¡n Ä‘Ã£ cÃ³ IELTS/TOEFL/SAT (hoáº·c tÆ°Æ¡ng Ä‘Æ°Æ¡ng) chÆ°a? Náº¿u chÆ°a thÃ¬ má»¥c tiÃªu Ä‘iá»ƒm lÃ  bao nhiÃªu?"
            )
        elif not has_budget:
            questions.append(
                "NgÃ¢n sÃ¡ch/tÃ i chÃ­nh (Æ°á»›c lÆ°á»£ng) vÃ  má»©c há»c bá»•ng báº¡n cáº§n lÃ  gÃ¬?"
            )
        return questions[:3]

    # For planning/roadmap intents, prioritize only timeline + major questions.
    # Avoid re-asking country/GPA when those are already in history.
    if _is_roadmap_query(current_query):
        if not _has_grade_or_timeline_hint(query):
            questions.append(
                "Báº¡n Ä‘ang há»c lá»›p máº¥y vÃ  dá»± kiáº¿n ná»™p há»“ sÆ¡/intake nÄƒm nÃ o?"
            )
        if not _has_field_hint(query):
            questions.append("Báº¡n muá»‘n há»c ngÃ nh nÃ o? (VD: CS/AI/Data/Bio/Engineering)")
        return questions[:3]

    needs_country = any(t in tools for t in {"university_explorer", "scholarship_finder"})
    if needs_country and not _has_country_hint(query):
        questions.append(
            "Báº¡n muá»‘n du há»c nÆ°á»›c nÃ o/khu vá»±c nÃ o? (VD: US/Canada/Singapore/UK)"
        )

    if "university_explorer" in tools and not _has_field_hint(query):
        questions.append("Báº¡n muá»‘n há»c ngÃ nh nÃ o? (VD: CS/AI/Data/Bio/Engineering)")

    if ("roadmap_generator" in tools) and not _has_grade_or_timeline_hint(query):
        questions.append(
            "Báº¡n Ä‘ang há»c lá»›p máº¥y vÃ  dá»± kiáº¿n ná»™p há»“ sÆ¡/intake nÄƒm nÃ o?"
        )

    if ("scholarship_finder" in tools) and not _has_gpa_hint(query):
        questions.append(
            "GPA/Ä‘iá»ƒm trung bÃ¬nh hiá»‡n táº¡i bao nhiÃªu? (thang 10 hoáº·c 4)"
        )

    if ("scholarship_finder" in tools) and not _has_budget_hint(query):
        questions.append(
            "NgÃ¢n sÃ¡ch/tÃ i chÃ­nh (Æ°á»›c lÆ°á»£ng) vÃ  má»©c há»c bá»•ng báº¡n cáº§n lÃ  gÃ¬?"
        )

    # Keep it light: ask at most 3 questions
    return questions[:3]


def _extract_urls_from_text(text: str, max_items: int = 40) -> list[str]:
    if not text:
        return []
    out: list[str] = []
    seen: set[str] = set()
    for match in _URL_PATTERN.findall(text):
        cleaned = match.rstrip(".,;:!?)]}")
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            out.append(cleaned)
        if len(out) >= max_items:
            break
    return out


def _append_sources_if_missing(answer: str, source_urls: list[str]) -> str:
    if not source_urls:
        return answer
    has_any_source_in_text = any(u in answer for u in source_urls[:10])
    normalized_answer = unicodedata.normalize("NFD", answer.lower())
    normalized_answer = "".join(
        ch for ch in normalized_answer if unicodedata.category(ch) != "Mn"
    )
    if has_any_source_in_text and (
        "nguon tham khao" in normalized_answer or "[nguon:" in normalized_answer
    ):
        return answer

    lines = [answer.rstrip(), "", "### Nguon tham khao"]
    for idx, url in enumerate(source_urls[:12], 1):
        lines.append(f"- [{idx}] {url}")
    return "\n".join(lines)


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ OrchestratorAgent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


class OrchestratorAgent(BaseAgent):
    """Bá»™ nÃ£o Ä‘iá»u phá»‘i â€” phÃ¢n tÃ­ch yÃªu cáº§u, láº­p káº¿ hoáº¡ch, gá»i SubAgents."""

    def __init__(self):
        super().__init__(
            system_prompt=ORCHESTRATOR_SYSTEM_PROMPT,
            model_name="gemini-2.0-flash",
        )
        # SubAgents sáº½ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ bá»Ÿi AgentLoop
        self.agents: dict[str, Any] = {}

    def register_agents(self, agents: dict[str, Any]):
        """ÄÄƒng kÃ½ SubAgents (gá»i bá»Ÿi AgentLoop khi khá»Ÿi táº¡o)."""
        self.agents = agents
        logger.info(f"Registered {len(agents)} agents: {list(agents.keys())}")

    # â”€â”€ Classification â”€â”€

    async def classify_query(self, query: str) -> QueryType:
        """PhÃ¢n loáº¡i query: SIMPLE hay COMPLEX.

        DÃ¹ng regex trÆ°á»›c (nhanh, miá»…n phÃ­), fallback LLM náº¿u khÃ´ng cháº¯c.
        """
        query_lower = query.lower().strip()

        # 1. Regex: check simple patterns
        for pattern in _SIMPLE_PATTERNS:
            if re.search(pattern, query_lower):
                logger.info(f"[Classify] SIMPLE (regex): {query[:50]}")
                return QueryType.SIMPLE

        # 2. Regex: check complex indicators
        for indicator in _COMPLEX_INDICATORS:
            if indicator in query_lower:
                logger.info(
                    f"[Classify] COMPLEX (indicator '{indicator}'): {query[:50]}"
                )
                return QueryType.COMPLEX

        # 3. Heuristic: query ngáº¯n â‰¤ 5 tá»« â†’ SIMPLE
        if len(query.split()) <= 5:
            logger.info(f"[Classify] SIMPLE (short): {query[:50]}")
            return QueryType.SIMPLE

        # 4. Fallback: Gá»i LLM
        try:
            prompt = CLASSIFY_PROMPT_TEMPLATE.format(query=query)
            result = await self.generate_standalone(prompt)
            classification = result.strip().upper()

            if "COMPLEX" in classification:
                logger.info(f"[Classify] COMPLEX (LLM): {query[:50]}")
                return QueryType.COMPLEX
            else:
                logger.info(f"[Classify] SIMPLE (LLM): {query[:50]}")
                return QueryType.SIMPLE
        except Exception as e:
            logger.warning(f"[Classify] LLM error, defaulting COMPLEX: {e}")
            return QueryType.COMPLEX

    # â”€â”€ Planning â”€â”€

    async def create_plan(self, query: str, mode: str = "general") -> OrchestratorPlan:
        """Gá»i LLM Ä‘á»ƒ láº­p káº¿ hoáº¡ch chá»n agents + phÃ¢n task."""
        prompt = PLAN_PROMPT_TEMPLATE.format(query=query)

        try:
            result = await self.generate_standalone(prompt)
            plan_data = self._parse_json(result)

            agents = [SubAgentPlan(**a) for a in plan_data.get("agents", [])]

            # Normalize/validate per-agent tool hints
            for agent in agents:
                agent.tools = self._normalize_tools_for_agent(
                    agent.agent_name,
                    agent.tools,
                    query,
                    mode,
                )

            # Validate: chá»‰ giá»¯ agents Ä‘Ã£ Ä‘Äƒng kÃ½
            valid_agents = [a for a in agents if a.agent_name in self.agents]
            if not valid_agents:
                logger.warning("[Plan] No valid agents in plan, defaulting to advisor")
                valid_agents = [
                    SubAgentPlan(
                        agent_name="advisor",
                        task=query,
                        reason="Default fallback",
                        priority=1,
                        tools=self._infer_advisor_tools(query, mode),
                    )
                ]

            return OrchestratorPlan(
                original_query=query,
                interpreted_intent=plan_data.get("interpreted_intent", query),
                agents=valid_agents,
                can_parallel=plan_data.get("can_parallel", True),
                expected_outcome=plan_data.get("expected_outcome", ""),
                query_type=QueryType.COMPLEX,
            )
        except Exception as e:
            logger.error(f"[Plan] Error creating plan: {e}")
            # Fallback: gá»­i cho advisor
            return OrchestratorPlan(
                original_query=query,
                interpreted_intent=query,
                agents=[
                    SubAgentPlan(
                        agent_name="advisor",
                        task=query,
                        reason="Fallback due to planning error",
                        priority=1,
                        tools=self._infer_advisor_tools(query, mode),
                    )
                ],
                can_parallel=False,
                expected_outcome="Best-effort response",
                query_type=QueryType.COMPLEX,
            )

    def get_clarification_questions(self, query: str, plan: OrchestratorPlan | None) -> list[str]:
        """Best-effort heuristic: ask user for missing info before executing tools."""
        if _CLARIFICATION_BYPASS_TOKEN in query:
            return []

        tools: set[str] = set()
        if plan:
            for a in plan.agents:
                if a.tools:
                    tools.update(a.tools)

        if not tools:
            # Fallback: infer from query
            tools.update(self._infer_advisor_tools(query))

        return _build_clarification_questions(query, tools)

    def build_advisor_bundle(
        self,
        *,
        query: str,
        plan: OrchestratorPlan,
        mode: str = "general",
        current_turn_facts: dict[str, Any] | None = None,
        session_facts: dict[str, Any] | None = None,
        profile_context: dict[str, Any] | None = None,
        mem0_hints: dict[str, Any] | None = None,
        allow_incomplete: bool = False,
    ) -> AdvisorExecutionBundle | None:
        """Resolve advisor tool params and attach execution context to the plan."""

        advisor_plans = [agent for agent in plan.agents if agent.agent_name == "advisor"]
        if not advisor_plans:
            return None

        selected_tools: list[str] = []
        for agent in advisor_plans:
            if agent.tools:
                selected_tools.extend(agent.tools)

        bundle = build_advisor_execution_bundle(
            query=query,
            mode=mode,
            selected_tools=list(dict.fromkeys(selected_tools)) or None,
            current_turn_facts=current_turn_facts,
            session_facts=session_facts,
            db_profile=profile_context,
            mem0_hints=mem0_hints,
            allow_incomplete=allow_incomplete,
        )

        context_payload = {
            "mode": mode,
            "profile_context": bundle.profile.model_dump(),
            "resolved_from": bundle.resolved_from,
            "tool_requests": [request.model_dump() for request in bundle.tool_requests],
            "selected_tools": bundle.selected_tools,
        }

        for agent in advisor_plans:
            agent.tools = bundle.selected_tools
            agent.context = context_payload

        return bundle

    # â”€â”€ Execution â”€â”€

    async def execute_agents(
        self,
        plan: OrchestratorPlan,
        progress_callback: ProgressCallback | None = None,
    ) -> list[SubAgentResult]:
        """Cháº¡y SubAgents song song hoáº·c tuáº§n tá»± theo plan."""
        if plan.can_parallel and len(plan.agents) > 1:
            tasks = [
                self._execute_single_agent(
                    agent_plan,
                    progress_callback,
                    plan.original_query,
                )
                for agent_plan in plan.agents
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            # Handle exceptions
            final_results = []
            for i, r in enumerate(results):
                if isinstance(r, Exception):
                    final_results.append(
                        SubAgentResult(
                            agent_name=plan.agents[i].agent_name,
                            success=False,
                            result="",
                            error=str(r),
                        )
                    )
                else:
                    final_results.append(r)
            return final_results
        else:
            results = []
            for agent_plan in sorted(plan.agents, key=lambda x: x.priority):
                result = await self._execute_single_agent(
                    agent_plan,
                    progress_callback,
                    plan.original_query,
                )
                results.append(result)
            return results

    async def _execute_single_agent(
        self,
        agent_plan: SubAgentPlan,
        progress_callback: ProgressCallback | None = None,
        original_query: str | None = None,
    ) -> SubAgentResult:
        """Gá»i 1 SubAgent â€” context hoÃ n toÃ n isolated."""
        agent = self.agents.get(agent_plan.agent_name)
        if not agent:
            return SubAgentResult(
                agent_name=agent_plan.agent_name,
                success=False,
                result="",
                error=f"Agent '{agent_plan.agent_name}' not registered",
            )

        start = time.time()
        try:
            if progress_callback:
                await progress_callback(
                    "agent_start",
                    {
                        "agent": agent_plan.agent_name,
                        "task": agent_plan.task,
                    },
                )

            # SubAgent cháº¡y vá»›i task riÃªng â€” context isolated
            result = await agent.execute(
                task=agent_plan.task,
                progress_callback=progress_callback,
                tool_hints=agent_plan.tools,
                user_query=original_query,
                agent_context=agent_plan.context,
            )

            execution_time = time.time() - start

            if progress_callback:
                await progress_callback(
                    "agent_completed",
                    {
                        "agent": agent_plan.agent_name,
                        "execution_time": round(execution_time, 2),
                        "preview": result[:200] if result else "",
                    },
                )

            return SubAgentResult(
                agent_name=agent_plan.agent_name,
                success=True,
                result=result,
                execution_time=execution_time,
            )

        except Exception as e:
            execution_time = time.time() - start
            logger.error(f"[Execute] Agent '{agent_plan.agent_name}' failed: {e}")

            if progress_callback:
                await progress_callback(
                    "agent_error",
                    {
                        "agent": agent_plan.agent_name,
                        "error": str(e),
                    },
                )

            return SubAgentResult(
                agent_name=agent_plan.agent_name,
                success=False,
                result="",
                execution_time=execution_time,
                error=str(e),
            )

    # â”€â”€ Synthesis â”€â”€

    async def synthesize_response(
        self,
        plan: OrchestratorPlan,
        agent_results: list[SubAgentResult],
        text_delta_callback: Callable[[str], Coroutine[Any, Any, None]] | None = None,
    ) -> str:
        """Tong hop ket qua tu nhieu SubAgents thanh phan hoi mach lac."""
        results_text = "\n\n".join(
            [
                f"=== {r.agent_name.upper()} ===\n{r.result}"
                for r in agent_results
                if r.success and r.result
            ]
        )

        if not results_text:
            return "Xin loi, minh khong the xu ly yeu cau nay luc nay. Ban thu lai nhe!"

        source_urls = _extract_urls_from_text(results_text)
        sources_text = (
            "\n".join([f"[{i}] {u}" for i, u in enumerate(source_urls, 1)])
            if source_urls
            else "Khong co URL nguon du lieu."
        )

        prompt = SYNTHESIZE_PROMPT_TEMPLATE.format(
            query=plan.original_query,
            agent_results=results_text,
            sources=sources_text,
        )

        if text_delta_callback:
            full_text = ""
            self.start_session()
            async for chunk in self.generate_response(prompt):
                full_text += chunk
                await text_delta_callback(chunk)

            final_text = _append_sources_if_missing(full_text, source_urls)
            extra = final_text[len(full_text):]
            if extra:
                await text_delta_callback(extra)
            return final_text

        full_text = await self.generate_standalone(prompt)
        return _append_sources_if_missing(full_text, source_urls)

    # â”€â”€ Helpers â”€â”€

    @staticmethod
    def _parse_json(text: str) -> dict:
        """Parse JSON tá»« LLM response (xá»­ lÃ½ markdown code blocks)."""
        # Remove markdown code block náº¿u cÃ³
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if len(lines) > 2 else text

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON object in text
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                return json.loads(match.group())
            raise ValueError(f"Cannot parse JSON from: {text[:200]}")

    def _normalize_tools_for_agent(
        self,
        agent_name: str,
        tools: list[str] | None,
        query: str,
        mode: str = "general",
    ) -> list[str] | None:
        if agent_name != "advisor":
            return tools

        inferred = self._infer_advisor_tools(query, mode)

        if not tools:
            return inferred

        normalized = [t for t in tools if t in _ADVISOR_AVAILABLE_TOOLS]
        if not normalized:
            return inferred

        # Guardrail against over-selection from LLM plans.
        pruned = [t for t in normalized if t in inferred]
        if pruned:
            return pruned

        return inferred

    @staticmethod
    def _infer_advisor_tools(query: str) -> list[str]:
        query_lower = _extract_current_query(query).lower()
        selected: list[str] = []

        asks_university = any(
            k in query_lower
            for k in ["trÆ°á»ng", "Ä‘áº¡i há»c", "university", "ranking", "xáº¿p háº¡ng"]
        )
        asks_career = any(
            k in query_lower for k in ["ngÃ nh", "career", "ká»¹ nÄƒng", "viá»‡c lÃ m"]
        )
        asks_scholarship = any(
            k in query_lower
            for k in ["há»c bá»•ng", "scholarship", "financial", "funding"]
        )
        asks_roadmap = any(
            k in query_lower for k in ["lá»™ trÃ¬nh", "roadmap", "timeline", "káº¿ hoáº¡ch"]
        )

        if asks_university:
            selected.append("university_explorer")
        if asks_career:
            selected.append("career_knowledge")
        if asks_scholarship:
            selected.append("scholarship_finder")
        if asks_roadmap:
            selected.append("roadmap_generator")

        if selected:
            return selected

        # Default ultra-light profile hint for vague advisor requests
        return ["career_knowledge"]

    @staticmethod
    def _infer_advisor_tools(query: str, mode: str = "general") -> list[str]:
        return infer_advisor_tools(_extract_current_query(query), mode=mode)
