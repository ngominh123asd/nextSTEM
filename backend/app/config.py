"""Application settings loaded from environment / .env file."""

from __future__ import annotations

import json as _json

from pydantic_settings import BaseSettings


_DEFAULT_CORS = ["http://localhost:5173", "http://localhost:3000"]


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

    # ── AI Service (external) ──────────────────────────────
    AI_SERVICE_URL: str = "https://nextstem-production.up.railway.app"
    AI_API_KEY: str = ""  # leave empty if AI service has no key requirement

    # ── CORS ─────────────────────────────────────────────────
    # Stored as raw string to avoid pydantic-settings JSON parsing issues.
    # Accepts: JSON array string, comma-separated URLs, or a single URL.
    # Examples: '["https://a.com","https://b.com"]'  or  'https://a.com,https://b.com'
    CORS_ORIGINS: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS env var into a list of origin strings."""
        v = self.CORS_ORIGINS
        if not v or not v.strip():
            return _DEFAULT_CORS
        v = v.strip()
        # Try JSON array first
        try:
            parsed = _json.loads(v)
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except (_json.JSONDecodeError, TypeError):
            pass
        # Fall back to comma-separated
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    # Railway injects PORT automatically
    PORT: int = 8000

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
