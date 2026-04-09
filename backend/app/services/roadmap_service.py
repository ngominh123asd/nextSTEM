"""Roadmap service – generate, read, toggle tasks.

generate_ai_roadmap() parses the JSON produced by /gemini/roadmap
and persists it as a proper Roadmap → Steps → Tasks hierarchy.
"""

import json
import logging
import uuid

from sqlalchemy import select

logger = logging.getLogger(__name__)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.roadmap import Roadmap, RoadmapStep, RoadmapTask

# Template for AI-generated roadmap (placeholder until real AI)
_TEMPLATE_STEPS = [
    ("Khám phá & Định hướng", "Xác định mục tiêu du học", "explore", "from-blue-500 to-blue-600", "Tháng 1–2",
     ["Hoàn thành trắc nghiệm định hướng", "Nghiên cứu 5 ngành học", "Lập danh sách 10 trường"]),
    ("Nâng cao Năng lực", "Chuẩn bị bài thi & kỹ năng", "trending_up", "from-indigo-500 to-indigo-600", "Tháng 3–5",
     ["Luyện thi IELTS/TOEFL", "Ôn tập SAT/AP", "Khóa học online chuyên ngành", "Xây dựng dự án STEM"]),
    ("Xây dựng Hồ sơ", "Hoạt động ngoại khoá & bài luận", "description", "from-violet-500 to-purple-500", "Tháng 6–8",
     ["Viết draft Personal Statement", "Cập nhật Portfolio", "Xin thư giới thiệu", "Hoạt động tình nguyện"]),
    ("Nộp hồ sơ", "Ứng tuyển & học bổng", "send", "from-emerald-500 to-teal-500", "Tháng 9–11",
     ["Hoàn thiện bài luận", "Nộp Early Decision", "Nộp đơn học bổng", "Chuẩn bị Regular Decision"]),
    ("Chuẩn bị Khởi hành", "Visa, chỗ ở & khởi hành", "flight_takeoff", "from-amber-500 to-orange-500", "Tháng 12–1",
     ["Xin visa du học", "Đặt chỗ ở", "Mua vé máy bay", "Orientation online"]),
]


async def generate_roadmap(db: AsyncSession, user_id: uuid.UUID) -> Roadmap:
    roadmap = Roadmap(user_id=user_id)
    roadmap.steps = []
    db.add(roadmap)
    await db.flush()

    for idx, (title, desc, icon, color, dur, tasks) in enumerate(_TEMPLATE_STEPS):
        step = RoadmapStep(
            roadmap_id=roadmap.id, order=idx + 1,
            title=title, description=desc, icon=icon, color=color, duration=dur,
        )
        step.tasks = []
        db.add(step)
        await db.flush()
        for t_idx, text in enumerate(tasks):
            task = RoadmapTask(step_id=step.id, order=t_idx + 1, text=text)
            db.add(task)
            step.tasks.append(task)
        roadmap.steps.append(step)
    await db.flush()
    return roadmap


async def get_roadmap(db: AsyncSession, user_id: uuid.UUID) -> Roadmap | None:
    result = await db.execute(
        select(Roadmap)
        .options(selectinload(Roadmap.steps).selectinload(RoadmapStep.tasks))
        .where(Roadmap.user_id == user_id)
        .order_by(Roadmap.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def toggle_task(db: AsyncSession, task_id: uuid.UUID, done: bool) -> RoadmapTask | None:
    task = await db.get(RoadmapTask, task_id)
    if task is None:
        return None
    task.done = done
    await db.flush()
    return task


async def delete_roadmap(db: AsyncSession, user_id: uuid.UUID) -> bool:
    """Delete the user's current roadmap (for regeneration)."""
    result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user_id).limit(1)
    )
    roadmap = result.scalar_one_or_none()
    if roadmap is None:
        return False
    await db.delete(roadmap)
    return True


async def generate_ai_roadmap(
    db: AsyncSession,
    user_id: uuid.UUID,
    ai_json_text: str,
) -> Roadmap:
    """Parse Gemini JSON output and persist as Roadmap → Steps → Tasks.

    Expected JSON: list of step objects with title, desc, icon, color,
    duration, focus_competency, tasks (list of strings).
    """
    # Clean up potential markdown code fences
    cleaned = ai_json_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        steps_data = json.loads(cleaned)
        if not isinstance(steps_data, list):
            raise ValueError("Expected a JSON array")
    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Failed to parse AI roadmap JSON: %s\nRaw: %.200s", e, ai_json_text)
        # Fallback to template
        return await generate_roadmap(db, user_id)

    # Delete existing roadmap first
    await delete_roadmap(db, user_id)
    await db.flush()

    roadmap = Roadmap(user_id=user_id, title="Lộ trình STEM cá nhân hóa (AI)")
    roadmap.steps = []
    db.add(roadmap)
    await db.flush()

    for idx, step_data in enumerate(steps_data[:6]):  # max 6 steps
        step = RoadmapStep(
            roadmap_id=roadmap.id,
            order=idx + 1,
            title=step_data.get("title", f"Giai đoạn {idx + 1}"),
            description=step_data.get("desc") or step_data.get("description", ""),
            icon=step_data.get("icon", "star"),
            color=step_data.get("color", "from-blue-500 to-blue-600"),
            duration=step_data.get("duration", ""),
        )
        step.tasks = []
        db.add(step)
        await db.flush()

        task_texts = step_data.get("tasks", [])
        for t_idx, text in enumerate(task_texts[:6]):  # max 6 tasks per step
            task = RoadmapTask(
                step_id=step.id,
                order=t_idx + 1,
                text=str(text),
            )
            db.add(task)
            step.tasks.append(task)

        roadmap.steps.append(step)

    await db.flush()
    logger.info("AI roadmap generated for user=%s steps=%d", user_id, len(steps_data))
    return roadmap