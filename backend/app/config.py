"""Application settings loaded from environment / .env file."""

from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Environment ──────────────────────────────────────────
    ENVIRONMENT: str = "development"  # development | production

    # ── Postgres (Supabase) ─────────────────────────────────
    # REQUIRED — set via env var or .env file
    # Supabase: postgresql+asyncpg://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres
    DATABASE_URL: str

    # ── Redis (Upstash in production, local in dev) ─────────
    # Upstash: rediss://default:[pw]@[endpoint].upstash.io:6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────────────
    # REQUIRED — generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # ── CORS ─────────────────────────────────────────────────
    # Accepts a JSON array string or a comma-separated list
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v: str | list[str]) -> list[str]:
        """Allow comma-separated string in addition to JSON array."""
        if isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Railway injects PORT automatically
    PORT: int = 8000

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
