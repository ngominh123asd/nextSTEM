# nextSTEM Vietnam - Tài liệu Kỹ thuật và Hướng dẫn Hệ thống

nextSTEM Vietnam là một hệ sinh thái giáo dục toàn diện, ứng dụng Trí tuệ Nhân tạo (AI) để hỗ trợ học sinh và sinh viên trong việc định hướng, chuẩn bị hồ sơ du học và phát triển năng lực trong lĩnh vực STEM (Khoa học, Công nghệ, Kỹ thuật và Toán học). Hệ thống kết hợp các mô hình ngôn ngữ lớn (LLM), phân tích dữ liệu học tập và khung năng lực chuẩn quốc gia để tạo ra trải nghiệm cá nhân hóa.

---

## 1. Kiến trúc Hệ thống

Hệ thống được xây dựng theo kiến trúc microservices linh hoạt, bao gồm ba thành phần chính:

### 1.1. Backend Core (FastAPI)
- Đóng vai trò là trung tâm điều phối, quản lý người dùng, cơ sở dữ liệu và logic nghiệp vụ.
- Sử dụng FastAPI để đảm bảo hiệu năng cao và khả năng xử lý bất đồng bộ.
- Quản lý xác thực OAuth2 (Google/Facebook), phân quyền và quản lý phiên làm việc.

### 1.2. Standalone AI Service
- Một dịch vụ độc lập chuyên trách xử lý các tác vụ AI phức tạp.
- Cung cấp các endpoint cho phép chạy các Agent (Advisor, Roadmap Generator).
- Sử dụng LangChain và Google Gemini để thực thi các quy trình RAG (Retrieval-Augmented Generation).

### 1.3. Frontend (React)
- Giao diện người dùng hiện đại, responsive, xây dựng trên nền tảng React 19 và Vite.
- Sử dụng Tailwind CSS 4 để quản lý giao diện và GSAP để tạo các hiệu ứng chuyển động mượt mà.

---

## 2. Phân hệ Digital Twin Student (DTS)

DTS là tính năng cốt lõi của nextSTEM, cho phép tạo ra một "bản sao số" của người học để theo dõi và dự báo quá trình phát triển.

### 2.1. Snapshot và Timeline
- Snapshot: Hệ thống tự động hoặc cho phép người dùng tạo các "điểm chạm" dữ liệu tại một thời điểm nhất định, bao gồm điểm số năng lực, mức độ hoàn thiện hồ sơ và điểm tổng quát.
- Timeline: Trình diễn lịch sử thay đổi năng lực, cho phép người dùng thấy được sự tiến bộ qua từng giai đoạn.

### 2.2. Hoạt động và Nhật ký (Activity Logs)
- Mỗi tương tác quan trọng (đánh giá kỹ năng, cập nhật hồ sơ, thực hiện chatbot) đều được ghi lại vào hệ thống nhật ký để phân tích hành vi học tập.

---

## 3. Khung năng lực STEM (GDPT 2018)

nextSTEM triển khai Khung năng lực STEM dựa trên Chương trình Giáo dục Phổ thông 2018 của Việt Nam, bao gồm 5 thành phần năng lực chính và 15 chỉ số hành vi:

1. Thu thập thông tin: Bao gồm xác định vấn đề, định vị thông tin và thu thập dữ liệu.
2. Xử lý và sử dụng thông tin: Bao gồm đánh giá thông tin, quản lý dữ liệu và phân tích thông tin.
3. Thực hiện giải pháp: Bao gồm lập kế hoạch, triển khai thực hiện và cải tiến giải pháp.
4. An toàn kỹ thuật: Bao gồm đảm bảo an toàn, thao tác đúng kỹ thuật và bảo quản thiết bị.
5. Chia sẻ cộng đồng: Bao gồm lựa chọn hình thức chia sẻ, trình bày kết quả và phản biện khoa học.

Hệ thống sử dụng biểu đồ Radar để trực quan hóa 5 nhóm năng lực này, giúp người dùng nhận diện các điểm mạnh và điểm cần cải thiện.

---

## 4. AI Study Coach và Hệ thống Tooling

Hệ thống AI không chỉ là một chatbot thông thường mà là một hệ thống Agent có khả năng sử dụng công cụ:

### 4.1. Advisor Chat Workflow
- Luồng xử lý: Tiếp nhận tin nhắn -> Phân loại yêu cầu -> Lập kế hoạch thực thi -> Gọi công cụ -> Tổng hợp kết quả -> Trả lời người dùng.
- Hỗ trợ Clarification: Nếu thông tin người dùng cung cấp chưa đủ (ví dụ thiếu điểm GPA để tìm học bổng), Agent sẽ chủ động đặt câu hỏi làm rõ.

### 4.2. University Explorer Engine
Công cụ tìm kiếm đại học tích hợp dữ liệu từ nhiều nguồn theo thứ tự ưu tiên:
1. Static Database: Dữ liệu nội bộ đã được kiểm duyệt.
2. OpenAlex & ROR: Dữ liệu nghiên cứu và tổ chức giáo dục toàn cầu.
3. Hipo (Universities List): Danh sách đại học quốc tế.
4. Tavily & Google Search: Tìm kiếm thời gian thực để bổ sung thông tin mới nhất.

---

## 5. Danh mục Công nghệ (Tech Stack)

### Backend
- Framework: FastAPI
- ORM: SQLAlchemy (Async)
- Migration: Alembic
- Database: PostgreSQL
- Caching/Queue: Redis
- AI Framework: LangChain, Pydantic v2
- Rate Limiting: Slowapi

### Frontend
- Core: React 19, TypeScript, Vite
- Styling: Tailwind CSS 4, Radix UI, Shadcn/UI
- Animation: GSAP, CSS Animations
- Visualization: Recharts (Radar, Area charts)
- Icons: Lucide React

---

## 6. Biến môi trường (Environment Variables)

Hệ thống yêu cầu các biến cấu hình sau trong file .env:

| Biến | Mô tả |
|------|-------|
| DATABASE_URL | Đường dẫn kết nối PostgreSQL (asyncpg) |
| REDIS_URL | Đường dẫn kết nối Redis |
| SECRET_KEY | Khóa bí mật để ký JWT |
| GEMINI_API_KEY | API Key từ Google AI Studio |
| TAVILY_API_KEY | API Key từ Tavily Search (tùy chọn) |
| OPENALEX_MAILTO | Email để định danh với OpenAlex API |
| GOOGLE_CLIENT_ID | Client ID cho đăng nhập Google |
| FACEBOOK_APP_ID | App ID cho đăng nhập Facebook |
| AI_SERVICE_URL | URL của dịch vụ AI độc lập |

---

## 7. Hướng dẫn Cài đặt và Triển khai

### 7.1. Chạy local
1. Backend:
   - Tạo môi trường ảo: `python -m venv .venv`
   - Cài đặt thư viện: `pip install -r requirements.txt`
   - Chạy migration: `alembic upgrade head`
   - Khởi chạy: `uvicorn app.main:app --reload`
2. Frontend:
   - Cài đặt: `npm install`
   - Khởi chạy: `npm run dev`

### 7.2. Docker
Hệ thống cung cấp file `docker-compose.yml` để triển khai nhanh:
`docker-compose up --build`

---

## 8. Tài liệu API chính

- `/api/v1/auth/`: Đăng nhập, đăng ký, OAuth2.
- `/api/v1/users/`: Quản lý thông tin cá nhân.
- `/api/v1/dts/`: Lấy snapshot, profile DTS, timeline.
- `/api/v1/competencies/`: Lấy khung năng lực, cập nhật điểm số.
- `/api/v1/portfolio/`: Quản lý dự án, chứng chỉ.
- `/api/v1/university/search`: Tìm kiếm đại học.
- `/api/v1/ai/run/stream`: Endpoint stream cho chatbot AI.

---

© 2026 nextSTEM Vietnam. All rights reserved.

