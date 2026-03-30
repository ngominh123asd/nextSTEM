/**
 * Gemini AI client — calls backend proxy endpoint /api/v1/gemini/stream
 * Used by: Academic Editor, Roadmap, AI Study Coach Widget
 * Does NOT affect AI Advisor which uses the old AI service.
 */

import { getToken } from './api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

export function streamGemini(
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  options?: { systemInstruction?: string },
): { abort: () => void } {
  const controller = new AbortController();
  const token = getToken();

  fetch(`${API_BASE}/gemini/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      system_instruction: options?.systemInstruction || null,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Gemini request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) { currentEvent = ''; continue; }

          if (trimmed.startsWith('event: ')) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              if (currentEvent === 'text_delta' && parsed.delta) {
                onChunk(parsed.delta);
              } else if (currentEvent === 'error') {
                onError(new Error(parsed.error || 'Gemini error'));
                return;
              }
            } catch {
              // Non-JSON line — treat as raw text
              if (currentEvent === 'text_delta') {
                onChunk(jsonStr);
              }
            }
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return { abort: () => controller.abort() };
}
