"""Tools metadata endpoint.

Returns the list of available tools (matching the frontend's toolItems)
so the frontend can dynamically load them.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/tools", tags=["tools"])

_TOOLS = [
    {"id": "major", "icon": "category", "title": "Chọn Chuyên Ngành",
     "desc": "AI gợi ý ngành học phù hợp dựa trên sở thích & năng lực",
     "tags": ["AI", "Trắc nghiệm"]},
    {"id": "university", "icon": "school", "title": "Tìm Trường Đại Học",
     "desc": "Tìm kiếm & so sánh trường đại học trên toàn thế giới",
     "tags": ["AI", "Bộ lọc"]},
    {"id": "scholarship", "icon": "workspace_premium",
     "title": "Tìm Kiếm Học Bổng",
     "desc": "Khám phá cơ hội học bổng phù hợp với hồ sơ của bạn",
     "tags": ["AI", "Trắc nghiệm"]},
    {"id": "extracurricular", "icon": "groups",
     "title": "Kế Hoạch Ngoại Khoá",
     "desc": "Lên kế hoạch hoạt động ngoại khoá & đánh giá AI",
     "tags": ["Lập kế hoạch", "AI"]},
    {"id": "testprep", "icon": "quiz", "title": "Chuẩn Bị Bài Kiểm Tra",
     "desc": "Luyện thi IELTS, TOEFL, SAT, AP với hỗ trợ AI",
     "tags": ["IELTS", "SAT", "AP"]},
    {"id": "essay", "icon": "edit_note",
     "title": "Viết Bài Luận Cá Nhân",
     "desc": "AI Coach hỗ trợ viết Personal Statement & Essay",
     "tags": ["AI Writing", "CommonApp"]},
    {"id": "visa", "icon": "flight_takeoff",
     "title": "Nộp Đơn Xin Visa",
     "desc": "Hướng dẫn từng bước quy trình xin visa du học",
     "tags": ["Checklist", "Hướng dẫn"]},
]


@router.get("")
async def list_tools():
    """Return all available tool definitions."""
    return _TOOLS
