"""Structured advisor tool contracts and profile resolution helpers."""

from __future__ import annotations

import re
from typing import Any

from pydantic import BaseModel, Field

_COUNTRY_ALIASES = {
    "USA": ["usa", "united states", "my", "mỹ", "us"],
    "Canada": ["canada"],
    "Singapore": ["singapore"],
    "UK": ["uk", "united kingdom", "england", "britain", "anh"],
    "Australia": ["australia", "uc", "úc"],
    "Japan": ["japan", "nhat", "nhật"],
    "South Korea": ["south korea", "korea", "han", "hàn"],
    "Switzerland": ["switzerland", "thuy si", "thụy sĩ"],
    "Netherlands": ["netherlands", "ha lan", "hà lan", "dutch"],
    "Germany": ["germany", "duc", "đức"],
    "Europe": ["europe", "chau au", "châu âu", "eu"],
}

_FIELD_ALIASES = {
    "Computer Science": [
        "computer science",
        "cs",
        "khoa hoc may tinh",
        "khoa học máy tính",
    ],
    "AI": ["artificial intelligence", "ai", "tri tue nhan tao", "trí tuệ nhân tạo"],
    "Data Science": [
        "data science",
        "data",
        "business analytics",
        "phan tich du lieu",
        "phân tích dữ liệu",
    ],
    "Engineering": ["engineering", "engineer", "ky thuat", "kỹ thuật"],
    "Biomedical Engineering": [
        "biomedical",
        "bioengineering",
        "y sinh",
        "biotech",
        "biotechnology",
    ],
    "Mathematics": ["mathematics", "math", "toan", "toán"],
    "Physics": ["physics", "vat ly", "vật lý"],
    "Psychology": ["psychology", "tam ly", "tâm lý", "tam ly hoc", "tâm lý học"],
}

_TERM_ALIASES = {
    "fall": ["fall", "autumn", "ky thu", "kỳ thu", "mua thu", "mùa thu"],
    "spring": ["spring", "ky xuan", "kỳ xuân", "mua xuan", "mùa xuân"],
    "summer": ["summer", "ky he", "kỳ hè", "mua he", "mùa hè"],
    "winter": ["winter", "ky dong", "kỳ đông", "mua dong", "mùa đông"],
}

_PROFILE_ANALYSIS_KEYWORDS = [
    "ho so",
    "hồ sơ",
    "profile",
    "phan tich ho so",
    "phân tích hồ sơ",
    "review ho so",
    "đánh giá hồ sơ",
]

_ROADMAP_KEYWORDS = [
    "roadmap",
    "lo trinh",
    "lộ trình",
    "ke hoach",
    "kế hoạch",
    "timeline",
    "12 thang",
    "12 tháng",
]

_SCHOLARSHIP_KEYWORDS = [
    "hoc bong",
    "học bổng",
    "scholarship",
    "financial aid",
    "funding",
]

_UNIVERSITY_KEYWORDS = [
    "truong",
    "trường",
    "dai hoc",
    "đại học",
    "university",
    "college",
    "ranking",
    "xep hang",
    "xếp hạng",
    "du hoc",
    "du học",
]

_CAREER_KEYWORDS = [
    "career",
    "nganh",
    "ngành",
    "ky nang",
    "kỹ năng",
    "viec lam",
    "việc làm",
]


class AdvisorProfileContext(BaseModel):
    """Normalized profile fields used by advisor tools."""

    grade: str | None = None
    current_stage: str | None = None
    school: str | None = None
    subjects: str | None = None
    gpa_value: float | None = None
    gpa_scale: float | None = None
    target_countries: list[str] = Field(default_factory=list)
    target_fields: list[str] = Field(default_factory=list)
    budget_amount: float | None = None
    budget_currency: str | None = None
    needs_scholarship: bool | None = None
    ielts: float | None = None
    toefl: float | None = None
    sat: int | None = None
    act: int | None = None
    intake_year: int | None = None
    intake_term: str | None = None
    timeline_target: str | None = None
    goals: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    notes: str | None = None

    @classmethod
    def from_input(
        cls,
        raw: "AdvisorProfileContext | dict[str, Any] | None",
    ) -> "AdvisorProfileContext":
        if raw is None:
            return cls()
        if isinstance(raw, cls):
            return raw

        data = dict(raw)
        if "target_country" in data and "target_countries" not in data:
            data["target_countries"] = data.pop("target_country")
        if "target_field" in data and "target_fields" not in data:
            data["target_fields"] = data.pop("target_field")

        normalized = cls(
            grade=_normalize_grade(data.get("grade")),
            current_stage=_normalize_stage(data.get("current_stage")),
            school=_normalize_string(data.get("school")),
            subjects=_normalize_string(data.get("subjects")),
            gpa_value=_to_float(data.get("gpa_value")),
            gpa_scale=_to_float(data.get("gpa_scale")),
            target_countries=_normalize_list(
                data.get("target_countries"), country=True
            ),
            target_fields=_normalize_list(data.get("target_fields"), field=True),
            budget_amount=_to_float(data.get("budget_amount")),
            budget_currency=_normalize_currency(data.get("budget_currency")),
            needs_scholarship=_to_bool(data.get("needs_scholarship")),
            ielts=_to_float(data.get("ielts")),
            toefl=_to_float(data.get("toefl")),
            sat=_to_int(data.get("sat")),
            act=_to_int(data.get("act")),
            intake_year=_to_int(data.get("intake_year")),
            intake_term=_normalize_term(data.get("intake_term")),
            timeline_target=_normalize_string(data.get("timeline_target")),
            goals=_normalize_list(data.get("goals")),
            interests=_normalize_list(data.get("interests")),
            notes=_normalize_string(data.get("notes")),
        )
        return normalized

    def has_value(self, field_name: str) -> bool:
        value = getattr(self, field_name, None)
        return _has_value(value)

    def to_resolved_dict(self) -> dict[str, Any]:
        data = self.model_dump(exclude_none=True)
        for key in ("target_countries", "target_fields", "goals", "interests"):
            if not data.get(key):
                data.pop(key, None)
        return data


class RequiredParamGroup(BaseModel):
    field_name: str
    any_of: list[str]
    question: str


class ToolSpec(BaseModel):
    tool_name: str
    description: str
    blocking: bool = True
    required_groups: list[RequiredParamGroup] = Field(default_factory=list)
    optional_fields: list[str] = Field(default_factory=list)


class ToolExecutionRequest(BaseModel):
    tool_name: str
    description: str
    params: dict[str, Any]
    missing_fields: list[str] = Field(default_factory=list)
    blocking: bool = True
    resolved_from: dict[str, str] = Field(default_factory=dict)
    skip_reason: str | None = None


class ClarificationPayload(BaseModel):
    missing_fields: list[str]
    blocked_tools: list[str]
    questions: list[str]
    resolved_from: dict[str, str]
    can_continue: bool = True
    continue_message: str = "tiep tuc"


class AdvisorExecutionBundle(BaseModel):
    selected_tools: list[str]
    profile: AdvisorProfileContext
    resolved_from: dict[str, str] = Field(default_factory=dict)
    tool_requests: list[ToolExecutionRequest] = Field(default_factory=list)
    clarification: ClarificationPayload | None = None


_TOOL_SPECS = {
    "career_knowledge": ToolSpec(
        tool_name="career_knowledge",
        description="Explain career paths, skills, and outcomes for the target STEM field.",
        blocking=False,
        required_groups=[],
        optional_fields=["target_fields"],
    ),
    "university_explorer": ToolSpec(
        tool_name="university_explorer",
        description="Find universities that match the student's target country/region and field.",
        blocking=True,
        required_groups=[
            RequiredParamGroup(
                field_name="target_countries",
                any_of=["target_countries"],
                question="Bạn muốn du học nước nào hoặc khu vực nào? (VD: Singapore, UK, Europe)",
            ),
            RequiredParamGroup(
                field_name="target_fields",
                any_of=["target_fields"],
                question="Bạn muốn học ngành nào? (VD: Computer Science, AI, Data Science)",
            ),
        ],
        optional_fields=["gpa_value", "ielts", "sat"],
    ),
    "scholarship_finder": ToolSpec(
        tool_name="scholarship_finder",
        description="Find scholarships that fit the student's destination and academic profile.",
        blocking=True,
        required_groups=[
            RequiredParamGroup(
                field_name="target_countries",
                any_of=["target_countries"],
                question="Bạn muốn săn học bổng cho nước nào hoặc khu vực nào?",
            ),
            RequiredParamGroup(
                field_name="gpa_value",
                any_of=["gpa_value"],
                question="GPA hoặc điểm trung bình hiện tại của bạn là bao nhiêu? (thang 10 hoặc 4)",
            ),
            RequiredParamGroup(
                field_name="scholarship_context",
                any_of=["needs_scholarship", "budget_amount"],
                question="Bạn cần mức học bổng/tài trợ ra sao hoặc ngân sách hiện tại là bao nhiêu?",
            ),
        ],
        optional_fields=["ielts", "toefl", "sat", "target_fields"],
    ),
    "roadmap_generator": ToolSpec(
        tool_name="roadmap_generator",
        description="Generate a personalized study-abroad preparation roadmap.",
        blocking=True,
        required_groups=[
            RequiredParamGroup(
                field_name="student_stage",
                any_of=["grade", "current_stage"],
                question="Bạn đang học lớp mấy hoặc đang ở giai đoạn nào? (VD: lớp 11, transfer, gap year)",
            ),
            RequiredParamGroup(
                field_name="timeline_target",
                any_of=["intake_year", "timeline_target"],
                question="Bạn dự kiến intake năm nào hoặc muốn roadmap trong bao lâu? (VD: Fall 2027 hoặc 12 tháng)",
            ),
        ],
        optional_fields=["target_countries", "target_fields", "ielts", "sat"],
    ),
}


def extract_profile_facts(text: str) -> AdvisorProfileContext:
    """Extract explicit profile facts from a user message."""

    normalized = _normalize_text(text)
    grade = _extract_grade(normalized)
    current_stage = _extract_stage(normalized)
    gpa_value, gpa_scale = _extract_gpa(normalized)
    budget_amount, budget_currency = _extract_budget(normalized)
    intake_year = _extract_intake_year(normalized)
    intake_term = _extract_intake_term(normalized)
    timeline_target = _extract_timeline_target(normalized)

    return AdvisorProfileContext(
        grade=grade,
        current_stage=current_stage,
        gpa_value=gpa_value,
        gpa_scale=gpa_scale,
        target_countries=_extract_countries(normalized),
        target_fields=_extract_fields(normalized),
        budget_amount=budget_amount,
        budget_currency=budget_currency,
        needs_scholarship=_extract_scholarship_need(normalized),
        ielts=_extract_score(normalized, "ielts"),
        toefl=_extract_score(normalized, "toefl"),
        sat=_extract_score(normalized, "sat", as_int=True),
        act=_extract_score(normalized, "act", as_int=True),
        intake_year=intake_year,
        intake_term=intake_term,
        timeline_target=timeline_target,
    )


def get_mem0_profile_hints(
    session_id: str | None = None,
    user_query: str | None = None,
) -> AdvisorProfileContext:
    """Placeholder for future semantic memory integration."""

    _ = session_id, user_query
    return AdvisorProfileContext()


def merge_profile_contexts(
    *,
    current_turn: AdvisorProfileContext | dict[str, Any] | None = None,
    session_facts: AdvisorProfileContext | dict[str, Any] | None = None,
    db_profile: AdvisorProfileContext | dict[str, Any] | None = None,
    mem0_hints: AdvisorProfileContext | dict[str, Any] | None = None,
) -> tuple[AdvisorProfileContext, dict[str, str]]:
    """Merge profile context with explicit precedence."""

    merged = AdvisorProfileContext()
    resolved_from: dict[str, str] = {}

    for source_name, raw in (
        ("mem0", mem0_hints),
        ("db_profile", db_profile),
        ("session_memory", session_facts),
        ("current_turn", current_turn),
    ):
        ctx = AdvisorProfileContext.from_input(raw)
        for field_name, value in ctx.to_resolved_dict().items():
            setattr(merged, field_name, value)
            resolved_from[field_name] = source_name

    return merged, resolved_from


def infer_advisor_tools(
    query: str,
    *,
    mode: str = "general",
    profile: AdvisorProfileContext | dict[str, Any] | None = None,
) -> list[str]:
    """Infer the right advisor tools from query, mode, and known profile data."""

    profile_ctx = AdvisorProfileContext.from_input(profile)
    text = _normalize_text(extract_user_intent_query(query))
    selected: list[str] = []

    is_profile_analysis = any(keyword in text for keyword in _PROFILE_ANALYSIS_KEYWORDS)
    asks_scholarship = any(keyword in text for keyword in _SCHOLARSHIP_KEYWORDS)
    asks_roadmap = any(keyword in text for keyword in _ROADMAP_KEYWORDS)
    asks_university = any(keyword in text for keyword in _UNIVERSITY_KEYWORDS)
    asks_career = any(keyword in text for keyword in _CAREER_KEYWORDS)

    if mode == "career":
        selected.append("career_knowledge")
    elif mode == "university":
        selected.append("university_explorer")

    if is_profile_analysis:
        selected.extend(
            [
                "career_knowledge",
                "university_explorer",
                "scholarship_finder",
                "roadmap_generator",
            ]
        )

    if asks_university or (profile_ctx.target_countries and profile_ctx.target_fields):
        selected.append("university_explorer")

    if asks_career or profile_ctx.target_fields:
        selected.append("career_knowledge")

    if asks_scholarship or profile_ctx.needs_scholarship is True:
        selected.append("scholarship_finder")
    elif profile_ctx.budget_amount is not None and profile_ctx.target_countries:
        selected.append("scholarship_finder")

    if asks_roadmap or profile_ctx.timeline_target or profile_ctx.intake_year:
        selected.append("roadmap_generator")

    if not selected:
        selected.append("career_knowledge")

    return list(dict.fromkeys(selected))


def build_advisor_execution_bundle(
    *,
    query: str,
    mode: str = "general",
    selected_tools: list[str] | None = None,
    current_turn_facts: AdvisorProfileContext | dict[str, Any] | None = None,
    session_facts: AdvisorProfileContext | dict[str, Any] | None = None,
    db_profile: AdvisorProfileContext | dict[str, Any] | None = None,
    mem0_hints: AdvisorProfileContext | dict[str, Any] | None = None,
    allow_incomplete: bool = False,
) -> AdvisorExecutionBundle:
    """Resolve tool params, detect missing required fields, and prepare clarification."""

    merged_profile, resolved_from = merge_profile_contexts(
        current_turn=current_turn_facts,
        session_facts=session_facts,
        db_profile=db_profile,
        mem0_hints=mem0_hints,
    )
    inferred_tools = infer_advisor_tools(
        query,
        mode=mode,
        profile=merged_profile,
    )
    chosen_tools = (
        list(dict.fromkeys((selected_tools or []) + inferred_tools)) or inferred_tools
    )

    tool_requests: list[ToolExecutionRequest] = []
    missing_fields: list[str] = []
    blocked_tools: list[str] = []
    questions: list[str] = []

    for tool_name in chosen_tools:
        spec = _TOOL_SPECS[tool_name]
        tool_missing: list[str] = []
        for group in spec.required_groups:
            if not any(
                merged_profile.has_value(field_name) for field_name in group.any_of
            ):
                tool_missing.append(group.field_name)
                if group.field_name not in missing_fields:
                    missing_fields.append(group.field_name)
                if group.question not in questions:
                    questions.append(group.question)

        request = ToolExecutionRequest(
            tool_name=tool_name,
            description=spec.description,
            params=_build_tool_params(tool_name, query, merged_profile),
            missing_fields=tool_missing,
            blocking=spec.blocking,
            resolved_from=_filter_resolved_from(tool_name, resolved_from),
        )

        if tool_missing and spec.blocking:
            blocked_tools.append(tool_name)
            if allow_incomplete:
                request.skip_reason = "Missing required params: " + ", ".join(
                    tool_missing
                )

        tool_requests.append(request)

    clarification = None
    if blocked_tools and not allow_incomplete:
        clarification = ClarificationPayload(
            missing_fields=missing_fields,
            blocked_tools=blocked_tools,
            questions=questions,
            resolved_from=resolved_from,
        )

    return AdvisorExecutionBundle(
        selected_tools=chosen_tools,
        profile=merged_profile,
        resolved_from=resolved_from,
        tool_requests=tool_requests,
        clarification=clarification,
    )


def _build_tool_params(
    tool_name: str,
    query: str,
    profile: AdvisorProfileContext,
) -> dict[str, Any]:
    cleaned_query = extract_user_intent_query(query)
    primary_country = profile.target_countries[0] if profile.target_countries else None
    primary_field = profile.target_fields[0] if profile.target_fields else None

    if tool_name == "university_explorer":
        return {
            "query": cleaned_query,
            "country": primary_country,
            "field": primary_field,
            "gpa": profile.gpa_value,
        }
    if tool_name == "career_knowledge":
        return {
            "query": primary_field or cleaned_query,
            "field": primary_field,
        }
    if tool_name == "scholarship_finder":
        return {
            "query": cleaned_query,
            "country": primary_country,
            "gpa": profile.gpa_value,
        }
    if tool_name == "roadmap_generator":
        return {
            "query": cleaned_query,
            "grade": profile.grade,
            "current_stage": profile.current_stage,
            "intake_year": profile.intake_year,
            "intake_term": profile.intake_term,
            "timeline_target": profile.timeline_target,
            "target_country": primary_country,
            "target_field": primary_field,
        }
    return {"query": query}


def extract_user_intent_query(query: str) -> str:
    """Remove injected history and continuation markers before tool execution."""

    if not query:
        return ""

    current_match = re.search(
        r"\[Câu hỏi hiện tại\]:\s*(.+)$",
        query,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if current_match:
        query = current_match.group(1).strip()

    query = re.sub(
        r"\[Thông tin bổ sung từ người dùng\]:\s*",
        "",
        query,
        flags=re.IGNORECASE,
    )
    query = query.replace("__NEXTSTEM_CONTINUE__", "")
    query = re.sub(r"\s+", " ", query).strip()
    return query


def _filter_resolved_from(
    tool_name: str, resolved_from: dict[str, str]
) -> dict[str, str]:
    if tool_name == "career_knowledge":
        keep = {"target_fields"}
    elif tool_name == "university_explorer":
        keep = {"target_countries", "target_fields", "gpa_value", "ielts", "sat"}
    elif tool_name == "scholarship_finder":
        keep = {"target_countries", "gpa_value", "needs_scholarship", "budget_amount"}
    else:
        keep = {
            "grade",
            "current_stage",
            "intake_year",
            "intake_term",
            "timeline_target",
        }
    return {key: value for key, value in resolved_from.items() if key in keep}


def _normalize_text(text: str | None) -> str:
    return (text or "").strip().lower()


def _normalize_list(
    value: Any,
    *,
    country: bool = False,
    field: bool = False,
) -> list[str]:
    if value is None:
        return []
    items = value if isinstance(value, list) else [value]
    normalized: list[str] = []
    for item in items:
        text = _normalize_string(item)
        if not text:
            continue
        if country:
            text = _canonicalize_country(text) or text
        if field:
            text = _canonicalize_field(text) or text
        if text not in normalized:
            normalized.append(text)
    return normalized


def _normalize_string(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return str(value).strip() or None


def _normalize_currency(value: Any) -> str | None:
    text = _normalize_string(value)
    if not text:
        return None
    upper = text.upper()
    if "USD" in upper or "$" in text:
        return "USD"
    if "VND" in upper or "VNĐ" in upper or "DONG" in upper:
        return "VND"
    return upper


def _normalize_grade(value: Any) -> str | None:
    text = _normalize_string(value)
    if not text:
        return None
    normalized = _normalize_text(text)
    grade_match = re.search(r"(?:lop|lớp|grade)\s*(9|10|11|12)", normalized)
    if grade_match:
        return f"grade {grade_match.group(1)}"
    return text


def _normalize_stage(value: Any) -> str | None:
    text = _normalize_string(value)
    if not text:
        return None
    normalized = _normalize_text(text)
    if (
        "transfer" in normalized
        or "chuyen truong" in normalized
        or "chuyển trường" in normalized
    ):
        return "transfer"
    if "gap" in normalized:
        return "gap year"
    if "master" in normalized or "thac si" in normalized or "thạc sĩ" in normalized:
        return "master"
    return text


def _normalize_term(value: Any) -> str | None:
    text = _normalize_string(value)
    if not text:
        return None
    lowered = _normalize_text(text)
    for canonical, aliases in _TERM_ALIASES.items():
        if any(alias in lowered for alias in aliases):
            return canonical
    return lowered


def _to_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _to_bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    text = _normalize_text(str(value))
    if text in {"true", "1", "yes", "co", "có", "can", "cần"}:
        return True
    if text in {"false", "0", "no", "khong", "không"}:
        return False
    return None


def _has_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, list):
        return bool(value)
    return True


def _extract_grade(text: str) -> str | None:
    match = re.search(r"(?:lop|lớp|grade)\s*(9|10|11|12)\b", text)
    if match:
        return f"grade {match.group(1)}"
    return None


def _extract_stage(text: str) -> str | None:
    if any(token in text for token in ["transfer", "chuyen truong", "chuyển trường"]):
        return "transfer"
    if "gap year" in text or "gap" in text:
        return "gap year"
    if any(token in text for token in ["master", "thac si", "thạc sĩ"]):
        return "master"
    return None


def _extract_gpa(text: str) -> tuple[float | None, float | None]:
    patterns = [
        re.compile(
            r"gpa\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*/\s*(4(?:[.,]0+)?|10(?:[.,]0+)?)"
        ),
        re.compile(
            r"(?:gpa|điểm trung bình|diem trung binh)\s*[:=]?\s*(\d+(?:[.,]\d+)?)"
        ),
    ]
    for pattern in patterns:
        match = pattern.search(text)
        if not match:
            continue
        value = float(match.group(1).replace(",", "."))
        scale = None
        if len(match.groups()) > 1 and match.group(2):
            scale = float(match.group(2).replace(",", "."))
        elif value <= 4.0:
            scale = 4.0
        elif value <= 10.0:
            scale = 10.0
        return value, scale
    return None, None


def _extract_countries(text: str) -> list[str]:
    found: list[str] = []
    for canonical, aliases in _COUNTRY_ALIASES.items():
        if any(re.search(rf"\b{re.escape(alias)}\b", text) for alias in aliases):
            found.append(canonical)
    return found


def _extract_fields(text: str) -> list[str]:
    found: list[str] = []
    for canonical, aliases in _FIELD_ALIASES.items():
        if any(re.search(rf"\b{re.escape(alias)}\b", text) for alias in aliases):
            found.append(canonical)
    return found


def _extract_score(
    text: str, label: str, *, as_int: bool = False
) -> float | int | None:
    match = re.search(rf"{label}\s*[:=]?\s*(\d+(?:[.,]\d+)?)", text)
    if not match:
        return None
    raw = match.group(1).replace(",", ".")
    return int(float(raw)) if as_int else float(raw)


def _extract_budget(text: str) -> tuple[float | None, str | None]:
    if not any(
        token in text
        for token in ["budget", "ngan sach", "ngân sách", "tai chinh", "tài chính"]
    ):
        return None, None
    match = re.search(
        r"(\$?\s*\d[\d,.]*)\s*(usd|vnd|trieu|triệu|million|m)?",
        text,
    )
    if not match:
        return None, None

    raw_amount = match.group(1).replace("$", "").replace(",", "").strip()
    try:
        amount = float(raw_amount)
    except ValueError:
        return None, None

    unit = (match.group(2) or "").lower()
    currency = None
    if unit in {"usd", "million", "m"} or "$" in match.group(1):
        currency = "USD"
        if unit in {"million", "m"}:
            amount *= 1_000_000
    elif unit in {"vnd", "trieu", "triệu"}:
        currency = "VND"
        if unit in {"trieu", "triệu"}:
            amount *= 1_000_000

    return amount, currency


def _extract_scholarship_need(text: str) -> bool | None:
    if any(
        token in text
        for token in ["khong can hoc bong", "không cần học bổng", "no scholarship"]
    ):
        return False
    if any(token in text for token in _SCHOLARSHIP_KEYWORDS):
        return True
    return None


def _extract_intake_year(text: str) -> int | None:
    match = re.search(r"\b(20\d{2})\b", text)
    if not match:
        return None
    return int(match.group(1))


def _extract_intake_term(text: str) -> str | None:
    for canonical, aliases in _TERM_ALIASES.items():
        if any(alias in text for alias in aliases):
            return canonical
    return None


def _extract_timeline_target(text: str) -> str | None:
    match = re.search(
        r"\b(\d{1,2})\s*(thang|tháng|month|months|nam|năm|year|years)\b", text
    )
    if not match:
        return None
    return f"{match.group(1)} {match.group(2)}"


def _canonicalize_country(text: str) -> str | None:
    lowered = _normalize_text(text)
    for canonical, aliases in _COUNTRY_ALIASES.items():
        if lowered == canonical.lower() or lowered in aliases:
            return canonical
    return None


def _canonicalize_field(text: str) -> str | None:
    lowered = _normalize_text(text)
    for canonical, aliases in _FIELD_ALIASES.items():
        if lowered == canonical.lower() or lowered in aliases:
            return canonical
    return None
