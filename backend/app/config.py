"""Application settings loaded from environment / .env file."""

from __future__ import annotations

import json as _json
import re as _re

from pydantic import field_validator, SecretStr
from pydantic_settings import BaseSettings


_DEFAULT_CORS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://nextstemvietnam.vercel.app",
]

# Regex that catches all common postgres URL prefixes that are NOT asyncpg
_PG_PREFIX_RE = _re.compile(r"^(?:postgres|postgresql(?:\+psycopg2(?:binary)?)?)://")


def _normalize_pg_url(url: str) -> str:
    """Rewrite any postgres:// variant to postgresql+asyncpg://."""
    return _PG_PREFIX_RE.sub("postgresql+asyncpg://", url, count=1)


class Settings(BaseSettings):
    # ── Environment ──────────────────────────────────────────
    ENVIRONMENT: str = "development"  # development | production

    # ── Postgres (Supabase) ─────────────────────────────────
    # REQUIRED — set via env var or .env file
    # Auto-normalized to postgresql+asyncpg:// at startup.
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalize_database_url(cls, v: str) -> str:
        return _normalize_pg_url(v)

    @property
    def async_database_url(self) -> str:
        """Alias kept for backward compatibility — DATABASE_URL is already normalized."""
        return self.DATABASE_URL

    # ── Redis (Upstash in production, local in dev) ─────────
    # Upstash: rediss://default:[pw]@[endpoint].upstash.io:6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────────────
    # REQUIRED — generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    SECRET_KEY: SecretStr
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # ── AI Service (external) ──────────────────────────────
    AI_SERVICE_URL: str = "https://nextstem-production.up.railway.app"
    AI_API_KEY: str = ""  # leave empty if AI service has no key requirement

    # ── Gemini (Google AI) ────────────────────────────────
    # Used for Academic Editor, Roadmap, and AI Study Coach Widget
    GEMINI_API_KEY: SecretStr = ""

    # ── External AI Tools ─────────────────────────────
    # OpenAlex (free, no key needed but recommended for higher rate limits)
    OPENALEX_MAILTO: str = ""
    # Tavily Search API (optional - for enhanced search results)
    TAVILY_API_KEY: SecretStr = ""
    # Wikidata User-Agent (required for Wikidata SPARQL queries)
    WIKIDATA_USER_AGENT: str = "nextSTEM/1.0 (study abroad assistant)"
    # College Scorecard API (optional - for US university details)
    COLLEGESCORECARD_API_KEY: SecretStr = ""
    # O*NET credentials (optional)
    ONET_USERNAME: str = ""
    ONET_PASSWORD: str = ""
    # ESCO language (optional)
    ESCO_LANGUAGE: str = "en"

    # ── OAuth ────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""

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
