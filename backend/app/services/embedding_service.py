"""Embedding service — generate embeddings & run HNSW-powered similarity search.

Uses the nextSTEM AI service for embedding generation and pgvector HNSW
index for fast approximate nearest-neighbor retrieval.
"""

from __future__ import annotations

import logging
import uuid

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.embedding import DocumentChunk

logger = logging.getLogger(__name__)

# ── Embedding generation ────────────────────────────────────

_TIMEOUT = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)


def _ai_headers() -> dict[str, str]:
    """Build request headers for the AI service."""
    h: dict[str, str] = {"Content-Type": "application/json"}
    if settings.AI_API_KEY:
        h["X-API-Key"] = settings.AI_API_KEY
    return h


async def _generate_embedding(text_input: str) -> list[float]:
    """Call the AI service to get the embedding vector for a text string.

    Sends a POST to {AI_SERVICE_URL}/api/v1/ai/embed.
    Expected response: { "embedding": [float, ...] }
    """
    url = f"{settings.AI_SERVICE_URL.rstrip('/')}/api/v1/ai/embed"
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            url,
            headers=_ai_headers(),
            json={"text": text_input},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["embedding"]


# ── Store chunk with embedding ──────────────────────────────

async def embed_and_store(
    db: AsyncSession,
    user_id: uuid.UUID,
    content: str,
    *,
    document_id: uuid.UUID | None = None,
    source_type: str = "document",
) -> DocumentChunk:
    """Generate an embedding for `content` and store it in the database."""
    vector = await _generate_embedding(content)

    chunk = DocumentChunk(
        user_id=user_id,
        document_id=document_id,
        source_type=source_type,
        content=content,
        embedding=vector,
    )
    db.add(chunk)
    await db.flush()
    return chunk


# ── Similarity search (HNSW-accelerated) ────────────────────

async def semantic_search(
    db: AsyncSession,
    user_id: uuid.UUID,
    query: str,
    *,
    top_k: int = 5,
) -> list[dict]:
    """Find the most relevant chunks for a query using cosine similarity.

    The HNSW index on the embedding column makes this an approximate
    nearest-neighbor search — extremely fast even with millions of rows.

    You can tune accuracy vs speed at query time with:
        SET hnsw.ef_search = 100;  (default 40, higher = more accurate)
    """
    query_vector = await _generate_embedding(query)

    # pgvector cosine distance operator: <=>
    # Lower distance = more similar.  Score = 1 - distance.
    sql = text("""
        SELECT id, document_id, source_type, content, created_at,
               1 - (embedding <=> :query_vec::vector) AS score
        FROM document_chunks
        WHERE user_id = :uid
        ORDER BY embedding <=> :query_vec::vector
        LIMIT :k
    """)

    result = await db.execute(
        sql,
        {
            "query_vec": str(query_vector),
            "uid": str(user_id),
            "k": top_k,
        },
    )

    rows = result.fetchall()
    return [
        {
            "id": row.id,
            "document_id": row.document_id,
            "source_type": row.source_type,
            "content": row.content,
            "score": float(row.score),
            "created_at": row.created_at,
        }
        for row in rows
    ]


# ── Delete chunks for a document ────────────────────────────

async def delete_chunks_for_document(
    db: AsyncSession,
    document_id: uuid.UUID,
    user_id: uuid.UUID,
) -> int:
    """Remove all embedding chunks linked to a document. Returns count deleted."""
    sql = text("""
        DELETE FROM document_chunks
        WHERE document_id = :doc_id AND user_id = :uid
    """)
    result = await db.execute(sql, {"doc_id": str(document_id), "uid": str(user_id)})
    return result.rowcount