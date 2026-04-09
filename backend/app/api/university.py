"""University Search API — Tìm kiếm trường đại học.

POST /api/v1/university/search → Kết quả tìm kiếm dạng JSON
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.agents.tools.university_explorer import explore_universities

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/university", tags=["university"])


class UniversitySearchRequest(BaseModel):
    query: str
    country: Optional[str] = None
    field: Optional[str] = None
    gpa: Optional[float] = None
    max_results: int = 10


class UniversityResult(BaseModel):
    name: str
    country: str
    ranking: Optional[int] = None
    fields: list[str] = []
    website: Optional[str] = None
    gpa_min: Optional[float] = None
    sat_min: Optional[int] = None
    ielts_min: Optional[float] = None
    tuition_usd: Optional[int] = None
    acceptance_rate: Optional[float] = None
    scholarships: bool = False
    source: str = "static"


class UniversitySearchResponse(BaseModel):
    results: list[UniversityResult]
    total: int
    query: str


async def _parse_text_results(text: str) -> list[dict]:
    """Parse text output from explore_universities into structured data."""
    results = []
    current = {}

    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Parse numbered university lines like "12. **Some University**"
        import re

        if re.match(r"^\d+\.\s", line):
            if current:
                results.append(current)
            # Extract text between ** markers
            bold_match = re.search(r"\*\*(.+?)\*\*", line)
            if bold_match:
                current = {"name": bold_match.group(1).strip()}
            else:
                # Fallback: use everything after number
                name_match = line.split("**")
                if len(name_match) >= 2:
                    current = {"name": name_match[1].strip()}
            # Extract ranking
            rank_match = re.search(r"#(\d+)", line)
            if rank_match:
                current["ranking"] = int(rank_match.group(1))
            current["source"] = "external"

        # Parse country
        elif "Quoc gia:" in line or "Quốc gia:" in line:
            country = line.split(":", 1)[1].strip()
            if "(" in country:
                country = country.split("(")[0].strip()
            current["country"] = country

        # Parse fields
        elif "Nganh manh:" in line or "Ngành mạnh:" in line:
            fields_str = line.split(":", 1)[1].strip()
            current["fields"] = [f.strip() for f in fields_str.split(",")]

        # Parse GPA
        elif "GPA toi thieu:" in line:
            import re

            gpa_match = re.search(r"GPA toi thieu: ([\d.]+)", line)
            if gpa_match:
                current["gpa_min"] = float(gpa_match.group(1))

        # Parse tuition
        elif "Hoc phi:" in line:
            import re

            tuition_match = re.search(r"\$([\d,]+)", line)
            if tuition_match:
                current["tuition_usd"] = int(tuition_match.group(1).replace(",", ""))

        # Parse acceptance rate
        elif "Ty le chap nhan:" in line:
            import re

            rate_match = re.search(r"([\d.]+)%", line)
            if rate_match:
                current["acceptance_rate"] = float(rate_match.group(1))

        # Parse scholarships
        elif "Hoc bong:" in line:
            current["scholarships"] = "True" in line or "Co" in line

        # Parse website
        elif "Website:" in line:
            website = line.split(":", 1)[1].strip()
            if website and website != "N/A":
                current["website"] = website

        # Parse source labels
        # Only set source from PRIMARY sources (don't overwrite with tavily)
        elif "[Nguon:" in line:
            source_match = re.search(r"\[Nguon:\s*(.*?)\]", line)
            if source_match:
                source_text = source_match.group(1).strip().lower()
                # Only set from primary data sources - tavily is enrichment, not primary
                if "static" in source_text:
                    current["source"] = "static"
                elif "openalex" in source_text:
                    current["source"] = "openalex"
                elif "ror" in source_text:
                    current["source"] = "ror"
                elif "hipo" in source_text:
                    current["source"] = "hipo"
                elif "scorecard" in source_text:
                    current["source"] = "scorecard"
                elif "tavily" in source_text:
                    # tavily is enrichment for static/openalex, but primary for tavily-only rows
                    if current.get("source") in (None, "", "external"):
                        current["source"] = "tavily"
                else:
                    if "source" not in current:
                        current["source"] = "external"

    if current:
        results.append(current)

    return results


@router.post("/search", response_model=UniversitySearchResponse)
async def search_universities(
    query: str = Query(..., description="Từ khóa tìm kiếm"),
    country: Optional[str] = Query(
        None, description="Quốc gia (USA, UK, Singapore, Japan, etc.)"
    ),
    field: Optional[str] = Query(
        None, description="Ngành học (Computer Science, Engineering, etc.)"
    ),
    gpa: Optional[float] = Query(None, description="GPA của sinh viên"),
    max_results: int = Query(10, description="Số lượng kết quả tối đa"),
):
    """Tìm kiếm trường đại học phù hợp."""

    effective_max_results = max(10, max_results)

    try:
        # Call the university explorer tool
        result_text = await explore_universities(
            query=query,
            country=country,
            field=field,
            gpa=gpa,
            max_results=effective_max_results,
        )

        # Parse results
        parsed_results = await _parse_text_results(result_text)

        # Convert to response format
        universities = []
        for r in parsed_results[:effective_max_results]:
            universities.append(
                UniversityResult(
                    name=r.get("name", "Unknown"),
                    country=r.get("country", "N/A"),
                    ranking=r.get("ranking"),
                    fields=r.get("fields", []),
                    website=r.get("website"),
                    gpa_min=r.get("gpa_min"),
                    sat_min=r.get("sat_min"),
                    ielts_min=r.get("ielts_min"),
                    tuition_usd=r.get("tuition_usd"),
                    acceptance_rate=r.get("acceptance_rate"),
                    scholarships=r.get("scholarships", False),
                    source=r.get("source", "static"),
                )
            )

        return UniversitySearchResponse(
            results=universities,
            total=len(universities),
            query=query,
        )

    except Exception as e:
        logger.error(f"University search error: {e}")
        return UniversitySearchResponse(
            results=[],
            total=0,
            query=query,
        )
