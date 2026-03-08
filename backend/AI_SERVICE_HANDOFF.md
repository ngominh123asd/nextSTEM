# nextSTEM AI Service - Integration Handoff

Tai lieu nay de gui cho team Backend/Frontend de tich hop nhanh voi AI service da deploy.

## 1) Deployment URL

- Base URL: `https://nextstem-production.up.railway.app`
- Health:
  - `GET /health`
  - `GET /api/v1/ai/health`

## 2) OpenAPI contract

- OpenAPI file (repo): `backend/ai_service/openapi.yaml`

Contract quan trong:
- `POST /api/v1/ai/run` (JSON non-stream)
- `POST /api/v1/ai/run/stream` (SSE: `text/event-stream`)

Request body chuan:
- `message` (required)
- `workflow` (default: `advisor_chat`)
- `session_id` (optional, khuyen nghi truyen de giu context)
- `user_id` (optional, khuyen nghi truyen de trace/scoping)

## 3) Auth between services

Header su dung:
- `X-API-Key: <AI_API_KEY>` (chi khi service da set bien `AI_API_KEY`)

Rule:
- Neu `AI_API_KEY` rong -> service khong bat buoc key
- Neu `AI_API_KEY` co gia tri -> thieu/sai key se `401 Invalid API key`

## 4) Trien khai khuyen nghi cho kien truc hien tai

- Khong de Frontend goi truc tiep AI service neu dang bat `AI_API_KEY`.
- Luong an toan: `Frontend -> Core Backend -> AI Service`.
- Core Backend giu secret `AI_API_KEY`; Frontend khong duoc biet secret nay.

## 5) SSE events can ho tro o FE

Can parse duoc cac event:
- `start`
- `query_classified`
- `planning`
- `plan_created`
- `executing`
- `agents_completed`
- `agent_start`
- `agent_stage`
- `agent_stage_result`
- `tool_call`
- `tool_result`
- `agent_completed`
- `agent_error`
- `synthesizing`
- `text_delta`
- `completed`
- `error`
- `final_result`
- `done`

Khuyen nghi UI:
- Render text realtime theo `text_delta`
- Dong stream khi gap `done`
- Chot ket qua theo `final_result`
- Unknown events: bo qua (de backward-compatible)

## 6) cURL test nhanh

### Health

```bash
curl https://nextstem-production.up.railway.app/health
curl https://nextstem-production.up.railway.app/api/v1/ai/health
```

### Non-stream

```bash
curl -X POST "https://nextstem-production.up.railway.app/api/v1/ai/run" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <AI_API_KEY_if_enabled>" \
  --data-binary "{\"message\":\"Xin tu van du hoc nganh CS tai Singapore\",\"workflow\":\"advisor_chat\",\"session_id\":\"sess-001\",\"user_id\":\"user-123\"}"
```

### Stream

```bash
curl -N -X POST "https://nextstem-production.up.railway.app/api/v1/ai/run/stream" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <AI_API_KEY_if_enabled>" \
  --data-binary "{\"message\":\"Xin tu van du hoc nganh CS tai Singapore\",\"workflow\":\"advisor_chat\",\"session_id\":\"sess-001\",\"user_id\":\"user-123\"}"
```

## 7) Prompt template cho AI coding agent cua team

Copy/paste doan duoi cho coding agent:

```text
Integrate our core backend with this external AI service:
- Base URL: https://nextstem-production.up.railway.app
- Source OpenAPI: backend/ai_service/openapi.yaml
- Implement backend client for:
  1) POST /api/v1/ai/run
  2) POST /api/v1/ai/run/stream (SSE)
- Forward fields: message, workflow=advisor_chat, session_id, user_id
- Add header X-API-Key from backend env AI_API_KEY
- Never expose AI_API_KEY to frontend
- For SSE: handle text_delta, final_result, done, error; ignore unknown events
- Add timeout/retry and structured logs (request_id/session_id/user_id/latency)
```

## 8) Nguon tham chieu trong repo

- OpenAPI: `backend/ai_service/openapi.yaml`
- Deployment guide: `backend/ai_service/DEPLOY_RAILWAY.md`
- Runtime app: `backend/ai_service/main.py`
- AI routes: `backend/ai_service/api.py`
