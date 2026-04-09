"""Recommendation Service — build DTS-aware AI prompts.

Transforms a learner's DTS profile and competency analysis into
structured system prompts for Gemini, enabling personalized:
- Learning journey recommendations
- AI-generated adaptive roadmap
- Context-enriched chat responses
"""

from __future__ import annotations

import json
import logging

logger = logging.getLogger(__name__)


def build_dts_context_block(dts_profile: dict, analysis: dict | None = None) -> str:
    """Build a concise DTS context block to prepend to any AI prompt."""
    lines = ["=== THÔNG TIN NGƯỜI HỌC (DTS Profile) ==="]

    # Basic info
    lines.append(f"Tên: {dts_profile.get('name', 'Người học')}")
    if dts_profile.get("grade"):
        lines.append(f"Lớp/Cấp: {dts_profile['grade']}")
    if dts_profile.get("school"):
        lines.append(f"Trường: {dts_profile['school']}")

    # Career orientation
    pv = dts_profile.get("personalization_vars", {})
    career = pv.get("career_orientation", {})
    if career.get("goals"):
        lines.append(f"Mục tiêu: {', '.join(career['goals'][:3])}")
    if career.get("interests"):
        lines.append(f"Lĩnh vực quan tâm: {', '.join(career['interests'][:3])}")

    # Portfolio
    lines.append(
        f"Portfolio: {dts_profile.get('project_count', 0)} dự án, "
        f"{dts_profile.get('certificate_count', 0)} chứng chỉ"
    )

    # Competency summary
    lines.append(f"\n=== NĂNG LỰC STEM (GDPT 2018 Framework) ===")
    lines.append(f"Điểm tổng: {dts_profile.get('overall_score', 0):.1f}/100")
    lines.append(f"Đã đánh giá: {dts_profile.get('assessed_indicators', 0)}/{dts_profile.get('total_indicators', 15)} chỉ số")

    comp_summary = dts_profile.get("competency_summary", [])
    for cs in comp_summary:
        score = cs.get("avg_score", 0)
        level = cs.get("level", 0)
        lines.append(f"  • {cs['competency_name']}: {score:.1f}/100 (Mức {level})")

    # Strengths & weaknesses from analysis
    if analysis:
        strengths = analysis.get("strengths", [])
        weaknesses = analysis.get("weaknesses", [])
        if strengths:
            top = strengths[0]
            lines.append(f"\nĐiểm mạnh nổi bật: {top['indicator_name']} ({top['competency_name']}, {top['score']}/100)")
        if weaknesses:
            weak = weaknesses[0]
            lines.append(f"Cần cải thiện nhất: {weak['indicator_name']} ({weak['competency_name']}, {weak['score']}/100)")
        recos = analysis.get("recommendations", [])
        if recos:
            lines.append(f"\nKhuyến nghị ưu tiên: {recos[0]}")

    lines.append("==========================================\n")
    return "\n".join(lines)


def build_chat_system_prompt(dts_profile: dict, analysis: dict | None, mode: str) -> str:
    """Build system prompt for AI Advisor chat with DTS context injected."""
    context = build_dts_context_block(dts_profile, analysis)

    mode_instructions = {
        "general": (
            "Bạn là AI Advisor của nền tảng nextSTEM — trợ lý tư vấn học tập STEM thông minh. "
            "Trả lời ngắn gọn, thực tế, bằng tiếng Việt. "
            "Dựa vào thông tin DTS Profile trên để cá nhân hóa phản hồi."
        ),
        "roadmap": (
            "Bạn là chuyên gia tư vấn lộ trình học tập STEM. "
            "Phân tích khoảng cách năng lực và đề xuất bước tiếp theo cụ thể. "
            "Dựa vào competency gaps để ưu tiên các hoạt động phù hợp nhất."
        ),
        "portfolio": (
            "Bạn là chuyên gia phân tích portfolio học sinh. "
            "Đánh giá hồ sơ và đề xuất cải thiện dựa trên năng lực STEM hiện tại. "
            "Chú ý đến sự cân bằng giữa các thành tố năng lực."
        ),
        "scholarship": (
            "Bạn là chuyên gia tư vấn học bổng STEM quốc tế. "
            "Gợi ý học bổng phù hợp với năng lực, mục tiêu và lĩnh vực quan tâm của người học. "
            "Phân tích điểm mạnh cần nhấn mạnh trong hồ sơ."
        ),
    }

    base = mode_instructions.get(mode, mode_instructions["general"])
    return f"{context}\n{base}"


def build_recommendation_prompt(dts_profile: dict, analysis: dict | None) -> str:
    """Build prompt for generating personalized learning recommendations."""
    context = build_dts_context_block(dts_profile, analysis)

    weaknesses = []
    if analysis:
        weaknesses = analysis.get("weaknesses", [])

    weak_text = ""
    if weaknesses:
        weak_items = [f"- {w['indicator_name']} ({w['competency_name']}): {w['score']}/100"
                      for w in weaknesses[:3]]
        weak_text = "Các chỉ số cần ưu tiên cải thiện:\n" + "\n".join(weak_items)

    return f"""{context}
{weak_text}

Dựa vào thông tin trên, hãy tạo 4 khuyến nghị học tập cụ thể và thực tế.
Trả lời theo định dạng JSON sau (chỉ trả JSON, không có text khác):

[
  {{
    "title": "Tiêu đề ngắn gọn (tối đa 8 từ)",
    "description": "Mô tả hành động cụ thể người học cần làm (2-3 câu)",
    "indicator_code": "Mã chỉ số liên quan (VD: TT1, XS3...)",
    "competency": "Tên thành tố năng lực",
    "priority": "high|medium|low",
    "action_type": "project|study|assessment|community",
    "estimated_time": "Thời gian ước tính (VD: 2 tuần)"
  }}
]

Chú ý: Khuyến nghị phải dựa trực tiếp vào điểm yếu của người học, thực tế và có thể thực hiện được."""


def build_ai_roadmap_prompt(dts_profile: dict, analysis: dict | None) -> str:
    """Build prompt for AI-generated personalized roadmap."""
    context = build_dts_context_block(dts_profile, analysis)

    pv = dts_profile.get("personalization_vars", {})
    career = pv.get("career_orientation", {})
    goals_text = ", ".join(career.get("goals", ["phát triển năng lực STEM"])[:3])
    proj_count = dts_profile.get("project_count", 0)
    cert_count = dts_profile.get("certificate_count", 0)
    overall = dts_profile.get("overall_score", 0)

    return f"""{context}
Mục tiêu học tập: {goals_text}
Số dự án hiện có: {proj_count}
Số chứng chỉ: {cert_count}
Điểm năng lực tổng: {overall}/100

Hãy tạo một lộ trình học tập STEM cá nhân hóa gồm 5 giai đoạn.
Trả lời theo định dạng JSON sau (chỉ trả JSON, không có text khác):

[
  {{
    "title": "Tên giai đoạn ngắn gọn",
    "desc": "Mục tiêu của giai đoạn này (1-2 câu)",
    "icon": "material_icon_name",
    "color": "from-blue-500 to-blue-600",
    "duration": "Thời gian (VD: Tháng 1-2)",
    "focus_competency": "Thành tố năng lực trọng tâm",
    "tasks": [
      "Nhiệm vụ 1 cụ thể",
      "Nhiệm vụ 2 cụ thể",
      "Nhiệm vụ 3 cụ thể"
    ]
  }}
]

Color options: from-blue-500 to-blue-600, from-indigo-500 to-indigo-600, from-violet-500 to-purple-500, from-emerald-500 to-teal-500, from-amber-500 to-orange-500
Icon options: explore, trending_up, science, description, send, psychology, build, groups, verified

Chú ý: Mỗi giai đoạn phải tập trung vào cải thiện một thành tố năng lực cụ thể dựa trên khoảng cách đã xác định."""
