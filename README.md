# nextSTEM (temp_nextstem_new)

Tai lieu nay tong hop cac tinh nang da chinh sua trong nhanh `AI_tech`, dong thoi mo ta cach deploy de reviewer co the test nhanh.

## 1) Cac tinh nang da chinh sua

### A. Tach va tich hop lai he thong AI
- Da dua cac thanh phan AI tu workspace goc vao `temp_nextstem_new`.
- Bo sung day du thu muc va endpoint AI:
  - `backend/app/agents/*`
  - `backend/app/api/agent.py`
  - `backend/ai_service/*`
  - `backend/app/models/ai_profile.py`
  - `backend/app/schemas/ai_profile.py`
  - `backend/app/services/ai_profile_service.py`
  - migration `backend/alembic/versions/7d6c5b4a3921_add_ai_profiles.py`

### B. MBTI Quiz
- Them nut bo qua MBTI truoc khi vao chat AI.
- File: `screens/dashboard/tabs/AIAdvisorTab.tsx`

### C. University Explorer Tool (Tools Tab)
- Them API tim truong moi:
  - `POST /api/v1/university/search`
  - File: `backend/app/api/university.py`
- Dang ky router trong app backend.
  - File: `backend/app/main.py`
- Them client API frontend:
  - `apiSearchUniversities()` + typing `UniversityResult`
  - File: `lib/api.ts`
- UI tim truong trong Tools:
  - O tim kiem + filter country/field
  - Danh sach ket qua
  - Modal chi tiet (click vao ket qua tu static DB)
  - Badge nguon du lieu (Static/OpenAlex/ROR/Hipo/Tavily)
  - File: `screens/dashboard/tabs/ToolsTab.tsx`

### D. Logic du lieu University (uu tien static + bo sung AI)
- Uu tien tim trong static DB truoc.
- Neu chua du ket qua, lay them tu OpenAlex, ROR, Hipo.
- Neu van chua du thi bo sung tiep tu Tavily.
- Muc tieu toi thieu: co gang tra ve 10 truong.
- Co gan nhan nguon trich dan trong output de parser frontend hien thi.
- File: `backend/app/agents/tools/university_explorer.py`

### E. Config bo sung cho AI tools
- Bo sung bien cau hinh:
  - `OPENALEX_MAILTO`
  - `TAVILY_API_KEY`
  - `WIKIDATA_USER_AGENT`
  - `COLLEGESCORECARD_API_KEY`
- File: `backend/app/config.py`

## 2) Huong dan chay local

### Frontend
```bash
cd temp_nextstem_new
npm run dev
```

### Backend chinh (FastAPI)
```bash
cd temp_nextstem_new/backend
uvicorn app.main:app --reload --port 8000
```

### AI service (neu can chay rieng)
```bash
cd temp_nextstem_new/backend
uvicorn ai_service.main:app --reload --port 8001
```

## 3) Deploy de reviewer test

### Frontend (Vercel)
- Deploy frontend len Vercel.
- Dat env `VITE_API_URL` tro den URL backend public.

### Backend (de reviewer test tinh nang)
Reviewer khong the goi backend local cua dev, nen can backend public. Co 2 cach thuc te:

1. **Khuyen nghi:** deploy backend len Railway/Render/Fly.io
   - Chay `backend/app.main:app` (port 8000)
   - Cau hinh CORS them domain Vercel
   - Dat URL backend vao `VITE_API_URL` cua Vercel

2. **Tam thoi de demo nhanh:** dung tunnel (ngrok/cloudflared) cho backend local
   - Tao public URL -> map vao `VITE_API_URL`
   - Chi phu hop review ngan han

## 4) Bien moi truong can luu y

Trong `backend/.env`:
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `OPENALEX_MAILTO`
- `TAVILY_API_KEY` (neu can bo sung ket qua Tavily)

Trong Vercel project (frontend):
- `VITE_API_URL=https://<backend-public-url>`

## 5) Ghi chu
- Neu backend khong co Tavily key, he thong van chay (co static + nguon public khac), nhung ket qua bo sung se it hon.
- Neu muon test chuc nang University day du, nen bat ca OpenAlex/Hipo/Tavily.
