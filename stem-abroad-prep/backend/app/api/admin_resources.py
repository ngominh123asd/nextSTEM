"""Admin CRUD for resource data (scholarships & universities JSON files)."""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.deps import require_admin
from app.models.user import User

router = APIRouter(prefix="/admin/resources", tags=["admin-resources"])

# ── JSON file paths (relative to project root) ──────────────────
DATA_DIR = Path(__file__).resolve().parents[3] / "data"
SCHOLARSHIPS_FILE = DATA_DIR / "scholarships.json"
UNIVERSITIES_FILE = DATA_DIR / "universities.json"


def _read_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: Path, data: list[dict]):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ── Pydantic Schemas ─────────────────────────────────────────────

class ScholarshipCreate(BaseModel):
    name: str
    country: str
    countryCode: str
    countryFlag: str = ""
    value: str
    level: str
    deadline: str
    image: str = ""
    description: str = ""
    benefits: list[str] = []
    requirements: list[str] = []
    fields: list[str] = []
    applicationUrl: str = ""
    hostInstitution: str = ""
    duration: str = ""
    openDate: str = ""
    status: str = "Đang mở đơn"


class ScholarshipUpdate(BaseModel):
    name: str | None = None
    country: str | None = None
    countryCode: str | None = None
    countryFlag: str | None = None
    value: str | None = None
    level: str | None = None
    deadline: str | None = None
    image: str | None = None
    description: str | None = None
    benefits: list[str] | None = None
    requirements: list[str] | None = None
    fields: list[str] | None = None
    applicationUrl: str | None = None
    hostInstitution: str | None = None
    duration: str | None = None
    openDate: str | None = None
    status: str | None = None


class UniversityCreate(BaseModel):
    name: str
    shortName: str = ""
    country: str
    countryCode: str
    countryFlag: str = ""
    city: str = ""
    rank: str = ""
    acceptRate: str = ""
    fields: list[str] = []
    image: str = ""
    description: str = ""
    founded: int | None = None
    type: str = ""
    studentCount: str = ""
    internationalRate: str = ""
    tuitionFee: str = ""
    financialAid: str = ""
    topPrograms: list[str] = []
    campusLife: str = ""
    admissionTips: list[str] = []
    website: str = ""


class UniversityUpdate(BaseModel):
    name: str | None = None
    shortName: str | None = None
    country: str | None = None
    countryCode: str | None = None
    countryFlag: str | None = None
    city: str | None = None
    rank: str | None = None
    acceptRate: str | None = None
    fields: list[str] | None = None
    image: str | None = None
    description: str | None = None
    founded: int | None = None
    type: str | None = None
    studentCount: str | None = None
    internationalRate: str | None = None
    tuitionFee: str | None = None
    financialAid: str | None = None
    topPrograms: list[str] | None = None
    campusLife: str | None = None
    admissionTips: list[str] | None = None
    website: str | None = None


# ── Scholarships CRUD ────────────────────────────────────────────

@router.get("/scholarships")
async def list_scholarships(admin: User = Depends(require_admin)):
    return _read_json(SCHOLARSHIPS_FILE)


@router.post("/scholarships", status_code=201)
async def create_scholarship(
    body: ScholarshipCreate,
    admin: User = Depends(require_admin),
):
    data = _read_json(SCHOLARSHIPS_FILE)
    slug = body.name.lower().replace(" ", "-").replace("&", "and")
    # Ensure unique id
    existing_ids = {item["id"] for item in data}
    item_id = slug
    if item_id in existing_ids:
        item_id = f"{slug}-{uuid.uuid4().hex[:6]}"

    new_item = {
        "id": item_id,
        **body.model_dump(),
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "updatedBy": admin.name or admin.email,
    }
    data.append(new_item)
    _write_json(SCHOLARSHIPS_FILE, data)
    return new_item


@router.put("/scholarships/{item_id}")
async def update_scholarship(
    item_id: str,
    body: ScholarshipUpdate,
    admin: User = Depends(require_admin),
):
    data = _read_json(SCHOLARSHIPS_FILE)
    for i, item in enumerate(data):
        if item["id"] == item_id:
            updates = body.model_dump(exclude_unset=True)
            data[i] = {
                **item,
                **updates,
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "updatedBy": admin.name or admin.email,
            }
            _write_json(SCHOLARSHIPS_FILE, data)
            return data[i]
    raise HTTPException(404, "Scholarship not found")


@router.delete("/scholarships/{item_id}", status_code=204)
async def delete_scholarship(
    item_id: str,
    admin: User = Depends(require_admin),
):
    data = _read_json(SCHOLARSHIPS_FILE)
    new_data = [item for item in data if item["id"] != item_id]
    if len(new_data) == len(data):
        raise HTTPException(404, "Scholarship not found")
    _write_json(SCHOLARSHIPS_FILE, new_data)


# ── Universities CRUD ────────────────────────────────────────────

@router.get("/universities")
async def list_universities(admin: User = Depends(require_admin)):
    return _read_json(UNIVERSITIES_FILE)


@router.post("/universities", status_code=201)
async def create_university(
    body: UniversityCreate,
    admin: User = Depends(require_admin),
):
    data = _read_json(UNIVERSITIES_FILE)
    slug = body.name.lower().replace(" ", "-").replace("&", "and")
    existing_ids = {item["id"] for item in data}
    item_id = slug
    if item_id in existing_ids:
        item_id = f"{slug}-{uuid.uuid4().hex[:6]}"

    new_item = {
        "id": item_id,
        **body.model_dump(),
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "updatedBy": admin.name or admin.email,
    }
    data.append(new_item)
    _write_json(UNIVERSITIES_FILE, data)
    return new_item


@router.put("/universities/{item_id}")
async def update_university(
    item_id: str,
    body: UniversityUpdate,
    admin: User = Depends(require_admin),
):
    data = _read_json(UNIVERSITIES_FILE)
    for i, item in enumerate(data):
        if item["id"] == item_id:
            updates = body.model_dump(exclude_unset=True)
            data[i] = {
                **item,
                **updates,
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "updatedBy": admin.name or admin.email,
            }
            _write_json(UNIVERSITIES_FILE, data)
            return data[i]
    raise HTTPException(404, "University not found")


@router.delete("/universities/{item_id}", status_code=204)
async def delete_university(
    item_id: str,
    admin: User = Depends(require_admin),
):
    data = _read_json(UNIVERSITIES_FILE)
    new_data = [item for item in data if item["id"] != item_id]
    if len(new_data) == len(data):
        raise HTTPException(404, "University not found")
    _write_json(UNIVERSITIES_FILE, new_data)
