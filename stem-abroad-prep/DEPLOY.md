# 🚀 Deployment Guide — nextSTEM

> **Stack**: Vercel (FE) + Railway (BE) + Supabase (DB) + Upstash (Redis)

---

## 📋 Prerequisites

- [GitHub](https://github.com) repo chứa source code
- Tài khoản trên: [Vercel](https://vercel.com), [Railway](https://railway.app), [Supabase](https://supabase.com), [Upstash](https://upstash.com)

---

## 1️⃣ Supabase — PostgreSQL Database

1. Truy cập [supabase.com](https://supabase.com) → **New Project**
2. Chọn region gần nhất (vd: `ap-south-1`)
3. Đặt database password (lưu lại!)
4. Sau khi tạo xong, vào **Settings → Database → Connection string → URI**
5. Copy connection string dạng:
   ```
   postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?ssl=require
   ```
   > ⚠️ Thay `postgres://` bằng `postgresql+asyncpg://` (SQLAlchemy async driver)

   > ⚠️ Dùng port `6543` (Transaction pooler) cho app, port `5432` (Direct) cho migration nếu cần

---

## 2️⃣ Upstash — Redis Cache

1. Truy cập [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Chọn region gần Supabase
3. Chọn **TLS** enabled
4. Sau khi tạo, vào tab **Details** → copy **Endpoint** dạng:
   ```
   rediss://default:[password]@[endpoint].upstash.io:6379
   ```
   > ✅ `rediss://` (double s) = TLS connection

---

## 3️⃣ Railway — Backend (FastAPI)

### 3.1 Tạo project

1. Truy cập [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Chọn repo, đặt **Root Directory** = `stem-abroad-prep/backend`
3. Railway sẽ tự detect `Dockerfile` và build

### 3.2 Cấu hình Environment Variables

Trong Railway Dashboard → Service → **Variables**, thêm:

| Variable | Value | Ghi chú |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Connection string từ Supabase |
| `REDIS_URL` | `rediss://default:...` | URL từ Upstash |
| `SECRET_KEY` | Random 32+ chars | `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `CORS_ORIGINS` | `["https://your-app.vercel.app"]` | Domain Vercel của bạn |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Tuỳ chỉnh |

> ℹ️ `PORT` được Railway tự inject, **không cần set thủ công**.

### 3.3 Chạy Database Migration

Sau khi deploy thành công:

1. Trong Railway → Service → **Settings → Shell**, mở terminal
2. Chạy:
   ```bash
   cd /code
   alembic upgrade head
   ```

### 3.4 Kiểm tra

- Truy cập `https://your-backend.up.railway.app/health` → phải trả về `{"status": "ok"}`
- Truy cập `https://your-backend.up.railway.app/docs` → Swagger UI

---

## 4️⃣ Vercel — Frontend (Vite + React)

### 4.1 Tạo project

1. Truy cập [vercel.com](https://vercel.com) → **Add New → Project → Import Git Repository**
2. Chọn repo, đặt:
   - **Framework Preset**: Vite
   - **Root Directory**: `stem-abroad-prep`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.2 Cấu hình Environment Variables

Trong Vercel Dashboard → Project → **Settings → Environment Variables**, thêm:

| Variable | Value | Ghi chú |
|---|---|---|
| `VITE_API_URL` | `https://your-backend.up.railway.app` | URL Railway backend (không có `/` cuối) |
| `GEMINI_API_KEY` | API key | Nếu dùng AI features |

> ⚠️ Vite chỉ expose biến có prefix `VITE_` cho client-side code.

### 4.3 Kiểm tra

- Truy cập domain Vercel → app phải load bình thường
- Test đăng nhập/đăng ký → gọi API đúng backend URL

---

## 5️⃣ Post-Deploy — Cập nhật CORS

Sau khi có domain Vercel chính thức (vd: `https://nextstem.vercel.app`):

1. Vào **Railway** → Variables → cập nhật `CORS_ORIGINS`:
   ```json
   ["https://nextstem.vercel.app","https://custom-domain.com"]
   ```
2. Railway sẽ tự redeploy

---

## 🏗️ Architecture

```
┌─────────────┐     HTTPS      ┌──────────────┐
│   Vercel     │ ──────────────▶│   Railway     │
│  (Frontend)  │    API calls   │  (Backend)    │
│  Vite+React  │                │  FastAPI      │
└─────────────┘                └──────┬───┬────┘
                                      │   │
                            ┌─────────┘   └─────────┐
                            ▼                         ▼
                    ┌──────────────┐         ┌──────────────┐
                    │  Supabase    │         │   Upstash     │
                    │  PostgreSQL  │         │   Redis       │
                    └──────────────┘         └──────────────┘
```

---

## 🔧 Troubleshooting

| Vấn đề | Giải pháp |
|---|---|
| CORS error | Kiểm tra `CORS_ORIGINS` trên Railway có chứa domain Vercel |
| `502 Bad Gateway` | Check Railway logs, có thể thiếu env var |
| DB connection fail | Kiểm tra `DATABASE_URL` format, phải dùng `postgresql+asyncpg://` |
| Redis connection fail | Kiểm tra dùng `rediss://` (TLS) cho Upstash |
| Frontend hiển thị nhưng API fail | Kiểm tra `VITE_API_URL` trên Vercel đúng URL Railway |
| Migration fail | Chạy trực tiếp trên Railway shell, kiểm tra `DATABASE_URL` |
