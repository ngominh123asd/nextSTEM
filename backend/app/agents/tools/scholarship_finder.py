"""Scholarship Finder — Tìm kiếm học bổng phù hợp.

Dữ liệu tĩnh về các gói học bổng STEM phổ biến.
Sau này có thể kết nối API hoặc web scraping.
"""

import logging
from datetime import datetime

from app.config import settings
from app.agents.tools.http_utils import fetch_json

logger = logging.getLogger(__name__)

_TAVILY_SEARCH = "https://api.tavily.com/search"


async def _tavily_scholarship_links(
    query: str,
    country: str | None,
    max_results: int = 5,
) -> list[dict]:
    api_key = (settings.TAVILY_API_KEY or "").strip()
    if not api_key:
        return []

    # Keep queries conservative and bias to official sources.
    q = query
    if country:
        q = f"{q} {country}"
    q = f"{q} scholarship official site deadline"

    data = await fetch_json(
        _TAVILY_SEARCH,
        method="POST",
        json_body={
            "api_key": api_key,
            "query": q,
            "search_depth": "basic",
            "max_results": max_results,
            "include_answer": False,
            "include_raw_content": False,
        },
        timeout_seconds=12.0,
        cache_ttl_seconds=86400,
    )
    results = (data or {}).get("results") or []
    out: list[dict] = []
    for r in results[:max_results]:
        if not isinstance(r, dict):
            continue
        title = r.get("title") or ""
        url = r.get("url") or ""
        if title and url:
            out.append({"title": title, "url": url})
    return out

# ─────────────────────────── Scholarship Data ───────────────────────────

SCHOLARSHIPS = [
    {
        "name": "Fulbright Foreign Student Program",
        "country": "USA",
        "coverage": "Toàn phần (học phí, sinh hoạt, bảo hiểm, vé máy bay)",
        "fields": ["All STEM fields"],
        "gpa_min": 3.5,
        "ielts_min": 6.5,
        "deadline": "Tháng 4 hàng năm",
        "note": "Cần cam kết quay về nước 2 năm sau khi tốt nghiệp",
        "link": "https://vn.usembassy.gov/education-culture/fulbright/",
    },
    {
        "name": "MEXT Scholarship (Japan)",
        "country": "Japan",
        "coverage": "Toàn phần (học phí, sinh hoạt ¥117,000/tháng, vé máy bay)",
        "fields": ["Engineering", "Science", "IT", "Mathematics"],
        "gpa_min": 3.3,
        "ielts_min": None,
        "deadline": "Tháng 4-5 hàng năm",
        "note": "Học tiếng Nhật 1 năm trước khi vào ĐH",
        "link": "https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html",
    },
    {
        "name": "ASEAN Scholarship (Singapore)",
        "country": "Singapore",
        "coverage": "Học phí + Phụ cấp sinh hoạt",
        "fields": ["All fields at NUS, NTU, SMU"],
        "gpa_min": 3.4,
        "ielts_min": 6.0,
        "deadline": "Tháng 3 hàng năm",
        "note": "Dành cho học sinh ASEAN, cam kết làm việc tại Singapore 3 năm",
        "link": "https://www.moe.gov.sg/financial-matters/awards-scholarships/asean",
    },
    {
        "name": "Korean Government Scholarship (KGSP)",
        "country": "South Korea",
        "coverage": "Toàn phần (học phí, sinh hoạt ₩900,000/tháng, vé máy bay)",
        "fields": ["All fields at Korean universities"],
        "gpa_min": 3.0,
        "ielts_min": 5.5,
        "deadline": "Tháng 2-3 hàng năm",
        "note": "Học tiếng Hàn 1 năm, GPA ≥ 80%",
        "link": "https://www.studyinkorea.go.kr/",
    },
    {
        "name": "Chevening Scholarship (UK)",
        "country": "UK",
        "coverage": "Toàn phần (học phí, sinh hoạt, vé máy bay) — Master 1 năm",
        "fields": ["All STEM fields"],
        "gpa_min": 3.3,
        "ielts_min": 6.5,
        "deadline": "Tháng 11 hàng năm",
        "note": "Cần 2+ năm kinh nghiệm làm việc, cam kết quay về nước",
        "link": "https://www.chevening.org/",
    },
    {
        "name": "Australia Awards Scholarship",
        "country": "Australia",
        "coverage": "Toàn phần (học phí, sinh hoạt, vé máy bay, bảo hiểm)",
        "fields": ["All STEM fields"],
        "gpa_min": 3.2,
        "ielts_min": 6.5,
        "deadline": "Tháng 4-5 hàng năm",
        "note": "Ưu tiên phát triển bền vững, 2+ năm kinh nghiệm",
        "link": "https://www.dfat.gov.au/people-to-people/australia-awards",
    },
    {
        "name": "VinGroup Scholarship (VinUni / Overseas)",
        "country": "Vietnam/Overseas",
        "coverage": "Toàn phần hoặc bán phần tùy chương trình",
        "fields": ["Computer Science", "Engineering", "Health Science"],
        "gpa_min": 3.5,
        "ielts_min": 6.5,
        "deadline": "Theo từng đợt",
        "note": "Dành cho học sinh Việt Nam xuất sắc",
        "link": "https://vinuni.edu.vn/scholarships/",
    },
]


# ─────────────────────────── Tool Function ───────────────────────────


async def find_scholarships(
    query: str,
    country: str | None = None,
    gpa: float | None = None,
) -> str:
    """Tìm học bổng phù hợp.

    Args:
        query: Yêu cầu tìm kiếm
        country: Lọc theo quốc gia
        gpa: GPA học sinh

    Returns:
        Formatted string kết quả
    """
    results = SCHOLARSHIPS.copy()

    # Filter by country
    if country:
        country_lower = country.lower()
        results = [s for s in results if country_lower in s["country"].lower()]

    # Filter by GPA
    if gpa:
        results = [s for s in results if s["gpa_min"] <= gpa + 0.1]

    # Keyword search
    query_lower = query.lower()
    if any(kw in query_lower for kw in ["toàn phần", "full"]):
        results = [s for s in results if "Toàn phần" in s["coverage"]]

    if not results:
        return "Không tìm thấy học bổng phù hợp với tiêu chí."

    output_lines = [f"Tìm thấy {len(results)} học bổng phù hợp:\n"]
    for i, s in enumerate(results, 1):
        ielts = f"IELTS ≥ {s['ielts_min']}" if s["ielts_min"] else "Không yêu cầu IELTS"
        output_lines.append(
            f"{i}. **{s['name']}**\n"
            f"   - 🌍 Quốc gia: {s['country']}\n"
            f"   - 💰 Mức hỗ trợ: {s['coverage']}\n"
            f"   - 📚 Ngành: {', '.join(s['fields'])}\n"
            f"   - 📊 GPA tối thiểu: {s['gpa_min']} | {ielts}\n"
            f"   - 📅 Deadline: {s['deadline']}\n"
            f"   - 📝 Lưu ý: {s['note']}\n"
            f"   - 🔗 Link: {s['link']}\n"
        )

    # Optional: enrich with recent official links from Tavily Search.
    try:
        links = await _tavily_scholarship_links(query=query, country=country, max_results=5)
    except Exception:
        links = []

    if links:
        output_lines.append("\n---\nNguá»“n tham kháº£o (Tavily search):")
        for i, it in enumerate(links, 1):
            output_lines.append(f"- {i}. {it['title']}: {it['url']}")

    return "\n".join(output_lines)
