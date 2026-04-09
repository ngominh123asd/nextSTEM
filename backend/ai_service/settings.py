"""Settings for AI service.

Keep the AI service deployable as a separate server while reusing the same
repository.
"""

from pydantic_settings import BaseSettings


class AISettings(BaseSettings):
    # Optional API key for service-to-service auth
    # If empty, auth is disabled.
    AI_API_KEY: str = ""

    # Memory / vector store
    MEM0_SUPABASE_CONNECTION_STRING: str = ""

    # Google AI
    GOOGLE_API_KEY: str = ""

    # CORS (if AI API is called from browsers; if only backend calls it, keep empty)
    AI_CORS_ORIGINS: list[str] = []

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


ai_settings = AISettings()

