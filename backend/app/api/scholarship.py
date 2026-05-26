"""Scholarship recommendation API for Tools tab (AI-only)."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scholarship", tags=["scholarship"])


class ScholarshipRecommendation(BaseModel):
    scholarship_name: str
    fit_score: int
    fit_level: str
    country: str | None = None
    support_value: str | None = None
    support_type: str | None = None  # toan_phan | ban_phan | mot_phan
    main_requirements: list[str] = Field(default_factory=list)
    deadline: str | None = None
    why_fit: list[str] = Field(default_factory=list)
    profile_improvements: list[str] = Field(default_factory=list)
    target_levels: list[str] = Field(default_factory=list)
    link: str | None = None
    source: str = "ai_gemini"


class ScholarshipSearchResponse(BaseModel):
    query: str
    total: int
    recommendations: list[ScholarshipRecommendation] = Field(default_factory=list)


def _sse_event(event: str, data: dict[str, object]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _strip_fenced_json(text: str) -> str:
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _to_str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        text = str(item).strip()
        if text:
            out.append(text)
    return out


def _normalize_fit_level(value: str) -> str:
    v = (value or "").strip().lower()
    if "cao" in v or "high" in v:
        return "cao"
    if "trung" in v or "medium" in v:
        return "trung bình"
    return "cần cân nhắc"


def _normalize_support_type(value: str) -> str:
    v = (value or "").strip().lower()
    if "toan" in v or "full" in v:
        return "toàn phần"
    if "ban" in v or "half" in v:
        return "bán phần"
    if "mot" in v or "partial" in v:
        return "một phần"
    return "chưa rõ"


def _sanitize_item(
    item: dict[str, object], query: str
) -> ScholarshipRecommendation | None:
    name = str(item.get("scholarship_name") or "").strip()
    if not name:
        return None

    try:
        raw_score = item.get("fit_score", 60)
        score = int(float(str(raw_score)))
    except Exception:
        score = 60
    score = max(35, min(95, score))

    fit_level = _normalize_fit_level(str(item.get("fit_level") or ""))
    support_type = _normalize_support_type(str(item.get("support_type") or ""))

    why_fit = _to_str_list(item.get("why_fit"))
    if not why_fit:
        why_fit = [f"Học bổng này có mức liên quan tốt với mục tiêu '{query}'."]

    rec = ScholarshipRecommendation(
        scholarship_name=name,
        fit_score=score,
        fit_level=fit_level,
        country=str(item.get("country") or "").strip() or None,
        support_value=str(item.get("support_value") or "").strip() or None,
        support_type=support_type,
        main_requirements=_to_str_list(item.get("main_requirements")),
        deadline=str(item.get("deadline") or "").strip() or None,
        why_fit=why_fit,
        profile_improvements=_to_str_list(item.get("profile_improvements")),
        target_levels=_to_str_list(item.get("target_levels")),
        link=str(item.get("link") or "").strip() or None,
        source="ai_gemini",
    )
    return rec


def _build_prompt(
    *,
    query: str,
    gpa: float | None,
    english_exam: str | None,
    english_score: float | None,
    academic_achievements: str | None,
    target_major: str | None,
    target_country: str | None,
    target_school: str | None,
    extracurriculars: str | None,
    stem_projects: str | None,
    awards: str | None,
    financial_need: str | None,
    support_preference: str | None,
    study_level: str | None,
    max_results: int,
) -> str:
    payload = {
        "query": query,
        "gpa": gpa,
        "english_exam": english_exam,
        "english_score": english_score,
        "academic_achievements": academic_achievements,
        "target_major": target_major,
        "target_country": target_country,
        "target_school": target_school,
        "extracurriculars": extracurriculars,
        "stem_projects": stem_projects,
        "awards": awards,
        "financial_need": financial_need,
        "support_preference": support_preference,
        "study_level": study_level,
        "max_results": max_results,
    }

    return f"""
Bạn là cố vấn học bổng STEM cho học sinh Việt Nam.

Nhiệm vụ:
1) Đề xuất danh sách học bổng phù hợp với hồ sơ.
2) Trả về JSON hợp lệ DUY NHẤT, không kèm text ngoài JSON.
3) Mỗi học bổng cần có:
   - scholarship_name
   - fit_score (0-100)
   - fit_level ("cao" | "trung bình" | "cần cân nhắc")
   - country
   - support_value
   - support_type ("toàn phần" | "bán phần" | "một phần")
   - main_requirements (mảng)
   - deadline
   - why_fit (mảng 2-4 ý)
   - profile_improvements (mảng)
   - target_levels (mảng)
   - link

Ràng buộc:
- Ưu tiên học bổng STEM, thông tin thực tế, ngắn gọn.
- Nếu không chắc deadline, ghi "Cần kiểm tra trang chính thức".
- Viết tiếng Việt có dấu.
- Trả tối đa {max_results} kết quả.

Hồ sơ đầu vào (JSON):
{json.dumps(payload, ensure_ascii=False)}

Schema JSON phải trả:
{{
  "recommendations": [
    {{
      "scholarship_name": "...",
      "fit_score": 85,
      "fit_level": "cao",
      "country": "...",
      "support_value": "Toàn phần",
      "support_type": "toàn phần",
      "main_requirements": ["..."],
      "deadline": "...",
      "why_fit": ["..."],
      "profile_improvements": ["..."],
      "target_levels": ["Cử nhân"],
      "link": "https://..."
    }}
  ]
}}
""".strip()


async def _generate_recommendations(
    prompt: str, query: str, max_results: int
) -> list[ScholarshipRecommendation]:
    client = genai.Client(api_key=settings.GEMINI_API_KEY.get_secret_value())

    def _call_model() -> str:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_level="high"),
            ),
        )
        return getattr(response, "text", "") or ""

    raw_text = await asyncio.to_thread(_call_model)
    cleaned = _strip_fenced_json(raw_text)
    if not cleaned:
        return []

    data = json.loads(cleaned)
    rows = data.get("recommendations") if isinstance(data, dict) else []
    if not isinstance(rows, list):
        return []

    out: list[ScholarshipRecommendation] = []
    for row in rows[:max_results]:
        if not isinstance(row, dict):
            continue
        rec = _sanitize_item(row, query)
        if rec:
            out.append(rec)
    return out


def _parse_recommendations_from_text(
    text: str, query: str, max_results: int
) -> list[ScholarshipRecommendation]:
    cleaned = _strip_fenced_json(text)
    if not cleaned:
        return []
    data = json.loads(cleaned)
    rows = data.get("recommendations") if isinstance(data, dict) else []
    if not isinstance(rows, list):
        return []

    out: list[ScholarshipRecommendation] = []
    for row in rows[:max_results]:
        if not isinstance(row, dict):
            continue
        rec = _sanitize_item(row, query)
        if rec:
            out.append(rec)
    return out


@router.post("/search", response_model=ScholarshipSearchResponse)
async def search_scholarships(
    query: str = Query(..., description="Mô tả nhu cầu tìm học bổng"),
    gpa: Optional[float] = Query(None, description="GPA hiện tại"),
    english_exam: Optional[str] = Query(
        None, description="Loại chứng chỉ tiếng Anh (IELTS/TOEFL/...)"
    ),
    english_score: Optional[float] = Query(
        None, description="Điểm chứng chỉ ngoại ngữ"
    ),
    academic_achievements: Optional[str] = Query(
        None, description="Thành tích học thuật"
    ),
    target_major: Optional[str] = Query(None, description="Ngành học dự định"),
    target_country: Optional[str] = Query(None, description="Quốc gia mục tiêu"),
    target_school: Optional[str] = Query(None, description="Trường mục tiêu"),
    extracurriculars: Optional[str] = Query(None, description="Hoạt động ngoại khóa"),
    stem_projects: Optional[str] = Query(None, description="Dự án STEM"),
    awards: Optional[str] = Query(None, description="Giải thưởng"),
    financial_need: Optional[str] = Query(None, description="Hoàn cảnh tài chính"),
    support_preference: Optional[str] = Query(None, description="Mức hỗ trợ mong muốn"),
    study_level: Optional[str] = Query(None, description="Bậc học dự kiến"),
    max_results: int = Query(6, description="Số lượng học bổng tối đa"),
):
    if not settings.GEMINI_API_KEY.get_secret_value():
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY chưa được cấu hình")

    effective_max = max(3, min(max_results, 10))
    prompt = _build_prompt(
        query=query,
        gpa=gpa,
        english_exam=english_exam,
        english_score=english_score,
        academic_achievements=academic_achievements,
        target_major=target_major,
        target_country=target_country,
        target_school=target_school,
        extracurriculars=extracurriculars,
        stem_projects=stem_projects,
        awards=awards,
        financial_need=financial_need,
        support_preference=support_preference,
        study_level=study_level,
        max_results=effective_max,
    )

    try:
        recommendations = await _generate_recommendations(
            prompt,
            query=query,
            max_results=effective_max,
        )
    except Exception as e:
        logger.error("AI scholarship search failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Dịch vụ AI đang bận hoặc hết quota. Vui lòng thử lại sau.",
        )

    if not recommendations:
        raise HTTPException(
            status_code=502,
            detail="AI không trả về dữ liệu học bổng hợp lệ. Vui lòng thử lại với mô tả chi tiết hơn.",
        )

    recommendations.sort(key=lambda x: x.fit_score, reverse=True)
    return ScholarshipSearchResponse(
        query=query,
        total=len(recommendations),
        recommendations=recommendations,
    )


@router.post("/search/stream")
async def search_scholarships_stream(
    query: str = Query(..., description="Mô tả nhu cầu tìm học bổng"),
    gpa: Optional[float] = Query(None, description="GPA hiện tại"),
    english_exam: Optional[str] = Query(
        None, description="Loại chứng chỉ tiếng Anh (IELTS/TOEFL/...)"
    ),
    english_score: Optional[float] = Query(
        None, description="Điểm chứng chỉ ngoại ngữ"
    ),
    academic_achievements: Optional[str] = Query(
        None, description="Thành tích học thuật"
    ),
    target_major: Optional[str] = Query(None, description="Ngành học dự định"),
    target_country: Optional[str] = Query(None, description="Quốc gia mục tiêu"),
    target_school: Optional[str] = Query(None, description="Trường mục tiêu"),
    extracurriculars: Optional[str] = Query(None, description="Hoạt động ngoại khóa"),
    stem_projects: Optional[str] = Query(None, description="Dự án STEM"),
    awards: Optional[str] = Query(None, description="Giải thưởng"),
    financial_need: Optional[str] = Query(None, description="Hoàn cảnh tài chính"),
    support_preference: Optional[str] = Query(None, description="Mức hỗ trợ mong muốn"),
    study_level: Optional[str] = Query(None, description="Bậc học dự kiến"),
    max_results: int = Query(6, description="Số lượng học bổng tối đa"),
):
    if not settings.GEMINI_API_KEY.get_secret_value():
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY chưa được cấu hình")

    effective_max = max(3, min(max_results, 10))
    prompt = _build_prompt(
        query=query,
        gpa=gpa,
        english_exam=english_exam,
        english_score=english_score,
        academic_achievements=academic_achievements,
        target_major=target_major,
        target_country=target_country,
        target_school=target_school,
        extracurriculars=extracurriculars,
        stem_projects=stem_projects,
        awards=awards,
        financial_need=financial_need,
        support_preference=support_preference,
        study_level=study_level,
        max_results=effective_max,
    )

    async def event_stream():
        yield _sse_event("progress", {"message": "Đang phân tích hồ sơ học bổng..."})
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY.get_secret_value())
            stream = client.models.generate_content_stream(
                model="gemini-3.1-flash-lite-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_level="high"),
                ),
            )

            chunks: list[str] = []
            for chunk in stream:
                text = getattr(chunk, "text", "") or ""
                if text:
                    chunks.append(text)
                    yield _sse_event("text_delta", {"delta": text})

            recommendations = _parse_recommendations_from_text(
                "".join(chunks),
                query=query,
                max_results=effective_max,
            )

            if not recommendations:
                yield _sse_event(
                    "error",
                    {
                        "message": "AI không trả về dữ liệu học bổng hợp lệ. Vui lòng thử lại với mô tả chi tiết hơn.",
                    },
                )
            else:
                recommendations.sort(key=lambda x: x.fit_score, reverse=True)
                payload = ScholarshipSearchResponse(
                    query=query,
                    total=len(recommendations),
                    recommendations=recommendations,
                ).model_dump()
                yield _sse_event("final_result", payload)
        except Exception as e:
            logger.error("AI scholarship stream failed: %s", e)
            yield _sse_event(
                "error",
                {
                    "message": "Dịch vụ AI đang bận hoặc hết quota. Vui lòng thử lại sau."
                },
            )
        finally:
            yield _sse_event("done", {"ok": True})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )
