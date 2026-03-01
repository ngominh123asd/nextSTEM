"""Roadmap service – generate, read, toggle tasks."""

import uuid

from sqlalchemy import select
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
