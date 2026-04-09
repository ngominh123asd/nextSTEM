"""Roadmap Generator — Tạo lộ trình chuẩn bị du học STEM.

Dựa trên grade level của học sinh, tạo timeline chi tiết
với các mốc quan trọng: thi chuẩn hóa, nộp hồ sơ, hoạt động ngoại khóa.
"""

import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ─────────────────────────── Roadmap Templates ───────────────────────────

ROADMAP_TEMPLATES = {
    "grade_9": {
        "title": "Lộ trình từ lớp 9 (4 năm chuẩn bị)",
        "phases": [
            {
                "period": "Lớp 9 (Năm 1)",
                "goals": "Xây nền tảng",
                "tasks": [
                    "Duy trì GPA ≥ 8.5/10 (hoặc 3.5/4.0)",
                    "Bắt đầu học thêm tiếng Anh, mục tiêu IELTS 5.5-6.0",
                    "Tham gia 1-2 CLB tại trường (khoa học, lập trình, toán)",
                    "Tìm hiểu về STEM competitions: IOAA, IPhO, IOI",
                    "Bắt đầu đọc sách khoa học bằng tiếng Anh",
                ],
            },
            {
                "period": "Lớp 10 (Năm 2)",
                "goals": "Tăng tốc",
                "tasks": [
                    "Duy trì GPA ≥ 9.0/10",
                    "Thi IELTS lần 1, mục tiêu 6.5+",
                    "Bắt đầu chuẩn bị SAT/ACT",
                    "Tham gia cuộc thi khoa học cấp thành phố/quốc gia",
                    "Bắt đầu 1 dự án nghiên cứu STEM cá nhân",
                    "Xây dựng leadership trong CLB",
                    "Tham gia volunteer / community service",
                ],
            },
            {
                "period": "Lớp 11 (Năm 3)",
                "goals": "Cao điểm chuẩn bị",
                "tasks": [
                    "Duy trì GPA tốt nhất có thể",
                    "Thi SAT/ACT (mục tiêu SAT ≥ 1450)",
                    "Thi IELTS lần 2 nếu cần (mục tiêu 7.0+)",
                    "Hoàn thành dự án nghiên cứu STEM",
                    "Tham gia ISEF, Google Science Fair hoặc tương đương",
                    "Bắt đầu viết Personal Statement draft",
                    "Tìm hiểu trường + học bổng cụ thể",
                    "Liên hệ giáo viên/mentor cho recommendation letters",
                ],
            },
            {
                "period": "Lớp 12 (Năm 4)",
                "goals": "Nộp hồ sơ",
                "tasks": [
                    "Tháng 8-9: Hoàn thiện danh sách trường (Reach/Match/Safety)",
                    "Tháng 10: Nộp Early Action/Early Decision",
                    "Tháng 11: Thi SAT/IELTS lần cuối nếu cần (score phải trước 11/1)",
                    "Tháng 12-1: Nộp Regular Decision",
                    "Tháng 1-3: Nộp học bổng (Fulbright, MEXT, KGSP...)",
                    "Tháng 3-4: Nhận kết quả, so sánh offer",
                    "Tháng 5: Xác nhận trường, làm visa",
                    "Tháng 7-8: Bay đi học 🎉",
                ],
            },
        ],
    },
    "grade_11": {
        "title": "Lộ trình từ lớp 11 (2 năm chuẩn bị gấp)",
        "phases": [
            {
                "period": "Lớp 11 (6 tháng còn lại)",
                "goals": "Sprint chuẩn bị",
                "tasks": [
                    "Thi IELTS ngay (mục tiêu 6.5+)",
                    "Đăng ký SAT (thi vào tháng 5 hoặc 6)",
                    "Bắt đầu 1 dự án STEM (có thể mini-project 3 tháng)",
                    "Viết Personal Statement draft 1",
                    "Tìm 2 giáo viên cho recommendation letters",
                    "Nghiên cứu 8-10 trường mục tiêu",
                ],
            },
            {
                "period": "Lớp 12",
                "goals": "Nộp hồ sơ",
                "tasks": [
                    "Tháng 8: Finalize danh sách trường",
                    "Tháng 9: Hoàn thiện essays, CV",
                    "Tháng 10: Early Application deadline",
                    "Tháng 11-1: Regular Application",
                    "Song song: Nộp học bổng",
                    "Tháng 3-4: Nhận kết quả",
                ],
            },
        ],
    },
    "university_transfer": {
        "title": "Lộ trình chuyển trường / Gap year",
        "phases": [
            {
                "period": "6 tháng đầu",
                "goals": "Cải thiện hồ sơ",
                "tasks": [
                    "Thi IELTS/TOEFL (mục tiêu 7.0+)",
                    "Thi GRE/GMAT nếu cần",
                    "Thực tập hoặc nghiên cứu liên quan",
                    "Hoàn thiện portfolio/CV",
                ],
            },
            {
                "period": "6 tháng sau",
                "goals": "Nộp hồ sơ",
                "tasks": [
                    "Viết Statement of Purpose",
                    "Nộp hồ sơ chuyển trường/thạc sĩ",
                    "Apply học bổng",
                ],
            },
        ],
    },
}


# ─────────────────────────── Tool Function ───────────────────────────


async def generate_roadmap(query: str) -> str:
    """Tạo lộ trình du học dựa trên thông tin học sinh.

    Args:
        query: Mô tả tình trạng học sinh

    Returns:
        Formatted roadmap timeline
    """
    query_lower = query.lower()

    # Detect grade level
    if any(kw in query_lower for kw in ["lớp 9", "grade 9", "lớp chín"]):
        template = ROADMAP_TEMPLATES["grade_9"]
    elif any(kw in query_lower for kw in ["chuyển trường", "transfer", "thạc sĩ", "master", "gap"]):
        template = ROADMAP_TEMPLATES["university_transfer"]
    else:
        # Default: lớp 11 (phổ biến nhất)
        template = ROADMAP_TEMPLATES["grade_11"]

    # Format
    output_lines = [f"# {template['title']}\n"]

    for phase in template["phases"]:
        output_lines.append(f"\n## 📅 {phase['period']} — {phase['goals']}")
        for task in phase["tasks"]:
            output_lines.append(f"- [ ] {task}")

    # Important dates
    now = datetime.now()
    current_year = now.year
    output_lines.append(f"\n---\n**⏰ Các mốc deadline quan trọng {current_year}-{current_year+1}:**")
    output_lines.append(f"- SAT: Tháng 3, 5, 6, 10, 11, 12")
    output_lines.append(f"- IELTS: Thi hàng tháng")
    output_lines.append(f"- Early Decision: 1/11/{current_year}")
    output_lines.append(f"- Regular Decision: 1/1/{current_year+1}")
    output_lines.append(f"- FAFSA/CSS Profile: 1/10/{current_year}")

    return "\n".join(output_lines)


async def generate_roadmap(
    query: str,
    grade: str | None = None,
    current_stage: str | None = None,
    intake_year: int | None = None,
    intake_term: str | None = None,
    timeline_target: str | None = None,
    target_country: str | None = None,
    target_field: str | None = None,
) -> str:
    """Create a roadmap with structured profile inputs when available."""

    query_lower = query.lower()
    normalized_grade = (grade or "").lower()
    normalized_stage = (current_stage or "").lower()

    if any(keyword in normalized_grade for keyword in ["grade 9", "lop 9", "lớp 9"]) or any(
        keyword in query_lower for keyword in ["lá»›p 9", "grade 9", "lá»›p chÃ­n"]
    ):
        template = ROADMAP_TEMPLATES["grade_9"]
    elif normalized_stage in {"transfer", "master", "gap year"} or any(
        keyword in query_lower
        for keyword in ["chuyá»ƒn trÆ°á»ng", "transfer", "tháº¡c sÄ©", "master", "gap"]
    ):
        template = ROADMAP_TEMPLATES["university_transfer"]
    else:
        template = ROADMAP_TEMPLATES["grade_11"]

    output_lines = [f"# {template['title']}\n"]

    summary_bits = []
    if grade:
        summary_bits.append(f"Current grade/stage: {grade}")
    elif current_stage:
        summary_bits.append(f"Current grade/stage: {current_stage}")
    if target_field:
        summary_bits.append(f"Target field: {target_field}")
    if target_country:
        summary_bits.append(f"Target destination: {target_country}")
    if intake_year:
        intake_label = f"{intake_term.title()} {intake_year}" if intake_term else str(intake_year)
        summary_bits.append(f"Target intake: {intake_label}")
    elif timeline_target:
        summary_bits.append(f"Timeline target: {timeline_target}")
    if summary_bits:
        output_lines.append("## Student Snapshot")
        output_lines.extend([f"- {item}" for item in summary_bits])

    for phase in template["phases"]:
        output_lines.append(f"\n## ðŸ“… {phase['period']} â€” {phase['goals']}")
        for task in phase["tasks"]:
            output_lines.append(f"- [ ] {task}")

    current_year = intake_year or datetime.now().year
    output_lines.append(f"\n---\n**â° CÃ¡c má»‘c deadline quan trá»ng {current_year}-{current_year + 1}:**")
    output_lines.append("- SAT: ThÃ¡ng 3, 5, 6, 10, 11, 12")
    output_lines.append("- IELTS: Thi hÃ ng thÃ¡ng")
    output_lines.append(f"- Early Decision: 1/11/{current_year}")
    output_lines.append(f"- Regular Decision: 1/1/{current_year + 1}")
    output_lines.append(f"- FAFSA/CSS Profile: 1/10/{current_year}")

    return "\n".join(output_lines)
