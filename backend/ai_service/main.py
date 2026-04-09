"""FastAPI application for the AI service.

Run locally:
  uvicorn ai_service.main:app --reload --port 8001
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai_service.api import router as ai_router
from ai_service.settings import ai_settings


app = FastAPI(
    title="nextSTEM AI API",
    version="0.1.0",
    description="Standalone AI service (agentic + SSE).",
)


if ai_settings.AI_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ai_settings.AI_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(ai_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}

