"""Career path knowledge helper for STEM advising."""

import base64
import logging
import re

from app.agents.tools.http_utils import fetch_json
from app.config import settings

logger = logging.getLogger(__name__)

_ONET_BASE = "https://services.onetcenter.org/ws"
_ESCO_SEARCH = "https://ec.europa.eu/esco/api/search"


def _onet_auth_header() -> str | None:
    user = (settings.ONET_USERNAME or "").strip()
    pwd = (settings.ONET_PASSWORD or "").strip()
    if not user or not pwd:
        return None
    token = base64.b64encode(f"{user}:{pwd}".encode("utf-8")).decode("ascii")
    return f"Basic {token}"


async def _onet_search(keyword: str, limit: int = 5) -> dict | None:
    auth = _onet_auth_header()
    if not auth:
        return None
    return await fetch_json(
        f"{_ONET_BASE}/online/search",
        params={"keyword": keyword, "end": str(limit)},
        headers={"Authorization": auth, "Accept": "application/json"},
        timeout_seconds=10.0,
        cache_ttl_seconds=86400,
    )


async def _onet_tasks(code: str) -> dict | None:
    auth = _onet_auth_header()
    if not auth:
        return None
    return await fetch_json(
        f"{_ONET_BASE}/online/occupations/{code}/summary/tasks",
        headers={"Authorization": auth, "Accept": "application/json"},
        timeout_seconds=10.0,
        cache_ttl_seconds=86400,
    )


async def _onet_skills(code: str) -> dict | None:
    auth = _onet_auth_header()
    if not auth:
        return None
    return await fetch_json(
        f"{_ONET_BASE}/online/occupations/{code}/summary/skills",
        headers={"Authorization": auth, "Accept": "application/json"},
        timeout_seconds=10.0,
        cache_ttl_seconds=86400,
    )


async def _esco_search(text: str, limit: int = 5) -> dict | None:
    lang = (settings.ESCO_LANGUAGE or "en").strip() or "en"
    return await fetch_json(
        _ESCO_SEARCH,
        params={"text": text, "language": lang, "limit": str(limit)},
        headers={"Accept": "application/json", "User-Agent": settings.WIKIDATA_USER_AGENT},
        timeout_seconds=10.0,
        cache_ttl_seconds=86400,
    )


CAREER_PATHS = {
    "computer_science": {
        "name": "Khoa hoc May tinh (Computer Science)",
        "required_skills": ["Toan", "Lap trinh", "Thuat toan", "Logic"],
        "related_fields": ["AI/ML", "Data Science", "Cybersecurity", "Software Engineering"],
        "career_options": [
            "Software Engineer ($120K-$200K/nam)",
            "ML Engineer ($130K-$220K/nam)",
            "Data Scientist ($110K-$180K/nam)",
            "Product Manager ($120K-$190K/nam)",
        ],
        "top_companies": ["Google", "Meta", "Apple", "Microsoft", "Amazon"],
        "growth_rate": "22% (2023-2033)",
    },
    "data_science": {
        "name": "Khoa hoc Du lieu (Data Science)",
        "required_skills": ["Thong ke", "Python/R", "SQL", "Machine Learning", "Truc quan hoa"],
        "related_fields": ["Computer Science", "Statistics", "Business Analytics"],
        "career_options": [
            "Data Scientist ($110K-$180K/nam)",
            "Data Analyst ($70K-$110K/nam)",
            "Business Intelligence Analyst ($80K-$130K/nam)",
            "ML Engineer ($130K-$220K/nam)",
        ],
        "top_companies": ["Google", "Netflix", "Airbnb", "Uber", "Spotify"],
        "growth_rate": "35% (2023-2033)",
    },
    "biomedical_engineering": {
        "name": "Ky thuat Y sinh (Biomedical Engineering)",
        "required_skills": ["Sinh hoc", "Hoa hoc", "Vat ly", "Ky thuat", "Lap trinh"],
        "related_fields": ["Medicine", "Biotechnology", "Pharmaceuticals"],
        "career_options": [
            "Biomedical Engineer ($70K-$120K/nam)",
            "Clinical Engineer ($65K-$100K/nam)",
            "R&D Scientist ($80K-$140K/nam)",
            "Regulatory Affairs Specialist ($70K-$110K/nam)",
        ],
        "top_companies": ["Johnson & Johnson", "Medtronic", "Boston Scientific", "Philips"],
        "growth_rate": "5% (2023-2033)",
    },
    "mechanical_engineering": {
        "name": "Ky thuat Co khi (Mechanical Engineering)",
        "required_skills": ["Vat ly", "Toan", "CAD/CAM", "Nhiet dong hoc", "Vat lieu"],
        "related_fields": ["Aerospace", "Automotive", "Robotics", "Energy"],
        "career_options": [
            "Mechanical Engineer ($75K-$120K/nam)",
            "Robotics Engineer ($85K-$140K/nam)",
            "Aerospace Engineer ($90K-$150K/nam)",
            "Product Design Engineer ($80K-$130K/nam)",
        ],
        "top_companies": ["Boeing", "Tesla", "SpaceX", "Toyota", "Siemens"],
        "growth_rate": "2% (2023-2033)",
    },
    "environmental_science": {
        "name": "Khoa hoc Moi truong (Environmental Science)",
        "required_skills": ["Sinh hoc", "Hoa hoc", "GIS", "Thong ke", "Chinh sach"],
        "related_fields": ["Sustainability", "Climate Science", "Conservation"],
        "career_options": [
            "Environmental Scientist ($65K-$100K/nam)",
            "Sustainability Consultant ($70K-$120K/nam)",
            "Climate Analyst ($75K-$110K/nam)",
            "Environmental Policy Analyst ($60K-$95K/nam)",
        ],
        "top_companies": ["EPA", "UNEP", "World Bank", "McKinsey Sustainability"],
        "growth_rate": "6% (2023-2033)",
    },
    "psychology": {
        "name": "Tam ly hoc (Psychology)",
        "required_skills": ["Phan tich", "Giao tiep", "Nghien cuu", "Thong ke", "Dong cam"],
        "related_fields": ["Clinical Psychology", "Counselling", "Neuroscience", "Behavioral Science"],
        "career_options": [
            "Assistant Psychologist",
            "Research Assistant",
            "Mental Health Support Worker",
            "HR / People Analyst",
        ],
        "top_companies": ["NHS", "Universities", "NGOs", "School systems", "Private clinics"],
        "growth_rate": "Steady demand in mental health and education sectors",
    },
}

_GENERIC_CAREER_KEYS = [
    "computer_science",
    "data_science",
    "mechanical_engineering",
    "psychology",
]

_GENERIC_QUERY_PHRASES = [
    "phan tich ho so",
    "ho so cua toi",
    "tu van",
    "du hoc",
    "profile",
    "study abroad",
]

_GENERIC_QUERY_TOKENS = {
    "phan",
    "tich",
    "ho",
    "so",
    "cua",
    "toi",
    "tu",
    "van",
    "du",
    "hoc",
    "study",
    "abroad",
    "profile",
}


def _is_generic_advising_query(query: str) -> bool:
    lowered = (query or "").strip().lower()
    if not lowered:
        return True
    if any(phrase in lowered for phrase in _GENERIC_QUERY_PHRASES):
        return True

    tokens = [token for token in re.findall(r"[a-z0-9_]+", lowered) if len(token) > 2]
    if not tokens:
        return True
    return all(token in _GENERIC_QUERY_TOKENS for token in tokens)


async def search_career_paths(query: str, field: str | None = None) -> str:
    """Return career-path guidance for a STEM field."""

    lookup_query = (field or query or "").strip()
    generic_mode = not field and _is_generic_advising_query(lookup_query)
    external_sections: list[str] = []

    if lookup_query and not generic_mode:
        try:
            onet = await _onet_search(lookup_query, limit=5)
            onet_occupations = (
                ((onet or {}).get("occupation") or []) if isinstance(onet, dict) else []
            )
            if onet_occupations:
                top = onet_occupations[0] if isinstance(onet_occupations[0], dict) else {}
                code = top.get("code")
                title = top.get("title") or top.get("name") or ""
                if code:
                    tasks = await _onet_tasks(code) or {}
                    skills = await _onet_skills(code) or {}

                    task_items = (
                        (tasks.get("task") or []) if isinstance(tasks, dict) else []
                    )
                    skill_items = (
                        (skills.get("skill") or []) if isinstance(skills, dict) else []
                    )

                    top_tasks = [
                        t.get("description")
                        for t in task_items[:5]
                        if isinstance(t, dict) and t.get("description")
                    ]
                    top_skills = [
                        s.get("name")
                        for s in skill_items[:8]
                        if isinstance(s, dict) and s.get("name")
                    ]

                    parts = [f"### O*NET (US) - {title} ({code})"]
                    if top_skills:
                        parts.append(f"- **Ky nang (top):** {', '.join(top_skills)}")
                    if top_tasks:
                        parts.append("- **Nhiem vu (top):**")
                        parts.extend([f"  - {t}" for t in top_tasks])
                    external_sections.append("\n".join(parts))
        except Exception as e:
            logger.warning("O*NET lookup failed: %s", e)

        try:
            esco = await _esco_search(lookup_query, limit=5)
            candidates = []
            if isinstance(esco, dict):
                embedded = esco.get("_embedded") or {}
                candidates = (
                    embedded.get("results")
                    or embedded.get("resource")
                    or esco.get("results")
                    or []
                )
            rows = []
            for candidate in candidates[:5]:
                if not isinstance(candidate, dict):
                    continue
                title = (
                    candidate.get("title")
                    or candidate.get("preferredLabel")
                    or candidate.get("label")
                    or candidate.get("name")
                    or ""
                )
                uri = (
                    candidate.get("uri")
                    or candidate.get("_links", {}).get("self", {}).get("href")
                    or ""
                )
                if title:
                    rows.append(f"- {title}{f' ({uri})' if uri else ''}")
            if rows:
                external_sections.append(
                    "### ESCO (EU) - Ket qua tu kho thuat ngu nghe/ky nang\n"
                    + "\n".join(rows)
                )
        except Exception as e:
            logger.warning("ESCO lookup failed: %s", e)

    query_lower = lookup_query.lower()
    matched = []

    for key, data in CAREER_PATHS.items():
        searchable = f"{key} {data['name']} {' '.join(data['related_fields'])}".lower()
        if any(word in searchable for word in query_lower.split() if len(word) > 2):
            matched.append(data)

    if not matched:
        if generic_mode:
            matched = [CAREER_PATHS[key] for key in _GENERIC_CAREER_KEYS]
        else:
            matched = list(CAREER_PATHS.values())[:3]

    if generic_mode:
        output_lines = [
            "Ban chua neu ro nganh muc tieu, nen duoi day la 3 huong STEM pho bien de tham khao ban dau:\n"
        ]
    else:
        output_lines = [f"Tim thay {len(matched)} nganh nghe lien quan:\n"]

    for career in matched:
        output_lines.append(
            f"### {career['name']}\n"
            f"- **Ky nang can thiet:** {', '.join(career['required_skills'])}\n"
            f"- **Nganh lien quan:** {', '.join(career['related_fields'])}\n"
            f"- **Nghe nghiep:**\n"
            + "\n".join(f"  - {option}" for option in career["career_options"])
            + f"\n- **Cong ty hang dau:** {', '.join(career['top_companies'])}\n"
            f"- **Toc do tang truong:** {career['growth_rate']}\n"
        )

    if external_sections:
        return "\n\n".join(external_sections + ["---"] + ["\n".join(output_lines)])
    return "\n".join(output_lines)
