# nextSTEM Backend

FastAPI + Async SQLAlchemy + PostgreSQL (pgvector) + Redis

## Quick Start

```bash
# 1. Start services
docker compose up -d

# 2. Run migrations
docker compose exec api alembic revision --autogenerate -m "init"
docker compose exec api alembic upgrade head

# 3. API docs
open http://localhost:8000/docs
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |
| PUT | `/api/v1/users/me` | Update profile |
| POST | `/api/v1/users/me/onboarding` | Complete onboarding |
| GET/PUT | `/api/v1/users/me/preferences` | Preferences |
| GET/POST | `/api/v1/chat/sessions` | Chat sessions |
| GET/DEL | `/api/v1/chat/sessions/{id}` | Session detail |
| POST | `/api/v1/chat/sessions/{id}/messages` | Send message |
| GET/POST | `/api/v1/portfolio/projects` | Projects |
| GET/POST | `/api/v1/portfolio/certificates` | Certificates |
| GET | `/api/v1/portfolio/activities` | Activities |
| GET | `/api/v1/roadmap` | Get roadmap |
| POST | `/api/v1/roadmap/generate` | Generate roadmap |
| PATCH | `/api/v1/roadmap/tasks/{id}` | Toggle task |
| GET/POST | `/api/v1/documents` | Documents |
| GET/PUT/DEL | `/api/v1/documents/{id}` | Document CRUD |
| GET | `/api/v1/resources/scholarships` | Scholarships |
| GET | `/api/v1/resources/universities` | Universities |
| GET | `/api/v1/tools` | Tool definitions |

## Project Structure

```
backend/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
└── app/
    ├── main.py          # FastAPI app
    ├── config.py         # Settings
    ├── database.py       # Async SQLAlchemy
    ├── redis.py          # Redis connection
    ├── deps.py           # Dependencies (auth)
    ├── models/           # ORM models
    ├── schemas/          # Pydantic schemas
    ├── api/              # Route handlers
    ├── services/         # Business logic
    └── utils/            # Security, session
```
