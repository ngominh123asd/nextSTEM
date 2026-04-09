"""Advisor subagent for school, scholarship, and roadmap guidance."""

import asyncio
import logging
import re
from typing import Any, Callable, Coroutine

from app.agents.llm_config import get_model_for_role
from app.agents.prompts.subagents import ADVISOR_SYSTEM_PROMPT
from app.agents.subagents.base import SubAgentBase
from app.agents.tools.http_utils import begin_request_trace, end_request_trace

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[str, dict], Coroutine[Any, Any, None]]
_URL_PATTERN = re.compile(r"https?://[^\s<>()\"'\]]+")


def _extract_urls(text: str, max_items: int = 20) -> list[str]:
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


def _has_meaningful_university_result(text: str) -> bool:
    if not text or not text.strip():
        return False
    lowered = text.lower()
    return (
        "khong tim thay truong phu hop" not in lowered
        and "không tìm thấy trường phù hợp" not in lowered
    )


def _filter_request_urls(request_trace: list[dict]) -> list[str]:
    filtered: list[str] = []
    seen: set[str] = set()
    blocked_tokens = (
        "api/search?",
        "/online/search",
        "services.onetcenter.org",
        "api.openalex.org/institutions",
        "api.ror.org/v2/organizations",
        "api.data.gov/ed/collegescorecard",
        "query.wikidata.org/sparql",
    )

    for row in request_trace:
        url = (row.get("url") or "").strip()
        if not url or url in seen:
            continue
        lowered = url.lower()
        if any(token in lowered for token in blocked_tokens):
            continue
        if "?" in url and len(url) > 140:
            continue
        seen.add(url)
        filtered.append(url)
    return filtered


def _collect_reference_links(request_trace: list[dict], output: str) -> list[str]:
    source_urls = _extract_urls(output or "")
    if source_urls:
        return source_urls
    return _filter_request_urls(request_trace)


def _format_source_appendix(tool_links: dict[str, list[str]]) -> str:
    if not tool_links:
        return ""

    lines: list[str] = ["## Nguon du lieu da dung"]
    for tool_name, links in tool_links.items():
        if not links:
            continue
        lines.append(f"- {tool_name}:")
        for idx, link in enumerate(links[:8], 1):
            lines.append(f"  - [{idx}] {link}")
    if len(lines) == 1:
        return ""
    return "\n".join(lines)


class AdvisorAgent(SubAgentBase):
    """AI advisor for STEM study-abroad guidance."""

    AGENT_NAME = "advisor"
    STAGES = [
        "analyze_profile",
        "explore_options",
        "find_scholarships",
        "generate_roadmap",
    ]

    TOOL_TO_STAGE = {
        "university_explorer": "explore_options",
        "career_knowledge": "explore_options",
        "scholarship_finder": "find_scholarships",
        "roadmap_generator": "generate_roadmap",
    }

    def __init__(self):
        model_cfg = get_model_for_role("advisor")
        super().__init__(
            system_prompt=ADVISOR_SYSTEM_PROMPT,
            model_name=model_cfg.model_name,
        )
        self.agent_tools: dict[str, Callable] = {}
        self._register_tools()

    def _register_tools(self):
        """Register tools used by the advisor."""
        try:
            from app.agents.tools.career_knowledge import search_career_paths
            from app.agents.tools.roadmap_generator import generate_roadmap
            from app.agents.tools.scholarship_finder import find_scholarships
            from app.agents.tools.university_explorer import explore_universities

            self.agent_tools = {
                "university_explorer": explore_universities,
                "career_knowledge": search_career_paths,
                "scholarship_finder": find_scholarships,
                "roadmap_generator": generate_roadmap,
            }
        except ImportError as e:
            logger.warning("[Advisor] Some tools not available: %s", e)

    async def _execute_stage(self, stage: str, context: dict) -> str:
        task = context["task"]

        if stage == "analyze_profile":
            return await self._stage_analyze(task, context)
        if stage == "explore_options":
            return await self._stage_explore(task, context)
        if stage == "find_scholarships":
            return await self._stage_scholarships(task, context)
        if stage == "generate_roadmap":
            return await self._stage_roadmap(task, context)
        return await super()._execute_stage(stage, context)

    async def _stage_analyze(self, task: str, context: dict) -> str:
        prompt = f"""Phan tich yeu cau tu van du hoc sau day va trich xuat thong tin:

Yeucau: {task}

Hay xac dinh:
1. Muc tieu du hoc (quoc gia, nganh, bac hoc)
2. Thong tin hoc sinh neu co: GPA, diem thi, ky nang
3. Rang buoc/uu tien: tai chinh, vi tri, xep hang
4. Dieu gi con thieu can hoi them

Tra loi chi tiet bang tieng Viet:"""
        self.start_session()
        analysis = await self.generate_content_async(prompt)

        tool_requests = self._resolve_tool_requests(task, context)
        await self._run_tools_parallel(tool_requests, context)
        return analysis

    async def _stage_explore(self, task: str, context: dict) -> str:
        analysis = context["results"].get("analyze_profile", "")

        selected_tools = self._resolve_selected_tools(task, context)
        if not (
            "university_explorer" in selected_tools
            or "career_knowledge" in selected_tools
        ):
            return ""

        tool_outputs = context.get("tool_outputs", {})
        university_result = tool_outputs.get("university_explorer", "")
        career_result = tool_outputs.get("career_knowledge", "")
        has_university_data = _has_meaningful_university_result(university_result)
        has_career_data = bool((career_result or "").strip())

        university_block = (
            f"\n\nDu lieu tu University Explorer:\n{university_result}"
            if university_result
            else ""
        )
        career_block = (
            f"\n\nDu lieu Career Path:\n{career_result}" if career_result else ""
        )

        if not has_university_data and has_career_data:
            prompt = f"""Ban dang ho tro tu van du hoc best-effort nhung CHUA co du lieu truong dai hoc grounded.

Phan tich ho so:
{analysis}
{career_block}

Hay:
1. Noi ro la chua the de xuat truong hoac quoc gia cu the vi thieu du lieu.
2. Chi goi y 2-3 huong nganh/career tong quat dua tren du lieu Career Path o tren.
3. KHONG neu ten truong dai hoc cu the.
4. KHONG tu suy doan quoc gia uu tien hoac moc diem dau vao.
5. Liet ke ngan gon nhung thong tin user nen bo sung tiep theo.

Tra loi bang tieng Viet, gon, thuc te, khong suy dien qua muc."""
            return await self.generate_content_async(prompt)

        if not has_university_data:
            return ""

        prompt = f"""Dua tren phan tich sau, goi y truong dai hoc va nganh hoc phu hop:

Phan tich ho so:
{analysis}
{university_block}
{career_block}

Chi duoc su dung ten truong, quoc gia, va yeu cau dau vao neu chung xuat hien trong du lieu University Explorer o tren.
Khong duoc tu them truong moi hay cat diem moi.

Hay goi y:
1. Top 3-5 truong phu hop (kem ly do)
2. Nganh hoc cu the tai moi truong
3. Yeu cau dau vao neu va chi neu da co trong du lieu
4. Diem manh dac biet cua moi truong

Tra loi chi tiet bang tieng Viet:"""
        return await self.generate_content_async(prompt)

    async def _stage_scholarships(self, task: str, context: dict) -> str:
        analysis = context["results"].get("analyze_profile", "")
        universities = context["results"].get("explore_options", "")

        selected_tools = self._resolve_selected_tools(task, context)
        if "scholarship_finder" not in selected_tools:
            return ""

        tool_outputs = context.get("tool_outputs", {})
        tool_result = tool_outputs.get("scholarship_finder", "")
        tool_block = f"\n\nDu lieu Scholarship:\n{tool_result}" if tool_result else ""

        prompt = f"""Tim hoc bong phu hop dua tren ho so va truong da chon:

Ho so: {analysis[:500]}
Truong goi y: {universities[:500]}
{tool_block}

Liet ke:
1. Hoc bong toan phan/ban phan phu hop
2. Deadline nop ho so
3. Yeu cau va cach apply
4. Tips tang co hoi dau

Tra loi chi tiet bang tieng Viet:"""
        return await self.generate_content_async(prompt)

    async def _stage_roadmap(self, task: str, context: dict) -> str:
        analysis = context["results"].get("analyze_profile", "")
        universities = context["results"].get("explore_options", "")
        scholarships = context["results"].get("find_scholarships", "")

        selected_tools = self._resolve_selected_tools(task, context)
        if "roadmap_generator" not in selected_tools:
            return ""

        tool_outputs = context.get("tool_outputs", {})
        tool_result = tool_outputs.get("roadmap_generator", "")
        tool_block = f"\n\nRoadmap data:\n{tool_result}" if tool_result else ""

        prompt = f"""Lap lo trinh chuan bi du hoc chi tiet:

Ho so: {analysis[:300]}
Truong muc tieu: {universities[:300]}
Hoc bong: {scholarships[:300]}
{tool_block}

Tao lo trinh theo timeline:
1. Giai doan chuan bi
2. Lich thi chuan hoa
3. Hoat dong ngoai khoa can tham gia
4. Deadline nop ho so quan trong
5. Nhung viec can lam ngay

Tra loi dang timeline ro rang bang tieng Viet:"""
        return await self.generate_content_async(prompt)

    async def _compile_result(self, context: dict) -> str:
        results = context["results"]
        parts: list[str] = []

        if results.get("analyze_profile"):
            parts.append(f"## Phan tich ho so\n{results['analyze_profile']}")
        if results.get("explore_options"):
            parts.append(f"## Truong va nganh phu hop\n{results['explore_options']}")
        if results.get("find_scholarships"):
            parts.append(f"## Hoc bong\n{results['find_scholarships']}")
        if results.get("generate_roadmap"):
            parts.append(f"## Lo trinh\n{results['generate_roadmap']}")

        source_block = _format_source_appendix(context.get("tool_raw_links", {}))
        if source_block:
            parts.append(source_block)

        return "\n\n".join(parts) if parts else "Khong co du thong tin de tu van."

    def _resolve_tool_requests(self, task: str, context: dict) -> list[dict]:
        agent_context = context.get("agent_context") or {}
        planned_requests = agent_context.get("tool_requests") or []
        if planned_requests:
            return planned_requests

        return [
            {
                "tool_name": tool_name,
                "description": "",
                "params": {"query": task},
                "missing_fields": [],
                "blocking": False,
                "resolved_from": {},
                "skip_reason": None,
            }
            for tool_name in self._resolve_selected_tools(task, context)
        ]

    def _resolve_selected_tools(self, task: str, context: dict) -> list[str]:
        planned_requests = self._resolve_tool_requests_from_context(context)
        if planned_requests:
            return [
                request["tool_name"]
                for request in planned_requests
                if not request.get("skip_reason")
            ]

        query_text = str(context.get("user_query") or task)
        inferred = self._infer_tools_from_query(query_text)

        hinted = context.get("tool_hints") or []
        valid_hints = [tool for tool in hinted if tool in self.agent_tools]
        if valid_hints:
            pruned = [tool for tool in valid_hints if tool in inferred]
            if pruned:
                return pruned
            return inferred

        selected: list[str] = []
        task_lower = query_text.lower()

        if any(
            keyword in task_lower
            for keyword in ["truong", "dai hoc", "university", "ranking", "xep hang"]
        ):
            selected.append("university_explorer")
        if any(
            keyword in task_lower
            for keyword in ["nganh", "career", "ky nang", "viec lam"]
        ):
            selected.append("career_knowledge")
        if any(
            keyword in task_lower
            for keyword in ["hoc bong", "scholarship", "financial", "funding"]
        ):
            selected.append("scholarship_finder")
        if any(
            keyword in task_lower
            for keyword in ["lo trinh", "roadmap", "timeline", "ke hoach"]
        ):
            selected.append("roadmap_generator")

        if selected:
            return selected
        return ["career_knowledge"]

    @staticmethod
    def _resolve_tool_requests_from_context(context: dict) -> list[dict]:
        agent_context = context.get("agent_context") or {}
        return agent_context.get("tool_requests") or []

    @staticmethod
    def _infer_tools_from_query(query_text: str) -> list[str]:
        from app.agents.advisor_context import infer_advisor_tools

        return infer_advisor_tools(query_text)

    async def _run_tools_parallel(
        self,
        tool_requests: list[dict],
        context: dict,
    ):
        if context.get("tools_prefetched"):
            return

        progress_cb: ProgressCallback | None = context.get("progress_callback")
        tool_outputs = context.setdefault("tool_outputs", {})

        async def _run_one(tool_request: dict):
            tool_name = tool_request.get("tool_name")
            if not tool_name or tool_name in tool_outputs:
                return

            tool = self.agent_tools.get(tool_name)
            if not tool:
                return

            params = dict(tool_request.get("params") or {})
            skip_reason = tool_request.get("skip_reason")

            if skip_reason:
                tool_outputs[tool_name] = ""
                if progress_cb:
                    await progress_cb(
                        "tool_result",
                        {
                            "agent": self.AGENT_NAME,
                            "tool": tool_name,
                            "success": False,
                            "skipped": True,
                            "error": skip_reason,
                            "missing_fields": tool_request.get("missing_fields") or [],
                        },
                    )
                return

            if progress_cb:
                await progress_cb(
                    "tool_call",
                    {
                        "agent": self.AGENT_NAME,
                        "tool": tool_name,
                        "input": params,
                        "resolved_from": tool_request.get("resolved_from") or {},
                    },
                )

            try:
                trace_token = begin_request_trace()
                try:
                    output = await tool(**params)
                finally:
                    request_trace = end_request_trace(trace_token)

                tool_outputs[tool_name] = output
                raw_links = _collect_reference_links(request_trace, output or "")
                context.setdefault("tool_raw_links", {})[tool_name] = raw_links

                if progress_cb:
                    await progress_cb(
                        "tool_result",
                        {
                            "agent": self.AGENT_NAME,
                            "tool": tool_name,
                            "success": True,
                            "output_preview": (output or "")[:400],
                            "output": output,
                            "raw_links": raw_links,
                            "request_trace": request_trace,
                        },
                    )
            except Exception as e:
                logger.warning("[Advisor] %s failed: %s", tool_name, e)
                tool_outputs[tool_name] = ""
                if progress_cb:
                    await progress_cb(
                        "tool_result",
                        {
                            "agent": self.AGENT_NAME,
                            "tool": tool_name,
                            "success": False,
                            "error": str(e),
                        },
                    )

        tasks = [_run_one(tool_request) for tool_request in tool_requests]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        context["tools_prefetched"] = True
