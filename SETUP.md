# 🚀 Hướng dẫn cài đặt và chạy hệ thống

## Yêu cầu hệ thống

- Node.js 18+ 
- Python 3.9+
- Docker & Docker Compose (tùy chọn)
- Tài khoản Supabase

## Bước 1: Clone và cấu hình

```bash
# Clone repository
git clone <repository-url>
cd do_an

# Tạo file .env từ template
cp .env.example .env
```

## Bước 2: Cấu hình Database (Supabase)

Mở file `.env` và cập nhật thông tin Supabase:

```env
DATABASE_URL="postgresql://postgres.ukgvzypywnfmhapycfct:Thehoa2604@@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ukgvzypywnfmhapycfct:Thehoa2604@@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## Bước 3: Cài đặt dependencies

### Tự động (khuyến nghị)
```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

### Thủ công

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

#### Python Service
```bash
cd python-service
pip install -r requirements.txt
cd ..
```

## Bước 4: Chạy ứng dụng

### Development Mode

#### Tự động (khuyến nghị)
```bash
./scripts/start.sh
```

#### Thủ công

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Python Service:**
```bash
cd python-service
uvicorn main:app --reload --port 8000
```

### Production Mode với Docker

```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

## Bước 5: Truy cập ứng dụng

- **Frontend**: http://localhost:5173 (dev) hoặc http://localhost:80 (production)
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api
- **Python API**: http://localhost:8000
- **Python API Docs**: http://localhost:8000/docs

## Tài khoản demo

Sau khi seed database, bạn có thể đăng nhập với:

- **Admin**: 
  - Email: `admin@library.com`
  - Password: `admin123`

- **Librarian**: 
  - Email: `librarian@library.com`
  - Password: `admin123`

- **Reader**: 
  - Email: `reader@library.com`
  - Password: `admin123`

## Cấu trúc dự án

```
do_an/
├── backend/              # NestJS backend
│   ├── src/
│   ├── prisma/
│   └── Dockerfile
├── frontend/             # React frontend
│   ├── src/
│   └── Dockerfile
├── python-service/       # FastAPI AI service
│   ├── routers/
│   ├── main.py
│   └── Dockerfile
├── scripts/              # Utility scripts
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra thông tin DATABASE_URL trong file `.env`
- Đảm bảo Supabase project đang hoạt động
- Chạy `npx prisma migrate dev` để tạo tables

### Lỗi port đã được sử dụng
```bash
# Dừng tất cả services
./scripts/stop.sh

# Hoặc kill port cụ thể
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Lỗi CORS
- Kiểm tra VITE_API_URL trong frontend/.env
- Đảm bảo backend đang chạy trước khi start frontend

## Scripts hữu ích

```bash
# Setup dự án
./scripts/setup.sh

# Start tất cả services
./scripts/start.sh

# Stop tất cả services
./scripts/stop.sh

# Run tests
./scripts/test.sh

# Prisma commands
cd backend
npx prisma studio          # Mở Prisma Studio
npx prisma migrate dev     # Tạo migration mới
npx prisma db seed         # Seed database
npx prisma generate        # Generate Prisma Client
```

## Tính năng chính

### Người dùng (Độc giả)
- ✅ Đăng ký, đăng nhập, quên mật khẩu
- 🔍 Tra cứu và tìm kiếm sách
- 📖 Xem chi tiết sách
- 📚 Mượn và trả sách trực tuyến
- ⏰ Gia hạn mượn sách
- 👤 Quản lý tài khoản cá nhân
- 🔔 Nhận thông báo nhắc hạn trả
- ⭐ Đánh giá và bình luận sách
- 🤖 Nhận gợi ý sách thông minh (AI)

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

### AI Features
- 🤖 Content-based filtering (gợi ý dựa trên nội dung)
- 👥 Collaborative filtering (gợi ý dựa trên người dùng tương tự)
- 📊 Phân tích xu hướng mượn sách
- 🔍 Phát hiện bất thường
- 📈 Dự đoán nhu cầu sách

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
