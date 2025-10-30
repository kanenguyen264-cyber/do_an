# Hướng Dẫn Cài Đặt Chi Tiết

## Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **Python**: >= 3.9
- **npm** hoặc **yarn**
- **PostgreSQL** (hoặc tài khoản Supabase)

## Bước 1: Clone Repository

```bash
git clone <repository-url>
cd do_an
```

## Bước 2: Cấu Hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

File `.env` đã được cấu hình sẵn với database Supabase:

```env
DATABASE_URL=postgresql://postgres:Thehoa2604@db.kslaskzvzxlveqhgnaeh.supabase.co:5432/postgres
DB_HOST=db.kslaskzvzxlveqhgnaeh.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Thehoa2604@
DB_DATABASE=postgres

NEST_PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production

VITE_API_URL=http://localhost:3001
VITE_PYTHON_API_URL=http://localhost:8000

PYTHON_SERVICE_PORT=8000
FASTAPI_ENV=development
```

## Bước 3: Cài Đặt Backend (NestJS)

```bash
cd backend
npm install
```

### Chạy Backend Development Mode

```bash
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3001**
- API Documentation: **http://localhost:3001/api**
- Health Check: **http://localhost:3001/health**

### Build Backend cho Production

```bash
npm run build
npm run start:prod
```

## Bước 4: Cài Đặt Frontend (React)

```bash
cd ../frontend
npm install
```

### Chạy Frontend Development Mode

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Build Frontend cho Production

```bash
npm run build
npm run preview
```

## Bước 5: Cài Đặt Python Service (FastAPI)

```bash
cd ../python-service
```

### Tạo Virtual Environment

```bash
python -m venv venv
```

### Kích hoạt Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### Cài Đặt Dependencies

```bash
pip install -r requirements.txt
```

### Chạy FastAPI Service

```bash
uvicorn main:app --reload --port 8000
```

Python service sẽ chạy tại: **http://localhost:8000**
- API Documentation: **http://localhost:8000/docs**
- Alternative Docs: **http://localhost:8000/redoc**

## Bước 6: Chạy Tất Cả Services

Mở 3 terminal riêng biệt:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Python Service:**
```bash
cd python-service
source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
uvicorn main:app --reload --port 8000
```

## Bước 7: Sử Dụng Docker (Tùy Chọn)

Nếu bạn muốn chạy toàn bộ stack với Docker:

```bash
docker-compose up -d
```

Dừng services:
```bash
docker-compose down
```

## Kiểm Tra Cài Đặt

1. **Backend**: Truy cập http://localhost:3001/health
2. **Frontend**: Truy cập http://localhost:5173
3. **Python Service**: Truy cập http://localhost:8000/health

## Tính Năng Chính

### Backend (NestJS)
- ✅ User authentication với JWT
- ✅ CRUD operations cho Users
- ✅ TypeORM với PostgreSQL
- ✅ Swagger API documentation
- ✅ Validation với class-validator

### Frontend (React)
- ✅ Modern UI với TailwindCSS
- ✅ Authentication flow (Login/Register)
- ✅ Dashboard với statistics
- ✅ Responsive design
- ✅ React Router navigation

### Python Service (FastAPI)
- ✅ Items management API
- ✅ Analytics endpoints
- ✅ SQLAlchemy ORM
- ✅ Auto-generated documentation
- ✅ Pydantic validation

## Troubleshooting

### Lỗi Database Connection

Nếu gặp lỗi kết nối database, kiểm tra:
1. Database URL trong file `.env` đúng chưa
2. Database có đang chạy không
3. Firewall có chặn kết nối không

### Lỗi Port Already in Use

Nếu port đã được sử dụng:
```bash
# Tìm process đang dùng port
lsof -i :3001  # hoặc :5173, :8000

# Kill process
kill -9 <PID>
```

### Lỗi Module Not Found

Chạy lại install:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Python
cd python-service && pip install -r requirements.txt
```

## Next Steps

1. Đăng ký tài khoản mới tại http://localhost:5173/register
2. Đăng nhập và truy cập Dashboard
3. Khám phá API documentation:
   - NestJS: http://localhost:3001/api
   - FastAPI: http://localhost:8000/docs
