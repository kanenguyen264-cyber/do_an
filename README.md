# 📚 Hệ Thống Quản Lý Thư Viện

Hệ thống quản lý thư viện hiện đại với giao diện người dùng thân thiện và tính năng gợi ý sách thông minh sử dụng AI.

## 🚀 Công nghệ sử dụng

- **Backend**: NestJS + TypeScript
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **AI Service**: FastAPI + Python (Recommendation System)
- **Database**: Supabase (PostgreSQL)
- **Containerization**: Docker & Docker Compose

## 📋 Tính năng chính

### Người dùng (Độc giả)
- ✅ Đăng ký, đăng nhập, quên mật khẩu
- 🔍 Tra cứu và tìm kiếm sách
- 📖 Xem chi tiết sách
- 📚 Mượn và trả sách trực tuyến
- ⏰ Gia hạn mượn sách
- 👤 Quản lý tài khoản cá nhân
- 🔔 Nhận thông báo nhắc hạn trả
- ⭐ Đánh giá và bình luận sách
- 🤖 Nhận gợi ý sách thông minh

### Quản trị viên / Thủ thư
- 📊 Bảng điều khiển tổng quan
- 📚 Quản lý sách (CRUD)
- 👥 Quản lý người dùng
- 📋 Quản lý mượn - trả sách
- ⚠️ Quản lý vi phạm
- 📢 Quản lý thông báo
- ⚙️ Cấu hình hệ thống
- 📈 Báo cáo và thống kê
- 📝 Nhật ký hoạt động

## 🛠️ Cài đặt

### Yêu cầu
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Tài khoản Supabase

### 1. Clone repository
```bash
git clone <repository-url>
cd do_an
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin Supabase của bạn:
```env
DATABASE_URL="postgresql://postgres.ukgvzypywnfmhapycfct:Thehoa2604@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ukgvzypywnfmhapycfct:Thehoa2604@@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your-secret-key
```

### 3. Chạy với Docker
```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### 4. Chạy development mode

#### Backend (NestJS)
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

#### Python Service (FastAPI)
```bash
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📱 Truy cập ứng dụng

- **Frontend**: http://localhost:80 (hoặc http://localhost:5173 ở dev mode)
- **Backend API**: http://localhost:3000
- **Python API**: http://localhost:8000
- **API Documentation**: http://localhost:3000/api (Swagger)
- **Python API Docs**: http://localhost:8000/docs

## 🗄️ Database Schema

Hệ thống sử dụng Prisma ORM với các bảng chính:
- `users` - Thông tin người dùng
- `books` - Thông tin sách
- `categories` - Thể loại sách
- `authors` - Tác giả
- `publishers` - Nhà xuất bản
- `borrowings` - Lịch sử mượn trả
- `reviews` - Đánh giá sách
- `notifications` - Thông báo
- `violations` - Vi phạm
- `system_config` - Cấu hình hệ thống

## 🔐 Phân quyền

- **ADMIN**: Toàn quyền quản lý hệ thống
- **LIBRARIAN**: Quản lý sách, duyệt mượn trả, xử lý vi phạm
- **READER**: Tra cứu, mượn sách, đánh giá

## 🤖 AI Recommendation System

Hệ thống gợi ý sách sử dụng:
- **Collaborative Filtering**: Dựa trên hành vi người dùng tương tự
- **Content-based Filtering**: Dựa trên thể loại và nội dung sách
- **Hybrid Model**: Kết hợp cả hai phương pháp

## 📝 Scripts hữu ích

```bash
# Setup dự án
./scripts/setup.sh

# Khởi động services
./scripts/start.sh

# Dừng services
./scripts/stop.sh

# Chạy tests
./scripts/test.sh
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License

## 👨‍💻 Tác giả

Hệ thống quản lý thư viện - 2025
