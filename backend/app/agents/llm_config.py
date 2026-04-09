"""LLM Configuration — Cấu hình models cho hệ thống agent.

Tập trung quản lý tất cả model configs, cho phép dễ dàng
switch model hoặc thay đổi parameters.
"""

from dataclasses import dataclass, field
from enum import Enum

from app.config import settings


class ModelTier(str, Enum):
    """Tầng model — tối ưu chi phí vs chất lượng."""

    FAST = "fast"  # Routing, classification (rẻ, nhanh)
    BALANCED = "balanced"  # SubAgent reasoning (cân bằng)
    POWERFUL = "powerful"  # Synthesis, complex reasoning (chất lượng cao)


@dataclass
class ModelConfig:
    """Cấu hình cho 1 model."""

    model_name: str
    temperature: float = 0.7
    max_output_tokens: int = 8192
    top_p: float = 0.95
    top_k: int = 40
    tier: ModelTier = ModelTier.BALANCED


# ─────────────────────────── Model Definitions ───────────────────────────

# Fast tier: dùng cho classify, routing, plan (nhanh, tiết kiệm)
FAST_MODEL = ModelConfig(
    model_name="gemini-2.0-flash",
    temperature=0.1,
    max_output_tokens=2048,
    tier=ModelTier.FAST,
)

# Balanced tier: dùng cho SubAgent reasoning
BALANCED_MODEL = ModelConfig(
    model_name="gemini-2.5-flash",
    temperature=0.7,
    max_output_tokens=8192,
    tier=ModelTier.BALANCED,
)

# Powerful tier: dùng cho synthesis, complex analysis
POWERFUL_MODEL = ModelConfig(
    model_name="gemini-2.5-pro",
    temperature=0.7,
    max_output_tokens=16384,
    tier=ModelTier.POWERFUL,
)


# ─────────────────────────── Role → Model Mapping ───────────────────────────


@dataclass
class AgentModelMapping:
    """Mapping vai trò agent → model config."""

    orchestrator_classify: ModelConfig = field(default_factory=lambda: FAST_MODEL)
    orchestrator_plan: ModelConfig = field(default_factory=lambda: FAST_MODEL)
    orchestrator_synthesize: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)
    orchestrator_direct: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)

    advisor: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)
    stem_coach: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)
    scoring: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)
    counselor: ModelConfig = field(default_factory=lambda: BALANCED_MODEL)

    critic: ModelConfig = field(default_factory=lambda: FAST_MODEL)


# Global mapping — import này ở các file khác
MODEL_MAPPING = AgentModelMapping()


def get_model_for_role(role: str) -> ModelConfig:
    """Lấy model config cho 1 vai trò cụ thể."""
    return getattr(MODEL_MAPPING, role, BALANCED_MODEL)


def get_api_key() -> str:
    """Lấy Google API key từ settings."""
    return settings.GOOGLE_API_KEY
