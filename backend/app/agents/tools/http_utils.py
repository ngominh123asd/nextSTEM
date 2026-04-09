"""Shared async HTTP utilities for agent tools.

Design goals:
- Strict timeouts to protect agent latency.
- Small in-memory TTL cache to reduce rate-limit pressure.
- Safe defaults that degrade gracefully (return None on errors).
"""

from __future__ import annotations

import asyncio
import json
import time
from contextvars import ContextVar
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass
class TTLCacheItem:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self, max_items: int = 256):
        self._max_items = max_items
        self._store: dict[str, TTLCacheItem] = {}

    def get(self, key: str) -> Any | None:
        item = self._store.get(key)
        if not item:
            return None
        if item.expires_at < time.time():
            self._store.pop(key, None)
            return None
        return item.value

    def set(self, key: str, value: Any, ttl_seconds: float) -> None:
        if len(self._store) >= self._max_items:
            # naive eviction: remove oldest expiry
            oldest_key = min(self._store.items(), key=lambda kv: kv[1].expires_at)[0]
            self._store.pop(oldest_key, None)
        self._store[key] = TTLCacheItem(value=value, expires_at=time.time() + ttl_seconds)


_cache = TTLCache(max_items=512)
_request_trace: ContextVar[list[dict[str, Any]] | None] = ContextVar(
    "agent_tool_request_trace",
    default=None,
)


def _cache_key(method: str, url: str, params: dict[str, Any] | None, json_body: Any | None) -> str:
    p = json.dumps(params or {}, sort_keys=True, ensure_ascii=True)
    b = json.dumps(json_body, sort_keys=True, ensure_ascii=True) if json_body is not None else ""
    return f"{method.upper()} {url} params={p} json={b}"


def begin_request_trace():
    """Begin collecting outbound request URLs in this async context."""
    return _request_trace.set([])


def end_request_trace(token) -> list[dict[str, Any]]:
    """Stop collecting outbound request URLs and return de-duplicated trace rows."""
    rows = _request_trace.get() or []
    _request_trace.reset(token)

    dedup: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in rows:
        method = str(row.get("method") or "GET").upper()
        url = str(row.get("url") or "")
        key = f"{method} {url}"
        if not url or key in seen:
            continue
        seen.add(key)
        dedup.append(
            {
                "method": method,
                "url": url,
                "from_cache": bool(row.get("from_cache", False)),
            }
        )
    return dedup


def _build_raw_url(url: str, params: dict[str, Any] | None) -> str:
    try:
        if params:
            return str(httpx.URL(url).copy_merge_params(params))
        return str(httpx.URL(url))
    except Exception:
        return url


def _record_request(
    method: str,
    url: str,
    params: dict[str, Any] | None,
    *,
    from_cache: bool = False,
) -> None:
    rows = _request_trace.get()
    if rows is None:
        return
    rows.append(
        {
            "method": method.upper(),
            "url": _build_raw_url(url, params),
            "from_cache": from_cache,
        }
    )


async def fetch_json(
    url: str,
    *,
    method: str = "GET",
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
    headers: dict[str, str] | None = None,
    timeout_seconds: float = 10.0,
    cache_ttl_seconds: float | None = 300.0,
) -> Any | None:
    """Fetch JSON and return parsed object, or None on error."""
    _record_request(method, url, params, from_cache=False)

    key = None
    if cache_ttl_seconds and cache_ttl_seconds > 0:
        key = _cache_key(method, url, params, json_body)
        cached = _cache.get(key)
        if cached is not None:
            _record_request(method, url, params, from_cache=True)
            return cached

    try:
        timeout = httpx.Timeout(timeout_seconds, connect=5.0)
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.request(
                method=method.upper(),
                url=url,
                params=params,
                json=json_body,
                headers=headers,
            )
            if resp.status_code >= 400:
                return None
            data = resp.json()
            if key:
                _cache.set(key, data, cache_ttl_seconds)
            return data
    except (httpx.HTTPError, json.JSONDecodeError, asyncio.TimeoutError):
        return None


async def fetch_text(
    url: str,
    *,
    method: str = "GET",
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout_seconds: float = 10.0,
    cache_ttl_seconds: float | None = 300.0,
) -> str | None:
    """Fetch text and return body, or None on error."""
    _record_request(method, url, params, from_cache=False)

    key = None
    if cache_ttl_seconds and cache_ttl_seconds > 0:
        key = _cache_key(method, url, params, None)
        cached = _cache.get(key)
        if isinstance(cached, str):
            _record_request(method, url, params, from_cache=True)
            return cached

    try:
        timeout = httpx.Timeout(timeout_seconds, connect=5.0)
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.request(
                method=method.upper(),
                url=url,
                params=params,
                headers=headers,
            )
            if resp.status_code >= 400:
                return None
            text = resp.text
            if key:
                _cache.set(key, text, cache_ttl_seconds)
            return text
    except (httpx.HTTPError, asyncio.TimeoutError):
        return None
