"""Competency service — CRUD, radar data, analysis.

Implements the STEM Competency Framework (Nguyễn T. Nga et al., 2022)
with support for multiple assessment sources.
"""

import uuid
import logging
from datetime import datetime

from sqlalchemy import select, func as sa_func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.competency import (
    STEMCompetency,
    BehavioralIndicator,
    CompetencyScore,
)

logger = logging.getLogger(__name__)


# ── Framework CRUD ────────────────────────────────────────────

async def get_framework(db: AsyncSession) -> list[STEMCompetency]:
    """Return the full STEM competency framework with indicators."""
    result = await db.execute(
        select(STEMCompetency)
        .options(selectinload(STEMCompetency.indicators))
        .order_by(STEMCompetency.display_order)
    )
    return list(result.scalars().unique().all())


async def get_indicator_by_id(
    db: AsyncSession, indicator_id: uuid.UUID
) -> BehavioralIndicator | None:
    return await db.get(BehavioralIndicator, indicator_id)


# ── User Scores ───────────────────────────────────────────────

async def get_user_scores(
    db: AsyncSession, user_id: uuid.UUID
) -> list[CompetencyScore]:
    """Get the latest score per indicator for a user."""
    # Subquery to find latest score per indicator
    latest = (
        select(
            CompetencyScore.indicator_id,
            sa_func.max(CompetencyScore.assessed_at).label("max_at"),
        )
        .where(CompetencyScore.user_id == user_id)
        .group_by(CompetencyScore.indicator_id)
        .subquery()
    )

    result = await db.execute(
        select(CompetencyScore)
        .join(
            latest,
            and_(
                CompetencyScore.indicator_id == latest.c.indicator_id,
                CompetencyScore.assessed_at == latest.c.max_at,
            ),
        )
        .where(CompetencyScore.user_id == user_id)
    )
    return list(result.scalars().all())


async def upsert_score(
    db: AsyncSession,
    user_id: uuid.UUID,
    indicator_id: uuid.UUID,
    score: float,
    level: int = 1,
    source: str = "self_assessment",
    evidence_note: str | None = None,
) -> CompetencyScore:
    """Create a new score entry (append-only for history)."""
    new_score = CompetencyScore(
        user_id=user_id,
        indicator_id=indicator_id,
        score=score,
        level=level,
        source=source,
        evidence_note=evidence_note,
        assessed_at=datetime.utcnow(),
    )
    db.add(new_score)
    await db.flush()
    return new_score


async def batch_upsert_scores(
    db: AsyncSession,
    user_id: uuid.UUID,
    scores: list[dict],
) -> list[CompetencyScore]:
    """Batch create score entries."""
    results = []
    for s in scores:
        score = await upsert_score(
            db,
            user_id=user_id,
            indicator_id=s["indicator_id"],
            score=s["score"],
            level=s.get("level", max(1, min(5, int(s["score"] / 20) + 1))),
            source=s.get("source", "self_assessment"),
            evidence_note=s.get("evidence_note"),
        )
        results.append(score)
    return results


# ── Radar Data ────────────────────────────────────────────────

async def get_radar_data(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Build radar chart data: one point per competency (avg of indicators)."""
    framework = await get_framework(db)
    user_scores = await get_user_scores(db, user_id)

    # Index scores by indicator_id
    score_map = {str(s.indicator_id): s for s in user_scores}

    data = []
    total_score = 0.0
    total_assessed = 0
    total_indicators = 0

    for comp in framework:
        indicator_scores = []
        scored_count = 0

        for ind in comp.indicators:
            total_indicators += 1
            s = score_map.get(str(ind.id))
            if s:
                indicator_scores.append(s.score)
                scored_count += 1
                total_assessed += 1
            else:
                indicator_scores.append(0.0)

        avg = sum(indicator_scores) / len(indicator_scores) if indicator_scores else 0
        total_score += avg

        data.append({
            "competency_code": comp.code,
            "competency_name": comp.name,
            "score": round(avg, 1),
            "indicator_count": len(comp.indicators),
            "scored_count": scored_count,
        })

    overall = round(total_score / len(data), 1) if data else 0

    return {
        "data": data,
        "overall_score": overall,
        "assessed_indicators": total_assessed,
        "total_indicators": total_indicators,
    }


# ── Strengths / Weaknesses Analysis ──────────────────────────

async def get_analysis(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Analyze strengths and weaknesses based on current scores."""
    framework = await get_framework(db)
    user_scores = await get_user_scores(db, user_id)
    score_map = {str(s.indicator_id): s for s in user_scores}

    # Build indicator → competency name mapping
    all_indicators = []
    for comp in framework:
        for ind in comp.indicators:
            s = score_map.get(str(ind.id))
            if s:
                all_indicators.append({
                    "indicator_code": ind.code,
                    "indicator_name": ind.name,
                    "competency_name": comp.name,
                    "score": s.score,
                    "level": s.level,
                    "source": s.source,
                })

    if not all_indicators:
        return {
            "strengths": [],
            "weaknesses": [],
            "overall_score": 0,
            "profile_status": "not_started",
            "recommendations": [
                "Hãy bắt đầu tự đánh giá năng lực STEM để hệ thống có thể phân tích và đưa ra khuyến nghị!",
            ],
        }

    sorted_by_score = sorted(all_indicators, key=lambda x: x["score"], reverse=True)
    strengths = sorted_by_score[:3]
    weaknesses = sorted(all_indicators, key=lambda x: x["score"])[:3]

    overall = round(sum(i["score"] for i in all_indicators) / len(all_indicators), 1)

    total_possible = sum(len(c.indicators) for c in framework)
    assessed_ratio = len(all_indicators) / total_possible if total_possible else 0

    if assessed_ratio == 0:
        status = "not_started"
    elif assessed_ratio < 1.0:
        status = "in_progress"
    else:
        status = "complete"

    # Generate simple recommendations
    recommendations = []
    for w in weaknesses:
        if w["score"] < 40:
            recommendations.append(
                f"Năng lực '{w['indicator_name']}' ({w['competency_name']}) "
                f"đang ở mức thấp ({w['score']}/100). "
                f"Hãy tham gia các hoạt động liên quan để cải thiện."
            )
    if assessed_ratio < 1.0:
        missing = total_possible - len(all_indicators)
        recommendations.append(
            f"Còn {missing}/{total_possible} chỉ số chưa được đánh giá. "
            f"Hoàn thành đánh giá để có phân tích chính xác hơn."
        )

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "overall_score": overall,
        "profile_status": status,
        "recommendations": recommendations,
    }


# ── Seed Default Framework ────────────────────────────────────

async def seed_default_framework(db: AsyncSession) -> None:
    """Seed the 5 competencies × 15 indicators based on GDPT 2018 framework."""
    existing = await db.execute(select(STEMCompetency).limit(1))
    if existing.scalar_one_or_none():
        logger.info("STEM framework already seeded, skipping.")
        return

    framework_data = [
        {
            "code": "info_gathering",
            "name": "Thu thập thông tin",
            "description": "Khả năng xác định vấn đề, định vị và thu thập thông tin liên quan trong bối cảnh STEM.",
            "icon": "search",
            "color": "from-blue-500 to-blue-600",
            "order": 1,
            "indicators": [
                {
                    "code": "TT1",
                    "name": "Xác định vấn đề",
                    "description": "Nhận diện và xác định rõ ràng vấn đề cần giải quyết trong bối cảnh STEM.",
                    "levels": {
                        "level_1": "Chưa xác định được vấn đề cần giải quyết",
                        "level_2": "Xác định vấn đề nhưng chưa rõ ràng, cần hỗ trợ",
                        "level_3": "Xác định được vấn đề cơ bản, có phần đúng hướng",
                        "level_4": "Xác định rõ ràng vấn đề và các yếu tố liên quan",
                        "level_5": "Xác định vấn đề chính xác, phân tích sâu các yếu tố và mối liên hệ",
                    },
                },
                {
                    "code": "TT2",
                    "name": "Định vị thông tin",
                    "description": "Tìm kiếm và định vị các nguồn thông tin phù hợp, đáng tin cậy.",
                    "levels": {
                        "level_1": "Chưa biết cách tìm kiếm thông tin liên quan",
                        "level_2": "Tìm được thông tin nhưng chưa phù hợp hoặc thiếu tin cậy",
                        "level_3": "Tìm được một số nguồn thông tin phù hợp",
                        "level_4": "Định vị chính xác nhiều nguồn thông tin đáng tin cậy",
                        "level_5": "Sử dụng đa dạng chiến lược tìm kiếm, đánh giá và chọn lọc nguồn tối ưu",
                    },
                },
                {
                    "code": "TT3",
                    "name": "Thu thập thông tin",
                    "description": "Thu thập dữ liệu và thông tin một cách có hệ thống và đầy đủ.",
                    "levels": {
                        "level_1": "Chưa thu thập được thông tin cần thiết",
                        "level_2": "Thu thập được ít thông tin, chưa có hệ thống",
                        "level_3": "Thu thập đủ thông tin cơ bản cho vấn đề",
                        "level_4": "Thu thập thông tin đầy đủ, có hệ thống và tổ chức tốt",
                        "level_5": "Thu thập thông tin toàn diện, đa chiều, sử dụng nhiều phương pháp",
                    },
                },
            ],
        },
        {
            "code": "info_processing",
            "name": "Xử lí và sử dụng thông tin",
            "description": "Khả năng đánh giá, quản lí và phân tích thông tin để phục vụ giải quyết vấn đề STEM.",
            "icon": "analytics",
            "color": "from-indigo-500 to-indigo-600",
            "order": 2,
            "indicators": [
                {
                    "code": "XS1",
                    "name": "Đánh giá thông tin",
                    "description": "Đánh giá tính chính xác, tin cậy và phù hợp của thông tin thu thập được.",
                    "levels": {
                        "level_1": "Chưa đánh giá được tính chính xác của thông tin",
                        "level_2": "Đánh giá sơ bộ nhưng thiếu tiêu chí rõ ràng",
                        "level_3": "Đánh giá được mức độ tin cậy cơ bản của thông tin",
                        "level_4": "Đánh giá thông tin theo nhiều tiêu chí, phát hiện sai sót",
                        "level_5": "Đánh giá chuyên sâu, so sánh đa nguồn, phản biện thông tin",
                    },
                },
                {
                    "code": "XS2",
                    "name": "Quản lí dữ liệu",
                    "description": "Tổ chức, lưu trữ và quản lí dữ liệu một cách khoa học và hiệu quả.",
                    "levels": {
                        "level_1": "Chưa biết cách tổ chức dữ liệu",
                        "level_2": "Tổ chức dữ liệu đơn giản nhưng chưa khoa học",
                        "level_3": "Quản lí dữ liệu có cấu trúc cơ bản",
                        "level_4": "Quản lí dữ liệu khoa học, dễ truy xuất và sử dụng lại",
                        "level_5": "Thiết kế hệ thống quản lí dữ liệu chuyên nghiệp, tự động hóa",
                    },
                },
                {
                    "code": "XS3",
                    "name": "Phân tích thông tin",
                    "description": "Phân tích, tổng hợp thông tin để rút ra kết luận và hỗ trợ ra quyết định.",
                    "levels": {
                        "level_1": "Chưa phân tích được thông tin thu thập",
                        "level_2": "Phân tích đơn giản, chưa rút ra kết luận rõ ràng",
                        "level_3": "Phân tích và rút ra một số nhận định cơ bản",
                        "level_4": "Phân tích sâu, tổng hợp đa chiều, đưa ra kết luận logic",
                        "level_5": "Phân tích chuyên sâu, sử dụng công cụ/phương pháp khoa học, kết luận có căn cứ vững chắc",
                    },
                },
            ],
        },
        {
            "code": "solution_impl",
            "name": "Thực hiện giải pháp",
            "description": "Khả năng lập kế hoạch, thực hiện và cải tiến giải pháp cho vấn đề STEM.",
            "icon": "build",
            "color": "from-emerald-500 to-teal-500",
            "order": 3,
            "indicators": [
                {
                    "code": "TH1",
                    "name": "Lập kế hoạch thực hiện",
                    "description": "Xây dựng kế hoạch thực hiện giải pháp với các bước cụ thể, nguồn lực và thời gian.",
                    "levels": {
                        "level_1": "Chưa lập được kế hoạch thực hiện",
                        "level_2": "Lập kế hoạch sơ bộ, thiếu chi tiết",
                        "level_3": "Lập kế hoạch có các bước cơ bản và phân chia công việc",
                        "level_4": "Lập kế hoạch chi tiết với thời gian, nguồn lực và phương án dự phòng",
                        "level_5": "Lập kế hoạch chuyên nghiệp, tối ưu hóa nguồn lực, có phân tích rủi ro",
                    },
                },
                {
                    "code": "TH2",
                    "name": "Thực hiện giải pháp",
                    "description": "Triển khai giải pháp theo kế hoạch, điều chỉnh khi cần thiết.",
                    "levels": {
                        "level_1": "Chưa thực hiện được giải pháp",
                        "level_2": "Thực hiện một phần, gặp nhiều khó khăn",
                        "level_3": "Thực hiện được giải pháp cơ bản theo kế hoạch",
                        "level_4": "Thực hiện giải pháp hiệu quả, điều chỉnh linh hoạt",
                        "level_5": "Thực hiện xuất sắc, sáng tạo trong giải quyết vấn đề phát sinh",
                    },
                },
                {
                    "code": "TH3",
                    "name": "Cải tiến giải pháp",
                    "description": "Đánh giá kết quả và cải tiến giải pháp dựa trên phản hồi và dữ liệu.",
                    "levels": {
                        "level_1": "Chưa nhận thấy cần cải tiến",
                        "level_2": "Nhận thấy hạn chế nhưng chưa biết cách cải tiến",
                        "level_3": "Đề xuất được một số cải tiến khả thi",
                        "level_4": "Cải tiến giải pháp dựa trên phân tích dữ liệu và phản hồi",
                        "level_5": "Cải tiến sáng tạo, tối ưu hóa hiệu suất, áp dụng công nghệ mới",
                    },
                },
            ],
        },
        {
            "code": "tech_safety",
            "name": "An toàn kĩ thuật",
            "description": "Khả năng đảm bảo an toàn, thao tác đúng kĩ thuật và bảo quản thiết bị.",
            "icon": "health_and_safety",
            "color": "from-amber-500 to-orange-500",
            "order": 4,
            "indicators": [
                {
                    "code": "AT1",
                    "name": "Đảm bảo an toàn kĩ thuật",
                    "description": "Tuân thủ quy tắc an toàn trong quá trình thực hành, thí nghiệm STEM.",
                    "levels": {
                        "level_1": "Chưa nhận thức được các quy tắc an toàn",
                        "level_2": "Biết quy tắc nhưng chưa tuân thủ đầy đủ",
                        "level_3": "Tuân thủ các quy tắc an toàn cơ bản",
                        "level_4": "Luôn đảm bảo an toàn, nhắc nhở người khác tuân thủ",
                        "level_5": "Chủ động đánh giá rủi ro, thiết lập quy trình an toàn cho nhóm",
                    },
                },
                {
                    "code": "AT2",
                    "name": "Thao tác kĩ thuật",
                    "description": "Thực hiện các thao tác kĩ thuật chính xác, đúng quy trình.",
                    "levels": {
                        "level_1": "Chưa thực hiện được thao tác kĩ thuật cơ bản",
                        "level_2": "Thực hiện được nhưng chưa chính xác, cần hướng dẫn",
                        "level_3": "Thao tác kĩ thuật cơ bản đúng quy trình",
                        "level_4": "Thao tác thành thạo, chính xác và hiệu quả",
                        "level_5": "Thao tác chuyên nghiệp, sáng tạo cải tiến quy trình kĩ thuật",
                    },
                },
                {
                    "code": "AT3",
                    "name": "Bảo quản thiết bị, dụng cụ kĩ thuật",
                    "description": "Sử dụng và bảo quản thiết bị, dụng cụ đúng cách, kéo dài tuổi thọ.",
                    "levels": {
                        "level_1": "Chưa biết cách bảo quản thiết bị",
                        "level_2": "Bảo quản sơ bộ, đôi khi sử dụng sai cách",
                        "level_3": "Bảo quản đúng cách các thiết bị cơ bản",
                        "level_4": "Bảo quản tốt, biết bảo trì và khắc phục sự cố nhỏ",
                        "level_5": "Quản lí thiết bị chuyên nghiệp, hướng dẫn người khác bảo quản đúng cách",
                    },
                },
            ],
        },
        {
            "code": "community_sharing",
            "name": "Chia sẻ cộng đồng",
            "description": "Khả năng lựa chọn hình thức chia sẻ, trình bày kết quả và phản biện khoa học.",
            "icon": "groups",
            "color": "from-violet-500 to-purple-500",
            "order": 5,
            "indicators": [
                {
                    "code": "CS1",
                    "name": "Lựa chọn hình thức chia sẻ",
                    "description": "Chọn phương thức trình bày và chia sẻ phù hợp với đối tượng và nội dung.",
                    "levels": {
                        "level_1": "Chưa biết cách chia sẻ kết quả",
                        "level_2": "Chia sẻ với hình thức đơn giản, chưa phù hợp",
                        "level_3": "Chọn được hình thức chia sẻ phù hợp cơ bản",
                        "level_4": "Lựa chọn sáng tạo, đa dạng hình thức chia sẻ",
                        "level_5": "Thiết kế chiến lược truyền thông chuyên nghiệp, tối ưu cho từng đối tượng",
                    },
                },
                {
                    "code": "CS2",
                    "name": "Trình bày kết quả",
                    "description": "Trình bày kết quả một cách rõ ràng, logic và thuyết phục.",
                    "levels": {
                        "level_1": "Chưa trình bày được kết quả",
                        "level_2": "Trình bày nhưng thiếu logic và rõ ràng",
                        "level_3": "Trình bày kết quả cơ bản, có cấu trúc",
                        "level_4": "Trình bày rõ ràng, logic, sử dụng minh chứng thuyết phục",
                        "level_5": "Trình bày chuyên nghiệp, thu hút, kết hợp đa phương tiện hiệu quả",
                    },
                },
                {
                    "code": "CS3",
                    "name": "Phản biện",
                    "description": "Đưa ra nhận xét, phản biện có căn cứ và tiếp nhận phản hồi xây dựng.",
                    "levels": {
                        "level_1": "Chưa có khả năng phản biện",
                        "level_2": "Phản biện đơn giản, thiếu căn cứ",
                        "level_3": "Phản biện có lập luận cơ bản",
                        "level_4": "Phản biện sắc bén, có căn cứ khoa học, tiếp nhận phản hồi",
                        "level_5": "Phản biện chuyên sâu, đóng góp giá trị cho cộng đồng, tự điều chỉnh hiệu quả",
                    },
                },
            ],
        },
    ]

    for comp_data in framework_data:
        comp = STEMCompetency(
            code=comp_data["code"],
            name=comp_data["name"],
            description=comp_data["description"],
            icon=comp_data.get("icon"),
            color=comp_data.get("color"),
            display_order=comp_data["order"],
        )
        db.add(comp)
        await db.flush()  # Get comp.id

        for idx, ind_data in enumerate(comp_data["indicators"]):
            indicator = BehavioralIndicator(
                competency_id=comp.id,
                code=ind_data["code"],
                name=ind_data["name"],
                description=ind_data.get("description"),
                level_descriptors=ind_data.get("levels"),
                display_order=idx + 1,
            )
            db.add(indicator)

    await db.flush()
    logger.info("Seeded STEM competency framework: 5 competencies, 15 indicators")
