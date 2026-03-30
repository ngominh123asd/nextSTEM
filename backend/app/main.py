"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.redis import init_redis, close_redis
from app.api import auth, users, chat, portfolio, roadmap, documents, resources, tools, admin, embeddings, gemini
from app.api.admin_resources import router as admin_resources_router
from app.api.data_exchange import router as export_router, import_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    logger.info("Starting up — ENVIRONMENT=%s", settings.ENVIRONMENT)
    logger.info("CORS origins: %s", settings.cors_origins_list)
    await init_redis()
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

# Register routers
app.include_router(auth.router,      prefix="/api/v1")
app.include_router(users.router,     prefix="/api/v1")
app.include_router(chat.router,      prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(roadmap.router,   prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(tools.router,     prefix="/api/v1")
app.include_router(admin.router,     prefix="/api/v1")
app.include_router(admin_resources_router, prefix="/api/v1")
app.include_router(embeddings.router, prefix="/api/v1")
print("INCLUDING GEMINI ROUTER, ROUTES=", gemini.router.routes)
app.include_router(gemini.router,     prefix="/api/v1")
app.include_router(export_router,    prefix="/api/v1")
app.include_router(import_router,    prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}