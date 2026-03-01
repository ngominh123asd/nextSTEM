# 🚀 Deployment Guide — nextSTEM

| Layer     | Service    | URL                              |
| --------- | ---------- | -------------------------------- |
| Frontend  | **Vercel** | `https://your-app.vercel.app`    |
| Backend   | **Railway**| `https://your-api.up.railway.app`|
| Database  | **Supabase** | Supabase Dashboard             |
| Cache     | **Upstash**  | Upstash Console                |

---

## 1. Supabase — PostgreSQL Database

### 1.1 Create project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to your Railway deployment (e.g., `ap-southeast-1` for Asia)
3. Set a strong database password — **save it securely**

### 1.2 Enable pgvector
Run this in the **SQL Editor** (Supabase Dashboard → SQL Editor):

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.3 Get Connection String
1. Go to **Settings → Database → Connection String → URI**
2. Copy the **Transaction** pooler connection string (port `6543`)
3. Replace `postgres://` prefix with `postgresql+asyncpg://`
4. Remove `?sslmode=...` from the URL (SSL is handled in code)

**Format:**
```
postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> **Note:** For running Alembic migrations locally, use the **Session** pooler (port `5432`) instead.

---

## 2. Upstash — Redis Cache

### 2.1 Create database
1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Choose the same region as Railway
3. Select **TLS** enabled (default)

### 2.2 Get Connection URL
1. Go to **Database → Details**
2. Copy the `rediss://` URL (with double `s` for TLS)

**Format:**
```
rediss://default:[password]@[endpoint].upstash.io:6379
```

---

## 3. Railway — Backend API

### 3.1 Create project
1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Select your repository
3. Set **Root Directory** to `backend` (important!)

### 3.2 Set Environment Variables
In Railway Dashboard → **Variables**, add:

| Variable | Value |
| -------- | ----- |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | `postgresql+asyncpg://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `REDIS_URL` | `rediss://default:[pw]@[endpoint].upstash.io:6379` |
| `SECRET_KEY` | *(generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`)* |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` |

> **Do NOT set `PORT`** — Railway injects it automatically.

### 3.3 Deploy
Railway will auto-detect the `Dockerfile` and `railway.json`:
- Builds using Docker
- Runs `alembic upgrade head` before starting the server (configured in `railway.json`)
- Health check at `/health`

### 3.4 Get the public URL
1. Go to **Settings → Networking → Generate Domain**
2. Copy the URL: `https://your-api.up.railway.app`
3. You'll use this for the Vercel `VITE_API_URL` variable

---

## 4. Vercel — Frontend

### 4.1 Import project
1. Go to [vercel.com](https://vercel.com) → **Add New → Project → Import Git Repository**
2. Select your repository
3. Framework Preset: **Vite** (auto-detected from `vercel.json`)

### 4.2 Set Environment Variables
In Vercel Dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Environment |
| -------- | ----- | ----------- |
| `VITE_API_URL` | `https://your-api.up.railway.app` | Production |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Production |

> For Preview deployments, you can set `VITE_API_URL` to a staging Railway URL.

### 4.3 Deploy
Vercel auto-detects `vercel.json` and runs:
```bash
npm run build   # → vite build → dist/
```

SPA routing is handled by the rewrite rule in `vercel.json`.

---

## 5. Post-Deploy Checklist

- [ ] **Backend health**: Visit `https://your-api.up.railway.app/health` → should return `{"status": "ok"}`
- [ ] **Database**: Check Supabase → Table Editor → tables are created by Alembic
- [ ] **Redis**: Check Upstash Console → your DB shows connection activity
- [ ] **Frontend**: Visit `https://your-app.vercel.app` → app loads correctly
- [ ] **Auth flow**: Register/login works end-to-end
- [ ] **CORS**: No cross-origin errors in browser console

---

## 6. Running Migrations

### On Railway (automatic)
Migrations run automatically on every deploy via `railway.json`:
```
alembic upgrade head && uvicorn app.main:app ...
```

### Locally against Supabase
```bash
cd backend
# Use Session pooler (port 5432) for migrations
DATABASE_URL="postgresql+asyncpg://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres" \
  alembic upgrade head
```

### Create a new migration
```bash
cd backend
alembic revision --autogenerate -m "description_of_change"
```

---

## 7. Architecture Diagram

```
┌──────────────┐     HTTPS      ┌──────────────┐
│              │ ◄────────────► │              │
│   Vercel     │   VITE_API_URL │   Railway    │
│  (Frontend)  │                │  (Backend)   │
│              │                │              │
└──────────────┘                └──────┬───┬───┘
                                       │   │
                            DATABASE_URL│   │REDIS_URL
                                       │   │
                                ┌──────▼┐ ┌▼───────┐
                                │Supabase│ │Upstash │
                                │(Postgres)│ │(Redis) │
                                └────────┘ └────────┘
```

---

## 8. Troubleshooting

### "Connection refused" on Railway
- Check Railway logs for startup errors
- Verify `DATABASE_URL` is correct (must use `postgresql+asyncpg://` prefix)
- Ensure Supabase project is not paused (free tier pauses after inactivity)

### CORS errors in browser
- Verify `CORS_ORIGINS` on Railway includes your exact Vercel domain
- Include protocol: `https://your-app.vercel.app` (no trailing slash)

### Redis connection errors
- Ensure `REDIS_URL` starts with `rediss://` (double `s` for TLS)
- Check Upstash Console → the database is in the same region as Railway

### Alembic migration fails
- Check Railway build logs for the migration error
- For "relation already exists" errors, mark the migration as applied:  
  `alembic stamp head`
- For Supabase, ensure `pgvector` extension is enabled

### Supabase SSL errors
- The app uses SSL context automatically in production (`ENVIRONMENT=production`)
- Do NOT add `?sslmode=require` to the DATABASE_URL — it conflicts with asyncpg's SSL handling
