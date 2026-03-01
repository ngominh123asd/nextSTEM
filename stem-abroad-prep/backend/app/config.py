"""Application settings loaded from environment / .env file."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Postgres (Supabase) ─────────────────────────────────
    # REQUIRED — set via env var or .env file
    # Example: postgresql+asyncpg://user:pass@host:5432/db?ssl=require
    DATABASE_URL: str

    # ── Redis (Upstash in production, local in dev) ─────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────────────
    # REQUIRED — generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # ── CORS ─────────────────────────────────────────────────
    # Add your Vercel production domain here or via CORS_ORIGINS env var
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Railway injects PORT automatically
    PORT: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
