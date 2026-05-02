"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.redis import init_redis, close_redis
from app.api import (
    auth,
    users,
    chat,
    portfolio,
    roadmap,
    documents,
    resources,
    tools,
    admin,
    embeddings,
    gemini,
    university,
    career,
    scholarship,
)
from app.api import competencies as competencies_api
from app.api import dts as dts_api
from app.api.admin_resources import router as admin_resources_router
from app.api.data_exchange import router as export_router, import_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    logger.info("Starting up — ENVIRONMENT=%s", settings.ENVIRONMENT)
    logger.info("CORS origins: %s", settings.cors_origins_list)
    await init_redis()

    # Auto-seed STEM competency framework if not present
    try:
        from app.database import async_session
        from app.services import competency_service

        async with async_session() as db:
            await competency_service.seed_default_framework(db)
            await db.commit()
            logger.info("STEM framework seed check complete")
    except Exception as e:
        logger.warning("Could not seed STEM framework: %s", e)

    logger.info("Startup complete")
    yield
    await close_redis()


app = FastAPI(
    title="nextSTEM API",
    version="0.1.0",
    description="Backend for nextSTEM — AI Study Coach platform",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Rate limiter (for OAuth endpoints)
from app.api.auth import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(roadmap.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(tools.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(admin_resources_router, prefix="/api/v1")
app.include_router(embeddings.router, prefix="/api/v1")
print("INCLUDING GEMINI ROUTER, ROUTES=", gemini.router.routes)
app.include_router(gemini.router, prefix="/api/v1")
app.include_router(competencies_api.router, prefix="/api/v1")
app.include_router(dts_api.router, prefix="/api/v1")
app.include_router(export_router, prefix="/api/v1")
app.include_router(import_router, prefix="/api/v1")
app.include_router(university.router, prefix="/api/v1")
app.include_router(career.router, prefix="/api/v1")
app.include_router(scholarship.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
