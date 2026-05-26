"""University explorer with structured fallback data and optional Tavily enrichment."""

from __future__ import annotations

import logging
import re
from typing import Optional
from urllib.parse import urlparse

from app.agents.tools.http_utils import fetch_json
from app.config import settings

logger = logging.getLogger(__name__)

UNIVERSITY_DATABASE = [
    {
        "name": "Massachusetts Institute of Technology (MIT)",
        "country": "USA",
        "ranking": 1,
        "fields": ["Computer Science", "Engineering", "Physics", "Mathematics"],
        "website": "https://www.mit.edu",
        "gpa_min": 3.9,
        "sat_min": 1550,
        "ielts_min": 7.0,
        "tuition_usd": 57986,
        "acceptance_rate": 3.96,
        "scholarships": True,
    },
    {
        "name": "Stanford University",
        "country": "USA",
        "ranking": 2,
        "fields": ["Computer Science", "AI/ML", "Bioengineering", "Data Science"],
        "website": "https://www.stanford.edu",
        "gpa_min": 3.9,
        "sat_min": 1520,
        "ielts_min": 7.0,
        "tuition_usd": 56169,
        "acceptance_rate": 3.68,
        "scholarships": True,
    },
    {
        "name": "ETH Zurich",
        "country": "Switzerland",
        "ranking": 7,
        "fields": ["Engineering", "Computer Science", "Physics", "Chemistry"],
        "website": "https://ethz.ch",
        "gpa_min": 3.7,
        "sat_min": None,
        "ielts_min": 7.0,
        "tuition_usd": 1460,
        "acceptance_rate": 27.0,
        "scholarships": True,
    },
    {
        "name": "University of Tokyo",
        "country": "Japan",
        "ranking": 28,
        "fields": ["Engineering", "Science", "Information Technology"],
        "website": "https://www.u-tokyo.ac.jp",
        "gpa_min": 3.5,
        "sat_min": None,
        "ielts_min": 6.5,
        "tuition_usd": 4800,
        "acceptance_rate": 33.0,
        "scholarships": True,
    },
    {
        "name": "National University of Singapore (NUS)",
        "country": "Singapore",
        "ranking": 8,
        "fields": [
            "Computer Science",
            "Engineering",
            "Business Analytics",
            "Data Science",
        ],
        "website": "https://www.nus.edu.sg",
        "gpa_min": 3.6,
        "sat_min": 1450,
        "ielts_min": 6.5,
        "tuition_usd": 17550,
        "acceptance_rate": 12.0,
        "scholarships": True,
    },
    {
        "name": "KAIST (Korea Advanced Institute of Science and Technology)",
        "country": "South Korea",
        "ranking": 56,
        "fields": ["Engineering", "Computer Science", "Robotics", "AI"],
        "website": "https://www.kaist.ac.kr",
        "gpa_min": 3.4,
        "sat_min": None,
        "ielts_min": 6.5,
        "tuition_usd": 5000,
        "acceptance_rate": 20.0,
        "scholarships": True,
    },
    {
        "name": "University of Melbourne",
        "country": "Australia",
        "ranking": 14,
        "fields": ["Engineering", "IT", "Science", "Biomedicine"],
        "website": "https://www.unimelb.edu.au",
        "gpa_min": 3.3,
        "sat_min": None,
        "ielts_min": 6.5,
        "tuition_usd": 35000,
        "acceptance_rate": 38.0,
        "scholarships": True,
    },
    {
        "name": "University of British Columbia (UBC)",
        "country": "Canada",
        "ranking": 34,
        "fields": ["Computer Science", "Engineering", "Science", "Forestry"],
        "website": "https://www.ubc.ca",
        "gpa_min": 3.4,
        "sat_min": None,
        "ielts_min": 6.5,
        "tuition_usd": 38000,
        "acceptance_rate": 46.0,
        "scholarships": True,
    },
    {
        "name": "University College London (UCL)",
        "country": "UK",
        "ranking": 9,
        "fields": ["Psychology", "Neuroscience", "Cognitive Science"],
        "website": "https://www.ucl.ac.uk",
        "gpa_min": 3.7,
        "sat_min": None,
        "ielts_min": 7.0,
        "tuition_usd": 36000,
        "acceptance_rate": 32.0,
        "scholarships": True,
    },
    {
        "name": "King's College London",
        "country": "UK",
        "ranking": 40,
        "fields": ["Psychology", "Mental Health Studies", "Neuroscience"],
        "website": "https://www.kcl.ac.uk",
        "gpa_min": 3.6,
        "sat_min": None,
        "ielts_min": 7.0,
        "tuition_usd": 33000,
        "acceptance_rate": 35.0,
        "scholarships": True,
    },
    {
        "name": "University of Manchester",
        "country": "UK",
        "ranking": 34,
        "fields": ["Psychology", "Cognitive Neuroscience", "Social Sciences"],
        "website": "https://www.manchester.ac.uk",
        "gpa_min": 3.5,
        "sat_min": None,
        "ielts_min": 6.5,
        "tuition_usd": 30000,
        "acceptance_rate": 51.0,
        "scholarships": True,
    },
]

_OPENALEX_BASE = "https://api.openalex.org"
_ROR_BASE = "https://api.ror.org/v2"
_HIPO_BASE = "https://universities.hipolabs.com"
_SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1"
_WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
_TAVILY_SEARCH = "https://api.tavily.com/search"
_DEGREE_INSTITUTION_KEYWORDS = (
    "university",
    "college",
    "institute",
    "polytechnic",
    "school of",
)
_NON_DEGREE_KEYWORDS = (
    "society",
    "association",
    "council",
    "forum",
    "network",
    "academy of",
    "foundation",
    "guild",
)


def _guess_country(query: str) -> str | None:
    q = query.lower()
    mapping = {
        "USA": ["usa", "us", "united states", "my", "mỹ"],
        "Canada": ["canada"],
        "Singapore": ["singapore"],
        "Japan": ["japan", "nhat", "nhật"],
        "South Korea": ["korea", "han", "hàn", "south korea"],
        "Australia": ["australia", "uc", "úc"],
        "Switzerland": ["switzerland", "thuy si", "thụy sĩ"],
        "UK": ["uk", "united kingdom", "anh", "england", "britain"],
    }
    for canonical, keys in mapping.items():
        if any(key in q for key in keys):
            return canonical
    return None


def _guess_country_code(country: str | None) -> str | None:
    if not country:
        return None
    codes = {
        "USA": "US",
        "United States": "US",
        "US": "US",
        "Canada": "CA",
        "Singapore": "SG",
        "Japan": "JP",
        "South Korea": "KR",
        "Australia": "AU",
        "Switzerland": "CH",
        "UK": "GB",
        "United Kingdom": "GB",
    }
    return codes.get(country.strip())


def _guess_gpa(query: str) -> float | None:
    match = re.search(r"\bgpa\s*[:=]?\s*(\d+(?:\.\d+)?)\b", query.lower())
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def _normalize_domain(url: str | None) -> str | None:
    if not url:
        return None
    host = (urlparse(url).hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    return host or None


def _school_search_query(query: str, field: str | None) -> str:
    cleaned = query.strip()
    if field:
        return f"{field} university"
    return cleaned


def _is_degree_granting_institution(row: dict) -> bool:
    name = str(row.get("name") or "").strip().lower()
    if not name:
        return False

    if any(token in name for token in _NON_DEGREE_KEYWORDS):
        return False

    if any(token in name for token in _DEGREE_INSTITUTION_KEYWORDS):
        return True

    inst_type = str(row.get("type") or "").strip().lower()
    if inst_type in {"education", "university"}:
        return True

    homepage = row.get("homepage_url") or row.get("website")
    domain = _normalize_domain(str(homepage or ""))
    if not domain:
        return False

    return domain.endswith(".edu") or ".edu." in domain or ".ac." in domain


def _filter_degree_granting_institutions(rows: list[dict]) -> list[dict]:
    filtered: list[dict] = []
    seen: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            continue
        name = str(row.get("name") or "").strip()
        if not name:
            continue
        normalized_name = name.lower()
        if normalized_name in seen:
            continue
        if not _is_degree_granting_institution(row):
            continue
        seen.add(normalized_name)
        filtered.append(row)
    return filtered


def _tavily_query_for_school(
    school_name: str,
    *,
    field: str | None,
    country: str | None,
) -> str:
    parts = [school_name]
    if field:
        parts.append(field)
    if country:
        parts.append(country)
    parts.extend(["undergraduate", "admissions", "official"])
    return " ".join(parts)


def _filter_tavily_school_results(
    results: list[dict],
    *,
    homepage_url: str | None = None,
    max_results: int = 2,
) -> list[dict]:
    homepage_domain = _normalize_domain(homepage_url)
    blocked_domains = {
        "wikipedia.org",
        "topuniversities.com",
        "shiksha.com",
        "studylink.com",
        "hotcoursesabroad.com",
        "mastersportal.com",
        "bachelorsportal.com",
        "thecompleteuniversityguide.co.uk",
        "timeshighereducation.com",
        "usnews.com",
    }

    filtered: list[dict] = []
    seen: set[str] = set()
    for row in results:
        if not isinstance(row, dict):
            continue
        title = str(row.get("title") or "").strip()
        url = str(row.get("url") or "").strip()
        if not title or not url or url in seen:
            continue
        domain = _normalize_domain(url)
        if not domain:
            continue
        if any(domain == bad or domain.endswith(f".{bad}") for bad in blocked_domains):
            continue
        if homepage_domain and not (
            domain == homepage_domain or domain.endswith(f".{homepage_domain}")
        ):
            continue
        seen.add(url)
        filtered.append({"title": title, "url": url})
        if len(filtered) >= max_results:
            break
    return filtered


def _name_key(name: str) -> str:
    return " ".join((name or "").strip().lower().split())


def _looks_like_university_name(text: str) -> bool:
    lower = (text or "").strip().lower()
    if not lower:
        return False
    if any(token in lower for token in _NON_DEGREE_KEYWORDS):
        return False
    return any(token in lower for token in _DEGREE_INSTITUTION_KEYWORDS)


def _extract_tavily_school_name(title: str) -> str | None:
    raw = (title or "").strip()
    if not raw:
        return None
    candidates = [
        raw,
        raw.split("|")[0].strip(),
        raw.split(" - ")[0].strip(),
        raw.split(" – ")[0].strip(),
        raw.split(":")[0].strip(),
    ]
    for cand in candidates:
        if _looks_like_university_name(cand):
            return cand
    return None


async def _tavily_university_candidates(
    query: str,
    *,
    field: str | None,
    country: str | None,
    max_results: int,
    exclude_names: set[str],
) -> list[dict]:
    api_key = (settings.TAVILY_API_KEY.get_secret_value() or "").strip()
    if not api_key or max_results <= 0:
        return []

    out: list[dict] = []
    seen = set(exclude_names)
    queries = [
        " ".join(
            part
            for part in [
                query,
                field or "",
                country or "",
                "best universities official admissions",
            ]
            if part
        ),
        " ".join(part for part in [query, country or "", "universities"] if part),
    ]

    for tavily_query in queries:
        if len(out) >= max_results:
            break
        body: dict[str, object] = {
            "api_key": api_key,
            "query": tavily_query,
            "search_depth": "basic",
            "max_results": max(10, max_results * 4),
            "include_answer": False,
            "include_raw_content": False,
        }
        data = await fetch_json(
            _TAVILY_SEARCH,
            method="POST",
            json_body=body,
            timeout_seconds=12.0,
            cache_ttl_seconds=3600,
        )
        rows = (data or {}).get("results") or []
        for row in rows:
            if len(out) >= max_results:
                break
            if not isinstance(row, dict):
                continue
            title = str(row.get("title") or "").strip()
            url = str(row.get("url") or "").strip()
            name = _extract_tavily_school_name(title)
            if not name and _looks_like_university_name(title):
                name = title
            if not name or not url:
                continue
            key = _name_key(name)
            if key in seen:
                continue
            seen.add(key)
            out.append(
                {
                    "name": name,
                    "country": country or "N/A",
                    "country_code": _guess_country_code(country),
                    "website": url,
                    "source": "tavily",
                }
            )
    return out


async def _tavily_school_links(
    school_name: str,
    *,
    field: str | None,
    country: str | None,
    homepage_url: str | None = None,
    max_results: int = 2,
) -> list[dict]:
    api_key = (settings.TAVILY_API_KEY.get_secret_value() or "").strip()
    if not api_key:
        return []

    body: dict[str, object] = {
        "api_key": api_key,
        "query": _tavily_query_for_school(school_name, field=field, country=country),
        "search_depth": "basic",
        "max_results": max(5, max_results),
        "include_answer": False,
        "include_raw_content": False,
    }
    homepage_domain = _normalize_domain(homepage_url)
    if homepage_domain:
        body["include_domains"] = [homepage_domain]

    data = await fetch_json(
        _TAVILY_SEARCH,
        method="POST",
        json_body=body,
        timeout_seconds=12.0,
        cache_ttl_seconds=86400,
    )
    results = (data or {}).get("results") or []
    return _filter_tavily_school_results(
        results,
        homepage_url=homepage_url,
        max_results=max_results,
    )


async def _openalex_institutions(
    query: str,
    country_code: str | None,
    max_results: int,
) -> list[dict]:
    params: dict[str, str] = {"search": query, "per-page": str(max_results)}
    if country_code:
        params["filter"] = f"country_code:{country_code}"
    if settings.OPENALEX_MAILTO:
        params["mailto"] = settings.OPENALEX_MAILTO

    data = await fetch_json(
        f"{_OPENALEX_BASE}/institutions",
        params=params,
        timeout_seconds=8.0,
        cache_ttl_seconds=3600,
    )
    results = (data or {}).get("results") or []
    out: list[dict] = []
    for row in results:
        out.append(
            {
                "name": row.get("display_name"),
                "country": (row.get("country") or {}).get("display_name")
                or row.get("country_code"),
                "country_code": row.get("country_code"),
                "works_count": row.get("works_count"),
                "cited_by_count": row.get("cited_by_count"),
                "ror": row.get("ror"),
                "id": row.get("id"),
                "homepage_url": row.get("homepage_url"),
                "type": row.get("type"),
                "source": "openalex",
            }
        )
    return [item for item in out if item.get("name")]


async def _ror_lookup(query: str, max_results: int) -> list[dict]:
    data = await fetch_json(
        f"{_ROR_BASE}/organizations",
        params={"query": query, "page": "1"},
        timeout_seconds=8.0,
        cache_ttl_seconds=3600,
        headers={"User-Agent": settings.WIKIDATA_USER_AGENT},
    )
    items = (data or {}).get("items") or []
    out: list[dict] = []
    for item in items[:max_results]:
        org = item.get("organization") or {}
        country_obj = org.get("country") if isinstance(org.get("country"), dict) else {}
        out.append(
            {
                "name": org.get("name"),
                "country": country_obj.get("country_name"),
                "country_code": country_obj.get("country_code"),
                "ror": org.get("id"),
                "website": (org.get("links") or [None])[0],
                "source": "ror",
            }
        )
    return [item for item in out if item.get("name")]


async def _hipo_lookup(
    query: str, country: str | None = None, max_results: int = 10
) -> list[dict]:
    """Search universities using Hipo Labs API (free, no API key required)."""
    params: dict[str, str] = {"search": query}
    if country:
        params["country"] = country
    # Hipo returns 100 results max per page
    params["limit"] = str(min(max_results, 50))

    data = await fetch_json(
        f"{_HIPO_BASE}/search",
        params=params,
        timeout_seconds=10.0,
        cache_ttl_seconds=3600,  # Cache for 1 hour
    )

    if isinstance(data, list):
        results = data
    else:
        results = (data or {}).get("results") or []
    out: list[dict] = []

    for row in results[:max_results]:
        # Hipo structure: { name, domains, web_pages, country, alpha_two_code }
        name = row.get("name", "")
        if not name:
            continue

        # Get first domain as website
        domains = row.get("domains") or []
        website = row.get("web_pages") or []

        # Skip non-educational domains
        domain = domains[0] if domains else None
        if domain and any(blocked in domain for blocked in _NON_DEGREE_KEYWORDS):
            continue

        out.append(
            {
                "name": name,
                "country": row.get("country", ""),
                "country_code": row.get("alpha_two_code", ""),
                "website": website[0] if website else None,
                "domains": domains,
                "source": "hipo",
            }
        )

    return out


async def _scorecard_enrich_us(school_name: str) -> dict | None:
    api_key = (settings.COLLEGESCORECARD_API_KEY.get_secret_value() or "").strip()
    if not api_key:
        return None

    fields = [
        "school.name",
        "school.city",
        "school.state",
        "school.school_url",
        "latest.admissions.admission_rate.overall",
        "latest.cost.tuition.in_state",
        "latest.cost.tuition.out_of_state",
        "latest.cost.attendance.academic_year",
    ]

    data = await fetch_json(
        f"{_SCORECARD_BASE}/schools",
        params={
            "api_key": api_key,
            "school.name": school_name,
            "per_page": "1",
            "fields": ",".join(fields),
        },
        timeout_seconds=8.0,
        cache_ttl_seconds=86400,
    )
    results = (data or {}).get("results") or []
    return results[0] if results else None


async def _wikidata_country_for_university(name: str) -> str | None:
    query = f"""
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?countryLabel WHERE {{
  ?u wdt:P31/wdt:P279* wd:Q3918 .
  ?u rdfs:label "{name}"@en .
  OPTIONAL {{ ?u wdt:P17 ?country . }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 1
""".strip()
    data = await fetch_json(
        _WIKIDATA_SPARQL,
        params={"query": query, "format": "json"},
        headers={
            "User-Agent": settings.WIKIDATA_USER_AGENT,
            "Accept": "application/sparql-results+json",
        },
        timeout_seconds=8.0,
        cache_ttl_seconds=86400,
    )
    bindings = ((data or {}).get("results") or {}).get("bindings") or []
    if not bindings:
        return None
    return bindings[0].get("countryLabel", {}).get("value") or None


def _format_static_school(university: dict) -> str:
    sat_info = (
        f"SAT >= {university['sat_min']}"
        if university.get("sat_min")
        else "Khong yeu cau SAT"
    )
    return (
        f"**{university['name']}** (#{university['ranking']} the gioi)\n"
        f"   - Quoc gia: {university['country']}\n"
        f"   - Nganh manh: {', '.join(university['fields'][:3])}\n"
        f"   - GPA toi thieu: {university['gpa_min']} | {sat_info} | IELTS >= {university['ielts_min']}\n"
        f"   - Hoc phi: ${university['tuition_usd']:,}/nam\n"
        f"   - Ty le chap nhan: {university['acceptance_rate']}%\n"
    )


async def explore_universities(
    query: str,
    country: Optional[str] = None,
    field: Optional[str] = None,
    gpa: Optional[float] = None,
    max_results: int = 5,
) -> str:
    """Find universities with static-first strategy and minimum 10 results."""

    query = (query or "").strip()
    if not query:
        return "Khong tim thay truong phu hop voi tieu chi."

    target_results = max(10, max_results)
    query_country = country or _guess_country(query)
    query_country_code = _guess_country_code(query_country)
    query_gpa = gpa or _guess_gpa(query)
    school_query = _school_search_query(query, field)

    # 1) Static DB first (always prioritized)
    query_lower = query.lower()
    static_results = [
        row
        for row in UNIVERSITY_DATABASE
        if query_lower in row["name"].lower()
        or any(query_lower in field_name.lower() for field_name in row["fields"])
    ]
    if query_country:
        country_lower = query_country.lower()
        static_results = [
            row for row in static_results if country_lower in row["country"].lower()
        ]
    if field:
        field_lower = field.lower()
        static_results = [
            row
            for row in static_results
            if any(field_lower in item.lower() for item in row["fields"])
        ]
    if query_gpa:
        static_results = [
            row for row in static_results if row["gpa_min"] <= query_gpa + 0.2
        ]
    static_results.sort(key=lambda row: row["ranking"])

    selected: list[dict] = [
        {**row, "source": "static"} for row in static_results[:target_results]
    ]
    seen_names: set[str] = {_name_key(row.get("name", "")) for row in selected}

    # 2) Pull external rows (OpenAlex + ROR + Hipo)
    external_pool: list[dict] = []
    try:
        external_pool.extend(
            await _openalex_institutions(
                query=school_query,
                country_code=query_country_code,
                max_results=target_results * 2,
            )
        )
    except Exception as e:
        logger.warning("OpenAlex lookup failed: %s", e)

    try:
        external_pool.extend(
            await _ror_lookup(query=school_query, max_results=target_results * 2)
        )
    except Exception as e:
        logger.warning("ROR lookup failed: %s", e)

    try:
        external_pool.extend(
            await _hipo_lookup(
                query=school_query,
                country=query_country,
                max_results=target_results * 2,
            )
        )
    except Exception as e:
        logger.warning("Hipo lookup failed: %s", e)

    external_pool = _filter_degree_granting_institutions(external_pool)
    for row in external_pool:
        if len(selected) >= target_results:
            break
        name = str(row.get("name") or "").strip()
        if not name:
            continue
        key = _name_key(name)
        if key in seen_names:
            continue
        seen_names.add(key)
        selected.append(row)

    # 3) If still not enough, supplement from Tavily candidates
    if len(selected) < target_results:
        needed = target_results - len(selected)
        tavily_rows = await _tavily_university_candidates(
            school_query,
            field=field,
            country=query_country,
            max_results=needed,
            exclude_names=seen_names,
        )
        for row in tavily_rows:
            if len(selected) >= target_results:
                break
            name = str(row.get("name") or "").strip()
            if not name:
                continue
            key = _name_key(name)
            if key in seen_names:
                continue
            seen_names.add(key)
            selected.append(row)

    if not selected:
        return "Khong tim thay truong phu hop voi tieu chi."

    source_label_map = {
        "static": "Static Database",
        "openalex": "OpenAlex API",
        "ror": "ROR (Research Organizations)",
        "hipo": "Hipo Labs (Free University Database)",
        "tavily": "Tavily Search",
    }

    output_lines: list[str] = [f"Tim thay {len(selected)} truong phu hop:\n"]
    for index, university in enumerate(selected, 1):
        source = str(university.get("source") or "external").lower()
        source_label = source_label_map.get(source, "External API")
        name = str(university.get("name") or "Unknown")

        if source == "static":
            output_lines.append(f"{index}. " + _format_static_school(university))
            output_lines.append("   [Nguon: Static Database]")
        else:
            country_name = university.get("country") or ""
            country_code = university.get("country_code")
            homepage = university.get("homepage_url") or university.get("website") or ""
            if not country_name:
                country_name = await _wikidata_country_for_university(name) or ""

            output_lines.append(
                f"{index}. **{name}**\n"
                f"   - Quoc gia: {country_name or 'N/A'}{f' ({country_code})' if country_code else ''}\n"
                f"   - Website: {homepage or 'N/A'}\n"
                f"   [Nguon: {source_label}]"
            )
            if source == "openalex":
                output_lines.append(
                    f"   - Works/Citations (OpenAlex): {university.get('works_count', 'N/A')} / {university.get('cited_by_count', 'N/A')}"
                )
            if source == "ror":
                output_lines.append(f"   - ROR: {university.get('ror') or 'N/A'}")

        homepage_for_links = university.get("homepage_url") or university.get("website")
        if source != "tavily":
            official_links = await _tavily_school_links(
                name,
                field=field,
                country=query_country,
                homepage_url=homepage_for_links,
                max_results=2,
            )
            if official_links:
                output_lines.append("   [Nguon: Tavily Search]")
                output_lines.append("   - Official sources:")
                for link in official_links:
                    output_lines.append(f"     - {link['title']}: {link['url']}")

    if len(selected) < target_results:
        output_lines.append(
            f"\nChi tim duoc {len(selected)}/{target_results} truong voi nguon hien tai."
        )

    return "\n".join(output_lines)
