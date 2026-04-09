"""Career/Major recommendation API for Tools tab."""

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

router = APIRouter(prefix="/career", tags=["career"])


class MajorRecommendation(BaseModel):
    major_name: str
    fit_score: int
    fit_level: str
    why_fit: list[str] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)
    related_fields: list[str] = Field(default_factory=list)
    related_careers: list[str] = Field(default_factory=list)
    growth_outlook: str | None = None
    roadmap_hint: str | None = None
    source: str = "career_knowledge"


class CareerSearchResponse(BaseModel):
    query: str
    total: int
    recommendations: list[MajorRecommendation] = Field(default_factory=list)


def _sse_event(event: str, data: dict[str, object]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _strip_fenced_json(text: str) -> str:
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _normalize_fit_level(value: str) -> str:
    v = (value or "").strip().lower()
    if "cao" in v or "high" in v:
        return "cao"
    if "trung" in v or "medium" in v:
        return "trung binh"
    if v:
        return "can can nhac"
    return "trung binh"


def _sanitize_recommendation(
    item: dict[str, object], query: str
) -> MajorRecommendation | None:
    name = str(item.get("major_name") or "").strip()
    if not name:
        return None

    try:
        raw_score = item.get("fit_score", 60)
        score = int(float(str(raw_score)))
    except Exception:
        score = 60

    score = max(35, min(95, score))
    level = _normalize_fit_level(str(item.get("fit_level") or ""))

    why_fit = _to_str_list(item.get("why_fit"))
    required_skills = _to_str_list(item.get("required_skills"))
    skill_gaps = _to_str_list(item.get("skill_gaps"))
    related_fields = _to_str_list(item.get("related_fields"))
    related_careers = _to_str_list(item.get("related_careers"))

    if not why_fit:
        why_fit = [f"Ngành này có mức liên quan tốt với mục tiêu '{query}'."]

    roadmap_hint = str(item.get("roadmap_hint") or "").strip() or None
    growth_outlook = str(item.get("growth_outlook") or "").strip() or None

    return MajorRecommendation(
        major_name=name,
        fit_score=score,
        fit_level=level,
        why_fit=why_fit,
        required_skills=required_skills,
        skill_gaps=skill_gaps,
        related_fields=related_fields,
        related_careers=related_careers,
        growth_outlook=growth_outlook,
        roadmap_hint=roadmap_hint,
        source="ai_gemini",
    )


async def _generate_ai_recommendations(
    *,
    query: str,
    grade: str | None,
    age: int | None,
    interests_list: list[str],
    strengths_list: list[str],
    career_goal: str | None,
    study_preference: str | None,
    learning_style: str | None,
    budget_preference: str | None,
    max_results: int,
    grounding_text: str,
) -> list[MajorRecommendation]:
    if not settings.GEMINI_API_KEY:
        return []

    payload = {
        "query": query,
        "grade": grade,
        "age": age,
        "interests": interests_list,
        "strengths": strengths_list,
        "career_goal": career_goal,
        "study_preference": study_preference,
        "learning_style": learning_style,
        "budget_preference": budget_preference,
        "max_results": max_results,
    }

    prompt = f"""
Bạn là cố vấn hướng nghiệp STEM cho học sinh Việt Nam.

Nhiệm vụ:
1) Đọc hồ sơ học sinh và đề xuất chuyên ngành phù hợp.
2) Trả về JSON hợp lệ DUY NHẤT, không kèm giải thích ngoài JSON.
3) Mỗi chuyên ngành cần có:
   - major_name
   - fit_score (0-100)
   - fit_level ("cao" | "trung bình" | "cần cân nhắc")
   - why_fit (mảng 2-4 ý)
   - required_skills (mảng)
   - skill_gaps (mảng)
   - related_fields (mảng)
   - related_careers (mảng)
   - growth_outlook
   - roadmap_hint

Ràng buộc:
- Tập trung lĩnh vực STEM.
- fit_score phải phản ánh đúng sở thích, năng lực, định hướng nghề và điều kiện học tập.
- Viết tiếng Việt có dấu, súc tích, thực tế.
- Trả tối đa {max_results} ngành.

Hồ sơ đầu vào (JSON):
{json.dumps(payload, ensure_ascii=False)}

Ngữ cảnh tham khảo từ hệ thống career_knowledge (có thể dùng để neo dữ liệu):
{grounding_text[:3500]}

Định dạng JSON yêu cầu:
{{
  "recommendations": [
    {{
      "major_name": "...",
      "fit_score": 82,
      "fit_level": "cao",
      "why_fit": ["...", "..."],
      "required_skills": ["..."],
      "skill_gaps": ["..."],
      "related_fields": ["..."],
      "related_careers": ["..."],
      "growth_outlook": "...",
      "roadmap_hint": "..."
    }}
  ]
}}
""".strip()

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def _call_model() -> str:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.35,
                max_output_tokens=4096,
                thinking_config=types.ThinkingConfig(
                    thinking_level=types.ThinkingLevel.HIGH
                ),
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

    out: list[MajorRecommendation] = []
    for row in rows[:max_results]:
        if not isinstance(row, dict):
            continue
        rec = _sanitize_recommendation(row, query)
        if rec:
            out.append(rec)
    return out


def _parse_ai_recommendations_from_text(
    text: str, query: str, max_results: int
) -> list[MajorRecommendation]:
    cleaned = _strip_fenced_json(text)
    if not cleaned:
        return []
    data = json.loads(cleaned)
    rows = data.get("recommendations") if isinstance(data, dict) else []
    if not isinstance(rows, list):
        return []
    out: list[MajorRecommendation] = []
    for row in rows[:max_results]:
        if not isinstance(row, dict):
            continue
        rec = _sanitize_recommendation(row, query)
        if rec:
            out.append(rec)
    return out


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _to_str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        text = str(item).strip()
        if text:
            out.append(text)
    return out


def _build_stream_prompt(
    *,
    query: str,
    grade: str | None,
    age: int | None,
    interests_list: list[str],
    strengths_list: list[str],
    career_goal: str | None,
    study_preference: str | None,
    learning_style: str | None,
    budget_preference: str | None,
    max_results: int,
) -> str:
    payload = {
        "query": query,
        "grade": grade,
        "age": age,
        "interests": interests_list,
        "strengths": strengths_list,
        "career_goal": career_goal,
        "study_preference": study_preference,
        "learning_style": learning_style,
        "budget_preference": budget_preference,
        "max_results": max_results,
    }
    return f"""
Bạn là cố vấn hướng nghiệp STEM cho học sinh Việt Nam.
Trả về JSON hợp lệ DUY NHẤT theo schema:
{{
  "recommendations": [
    {{
      "major_name": "...",
      "fit_score": 82,
      "fit_level": "cao",
      "why_fit": ["...", "..."],
      "required_skills": ["..."],
      "skill_gaps": ["..."],
      "related_fields": ["..."],
      "related_careers": ["..."],
      "growth_outlook": "...",
      "roadmap_hint": "..."
    }}
  ]
}}

Yêu cầu:
- Tiếng Việt có dấu.
- Tối đa {max_results} ngành.
- Tập trung STEM.

Hồ sơ đầu vào:
{json.dumps(payload, ensure_ascii=False)}
""".strip()


@router.post("/search", response_model=CareerSearchResponse)
async def search_careers(
    query: str = Query(..., description="Tu khoa tim nganh/nghe"),
    grade: Optional[str] = Query(None, description="Lop hoc hien tai"),
    age: Optional[int] = Query(None, description="Do tuoi"),
    interests: Optional[str] = Query(
        None, description="So thich, cach nhau boi dau phay"
    ),
    strengths: Optional[str] = Query(
        None, description="Diem manh/ky nang, cach nhau boi dau phay"
    ),
    career_goal: Optional[str] = Query(None, description="Nghe nghiep mong muon"),
    study_preference: Optional[str] = Query(None, description="Hoc trong nuoc/du hoc"),
    learning_style: Optional[str] = Query(
        None, description="Thien nghien cuu hay ung dung"
    ),
    budget_preference: Optional[str] = Query(
        None, description="Muc do uu tien tai chinh"
    ),
    max_results: int = Query(5, description="So nganh de xuat toi da"),
):
    """Return AI-only major recommendations with structured JSON output."""

    interests_list = _split_csv(interests)
    strengths_list = _split_csv(strengths)
    effective_max = max(3, min(max_results, 10))

    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY chưa được cấu hình")

    try:
        ai_recommendations = await _generate_ai_recommendations(
            query=query,
            grade=grade,
            age=age,
            interests_list=interests_list,
            strengths_list=strengths_list,
            career_goal=career_goal,
            study_preference=study_preference,
            learning_style=learning_style,
            budget_preference=budget_preference,
            max_results=effective_max,
            grounding_text="",
        )
    except Exception as e:
        logger.error("AI career search failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Dịch vụ AI đang bận hoặc hết quota. Vui lòng thử lại sau.",
        )

    if not ai_recommendations:
        raise HTTPException(
            status_code=502,
            detail="AI không trả về dữ liệu hợp lệ. Vui lòng thử lại với mô tả cụ thể hơn.",
        )

    ai_recommendations.sort(key=lambda x: x.fit_score, reverse=True)
    return CareerSearchResponse(
        query=query,
        total=len(ai_recommendations),
        recommendations=ai_recommendations,
    )


@router.post("/search/stream")
async def search_careers_stream(
    query: str = Query(..., description="Tu khoa tim nganh/nghe"),
    grade: Optional[str] = Query(None, description="Lop hoc hien tai"),
    age: Optional[int] = Query(None, description="Do tuoi"),
    interests: Optional[str] = Query(
        None, description="So thich, cach nhau boi dau phay"
    ),
    strengths: Optional[str] = Query(
        None, description="Diem manh/ky nang, cach nhau boi dau phay"
    ),
    career_goal: Optional[str] = Query(None, description="Nghe nghiep mong muon"),
    study_preference: Optional[str] = Query(None, description="Hoc trong nuoc/du hoc"),
    learning_style: Optional[str] = Query(
        None, description="Thien nghien cuu hay ung dung"
    ),
    budget_preference: Optional[str] = Query(
        None, description="Muc do uu tien tai chinh"
    ),
    max_results: int = Query(5, description="So nganh de xuat toi da"),
):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY chưa được cấu hình")

    interests_list = _split_csv(interests)
    strengths_list = _split_csv(strengths)
    effective_max = max(3, min(max_results, 10))

    async def event_stream():
        yield _sse_event(
            "progress", {"step": "start", "message": "Đang phân tích hồ sơ học sinh..."}
        )
        prompt = _build_stream_prompt(
            query=query,
            grade=grade,
            age=age,
            interests_list=interests_list,
            strengths_list=strengths_list,
            career_goal=career_goal,
            study_preference=study_preference,
            learning_style=learning_style,
            budget_preference=budget_preference,
            max_results=effective_max,
        )

        try:
            yield _sse_event(
                "progress",
                {
                    "step": "llm",
                    "message": "AI đang suy luận và đề xuất chuyên ngành...",
                },
            )
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            chunks: list[str] = []
            response = client.models.generate_content_stream(
                model="gemini-3.1-flash-lite-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.35,
                    max_output_tokens=4096,
                    thinking_config=types.ThinkingConfig(
                        thinking_level=types.ThinkingLevel.HIGH
                    ),
                ),
            )

            for chunk in response:
                text = getattr(chunk, "text", "") or ""
                if text:
                    chunks.append(text)
                    yield _sse_event("text_delta", {"delta": text})

            raw_text = "".join(chunks)
            recommendations = _parse_ai_recommendations_from_text(
                raw_text,
                query=query,
                max_results=effective_max,
            )

            if not recommendations:
                yield _sse_event(
                    "error",
                    {
                        "message": "AI không trả về dữ liệu hợp lệ. Vui lòng thử lại với mô tả cụ thể hơn.",
                    },
                )
            else:
                recommendations.sort(key=lambda x: x.fit_score, reverse=True)
                payload = CareerSearchResponse(
                    query=query,
                    total=len(recommendations),
                    recommendations=recommendations,
                ).model_dump()
                yield _sse_event("final_result", payload)
        except Exception as e:
            logger.error("AI career stream failed: %s", e)
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
