"""Static resource endpoints (scholarships, universities, guides).

These are read-only reference data. In production, they would come from
the database or a content API. For now we return curated JSON lists that
match the frontend's hardcoded data.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/resources", tags=["resources"])

_SCHOLARSHIPS = [
    {"name": "Fulbright Vietnam", "country": "USA", "value": "100% học phí", "deadline": "15/04/2026", "level": "Thạc sĩ"},
    {"name": "Chevening Scholarship", "country": "UK", "value": "100% học phí", "deadline": "01/11/2026", "level": "Thạc sĩ"},
    {"name": "ASEAN Scholarship", "country": "Singapore", "value": "Toàn phần", "deadline": "01/03/2026", "level": "Đại học"},
    {"name": "MEXT Scholarship", "country": "Nhật Bản", "value": "Toàn phần", "deadline": "15/04/2026", "level": "Đại học"},
    {"name": "Australia Awards", "country": "Úc", "value": "100% học phí", "deadline": "30/04/2026", "level": "Thạc sĩ"},
    {"name": "Erasmus Mundus", "country": "Châu Âu", "value": "Toàn phần", "deadline": "10/01/2026", "level": "Thạc sĩ"},
]

_UNIVERSITIES = [
    {"name": "MIT", "country": "US", "rank": "#1", "accept": "3.9%", "fields": ["CS", "Engineering", "Science"]},
    {"name": "Stanford University", "country": "US", "rank": "#2", "accept": "3.7%", "fields": ["CS", "Business", "Engineering"]},
    {"name": "NUS", "country": "SG", "rank": "#8", "accept": "10%", "fields": ["CS", "Engineering", "Business"]},
    {"name": "University of Cambridge", "country": "UK", "rank": "#5", "accept": "21%", "fields": ["Science", "Engineering", "Math"]},
    {"name": "ETH Zurich", "country": "CH", "rank": "#7", "accept": "27%", "fields": ["Engineering", "CS", "Science"]},
    {"name": "University of Tokyo", "country": "JP", "rank": "#12", "accept": "30%", "fields": ["Science", "Engineering", "Medicine"]},
]


@router.get("/scholarships")
async def get_scholarships():
    return _SCHOLARSHIPS


@router.get("/universities")
async def get_universities():
    return _UNIVERSITIES
