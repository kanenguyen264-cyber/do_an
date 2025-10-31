# ⚡ Quick Start Guide

## 🚀 Khởi động nhanh với Docker (Khuyến nghị)

### Bước 1: Cấu hình môi trường

```bash
# Copy file cấu hình
cp .env.example .env

# Chỉnh sửa .env với thông tin Supabase của bạn
# DATABASE_URL và DIRECT_URL
```

### Bước 2: Chạy với Docker

```bash
# Build và start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Chờ khoảng 30 giây để các services khởi động
```

### Bước 3: Setup database

```bash
# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Seed dữ liệu mẫu
docker-compose exec backend npx prisma db seed
```

### Bước 4: Truy cập ứng dụng

- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Python API: http://localhost:8000

**Đăng nhập với tài khoản demo:**
- Email: `admin@library.com`
- Password: `admin123`

---

## 💻 Khởi động Development Mode

### Bước 1: Cài đặt dependencies

```bash
# Tự động
chmod +x scripts/*.sh
./scripts/setup.sh

# Hoặc thủ công
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd python-service && pip install -r requirements.txt && cd ..
```

### Bước 2: Setup database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..
```

### Bước 3: Chạy services

```bash
# Tự động (khuyến nghị)
./scripts/start.sh

# Hoặc thủ công - mở 3 terminals:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Python
cd python-service
uvicorn main:app --reload --port 8000
```

### Bước 4: Truy cập

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Python: http://localhost:8000

---

## 🎯 Các tính năng chính để test

### 1. Đăng ký và đăng nhập
- Truy cập http://localhost:5173/register
- Tạo tài khoản mới
- Đăng nhập

### 2. Tìm kiếm sách
- Vào trang "Sách"
- Tìm kiếm theo tên, tác giả
- Xem chi tiết sách

### 3. Mượn sách
- Chọn một cuốn sách
- Click "Mượn sách"
- Xem trong "Mượn sách" để theo dõi

### 4. Admin Dashboard (đăng nhập với admin@library.com)
- Vào /admin
- Xem thống kê
- Quản lý sách, người dùng
- Duyệt phiếu mượn

### 5. AI Recommendations
- Xem gợi ý sách trên trang chủ
- API: http://localhost:8000/recommendations/for-user/{userId}

---

## 🛑 Dừng services

```bash
# Docker
docker-compose down

# Development
./scripts/stop.sh

# Hoặc Ctrl+C trong mỗi terminal
```

---

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
./scripts/stop.sh
# Hoặc
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Database connection error
- Kiểm tra DATABASE_URL trong .env
- Đảm bảo Supabase đang hoạt động
- Chạy `npx prisma migrate dev`

### Frontend không kết nối được backend
- Kiểm tra VITE_API_URL trong frontend/.env
- Đảm bảo backend đang chạy

---

## 📚 Tài liệu chi tiết

- [README.md](./README.md) - Tổng quan dự án
- [SETUP.md](./SETUP.md) - Hướng dẫn cài đặt chi tiết
- [API.md](./API.md) - API Documentation

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có một hệ thống quản lý thư viện hoàn chỉnh với:
- ✅ Backend API (NestJS)
- ✅ Frontend UI (React)
- ✅ AI Service (FastAPI)
- ✅ Database (Supabase/PostgreSQL)
- ✅ Authentication & Authorization
- ✅ Book Management
- ✅ Borrowing System
- ✅ AI Recommendations
- ✅ Analytics & Reports

Chúc bạn phát triển thành công! 🚀
