"""Embedding & semantic search endpoints (pgvector + HNSW)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.embedding import ChunkRead, EmbedRequest, SemanticSearchRequest
from app.services import embedding_service

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("/store", response_model=ChunkRead, status_code=201)
async def store_embedding(
    body: EmbedRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Embed a text chunk and store it for later retrieval."""
    chunk = await embedding_service.embed_and_store(
        db,
        user.id,
        body.content,
        document_id=body.document_id,
        source_type=body.source_type,
    )
    return chunk


@router.post("/search", response_model=list[ChunkRead])
async def search_embeddings(
    body: SemanticSearchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Semantic search across stored chunks using HNSW-accelerated cosine similarity."""
    results = await embedding_service.semantic_search(
        db, user.id, body.query, top_k=body.top_k
    )
    return results


@router.delete("/document/{document_id}")
async def delete_document_chunks(
    document_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove all embedding chunks linked to a specific document."""
    import uuid as _uuid
    try:
        doc_uuid = _uuid.UUID(document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID")

    count = await embedding_service.delete_chunks_for_document(db, doc_uuid, user.id)
    return {"deleted": count}
