# 📚 HỆ THỐNG QUẢN LÝ THƯ VIỆN - TÓM TẮT DỰ ÁN

## 🎯 Tổng quan

Hệ thống quản lý thư viện hiện đại với giao diện người dùng thân thiện và tính năng gợi ý sách thông minh sử dụng AI.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│              React + TypeScript + Vite                       │
│           TailwindCSS + shadcn/ui + Zustand                 │
│                    (Port 5173/80)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                         BACKEND                              │
│                  NestJS + TypeScript                         │
│              Prisma ORM + JWT Auth                          │
│                    (Port 3000)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────────┐
│   SUPABASE      │   │   PYTHON SERVICE    │
│   PostgreSQL    │   │   FastAPI + AI/ML   │
│   (Database)    │   │   (Port 8000)       │
└─────────────────┘   └─────────────────────┘
```

## 📦 Cấu trúc dự án

```
do_an/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── books/             # Book management
│   │   ├── borrowing/         # Borrowing system
│   │   ├── categories/        # Category management
│   │   ├── authors/           # Author management
│   │   ├── publishers/        # Publisher management
│   │   ├── reviews/           # Review system
│   │   ├── notifications/     # Notification system
│   │   ├── violations/        # Violation tracking
│   │   ├── system-config/     # System configuration
│   │   ├── activity-logs/     # Activity logging
│   │   ├── analytics/         # Analytics & reports
│   │   └── prisma/            # Database service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── layouts/       # Layout components
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── BooksPage.tsx
│   │   │   ├── BookDetailPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── BorrowingPage.tsx
│   │   │   └── admin/         # Admin pages
│   │   ├── stores/            # Zustand state management
│   │   ├── lib/               # Utilities & API client
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── python-service/             # FastAPI AI Service
│   ├── routers/
│   │   ├── recommendations.py  # AI recommendation engine
│   │   ├── analytics.py        # Advanced analytics
│   │   └── anomaly_detection.py # Anomaly detection
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── scripts/                    # Utility scripts
│   ├── setup.sh               # Setup script
│   ├── start.sh               # Start all services
│   ├── stop.sh                # Stop all services
│   └── test.sh                # Run tests
│
├── docker-compose.yml          # Docker orchestration
├── .env.example               # Environment template
├── README.md                  # Main documentation
├── SETUP.md                   # Setup guide
├── QUICKSTART.md              # Quick start guide
├── API.md                     # API documentation
└── PROJECT_SUMMARY.md         # This file
```

## 🔑 Tính năng chính

### 👤 Người dùng (Độc giả)

#### Authentication & Profile
- ✅ Đăng ký tài khoản (Sinh viên/Giảng viên)
- ✅ Đăng nhập với JWT
- ✅ Quên mật khẩu & đặt lại
- ✅ Quản lý thông tin cá nhân
- ✅ Đổi mật khẩu
- ✅ Xem lịch sử mượn sách

#### Book Discovery
- ✅ Tìm kiếm sách (tên, tác giả, ISBN, thể loại)
- ✅ Lọc theo thể loại, năm xuất bản
- ✅ Xem chi tiết sách đầy đủ
- ✅ Xem sách phổ biến
- ✅ Xem sách mới cập nhật
- ✅ Gợi ý sách thông minh (AI)

#### Borrowing System
- ✅ Gửi yêu cầu mượn sách trực tuyến
- ✅ Theo dõi trạng thái phiếu mượn
- ✅ Gia hạn mượn sách
- ✅ Xem hạn trả
- ✅ Nhận thông báo nhắc hạn

#### Reviews & Ratings
- ✅ Đánh giá sách (1-5 sao)
- ✅ Viết bình luận
- ✅ Xem đánh giá của người khác

#### Notifications
- ✅ Thông báo sắp đến hạn trả (3 ngày trước)
- ✅ Thông báo quá hạn
- ✅ Thông báo phiếu mượn được duyệt/từ chối
- ✅ Thông báo vi phạm

### 👨‍💼 Quản trị viên / Thủ thư

#### Dashboard
- ✅ Thống kê tổng quan (sách, người dùng, mượn trả)
- ✅ Biểu đồ xu hướng mượn sách
- ✅ Cảnh báo sách quá hạn
- ✅ Top sách phổ biến
- ✅ Top người dùng hoạt động

#### Book Management
- ✅ CRUD sách (Create, Read, Update, Delete)
- ✅ Quản lý thể loại
- ✅ Quản lý tác giả
- ✅ Quản lý nhà xuất bản
- ✅ Cập nhật số lượng tồn kho
- ✅ Quản lý vị trí kệ sách

#### User Management
- ✅ Xem danh sách người dùng
- ✅ Tìm kiếm, lọc người dùng
- ✅ Cập nhật thông tin người dùng
- ✅ Phân quyền (Admin/Librarian/Reader)
- ✅ Khóa/mở khóa tài khoản
- ✅ Xem lịch sử mượn của người dùng

#### Borrowing Management
- ✅ Xem danh sách phiếu mượn
- ✅ Duyệt/từ chối yêu cầu mượn
- ✅ Xác nhận trả sách
- ✅ Tính toán phí trễ hạn tự động
- ✅ Xử lý sách hư/mất
- ✅ Kiểm tra sách quá hạn hàng loạt

#### Violation Management
- ✅ Theo dõi vi phạm (trễ hạn, hư, mất)
- ✅ Tính phí phạt tự động
- ✅ Xử lý vi phạm
- ✅ Lịch sử vi phạm

#### System Configuration
- ✅ Cấu hình thông tin thư viện
- ✅ Thiết lập quy định (số sách tối đa, số ngày mượn)
- ✅ Cấu hình phí phạt
- ✅ Cấu hình email thông báo

#### Reports & Analytics
- ✅ Báo cáo mượn trả theo tháng
- ✅ Thống kê theo thể loại
- ✅ Thống kê người dùng hoạt động
- ✅ Xuất báo cáo (Excel/PDF)

#### Activity Logs
- ✅ Lưu lại mọi thao tác
- ✅ Theo dõi ai làm gì, khi nào
- ✅ Audit trail đầy đủ

### 🤖 AI & Machine Learning Features

#### Recommendation System
- ✅ **Content-based Filtering**: Gợi ý dựa trên nội dung sách (thể loại, tác giả, mô tả)
- ✅ **Collaborative Filtering**: Gợi ý dựa trên hành vi người dùng tương tự
- ✅ **Hybrid Model**: Kết hợp cả hai phương pháp
- ✅ TF-IDF vectorization cho text similarity
- ✅ Cosine similarity cho matching

#### Analytics
- ✅ Phân tích xu hướng mượn sách theo thời gian
- ✅ Phân bố sách theo thể loại
- ✅ Phân tích hoạt động người dùng
- ✅ Dự đoán nhu cầu sách

#### Anomaly Detection
- ✅ Phát hiện mượn sách bất thường
- ✅ Cảnh báo tỷ lệ quá hạn cao
- ✅ Phát hiện pattern vi phạm
- ✅ Statistical analysis (mean, std deviation)

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Custom (shadcn/ui inspired)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

### Python AI Service
- **Framework**: FastAPI
- **ML Libraries**: 
  - scikit-learn (ML algorithms)
  - pandas (data manipulation)
  - numpy (numerical computing)
  - scipy (scientific computing)
- **Database**: SQLAlchemy + psycopg2
- **HTTP Client**: httpx

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend)
- **Process Manager**: PM2 (optional)

## 📊 Database Schema

### Core Tables
- **users**: Thông tin người dùng
- **books**: Thông tin sách
- **categories**: Thể loại sách
- **authors**: Tác giả
- **publishers**: Nhà xuất bản
- **book_authors**: Quan hệ sách-tác giả (many-to-many)
- **borrowings**: Phiếu mượn sách
- **reviews**: Đánh giá sách
- **violations**: Vi phạm
- **notifications**: Thông báo
- **system_config**: Cấu hình hệ thống
- **activity_logs**: Nhật ký hoạt động

### Enums
- **UserRole**: ADMIN, LIBRARIAN, READER
- **UserType**: STUDENT, TEACHER
- **UserStatus**: ACTIVE, SUSPENDED, INACTIVE
- **BorrowingStatus**: PENDING, APPROVED, BORROWED, RETURNED, OVERDUE, REJECTED
- **ViolationType**: LATE_RETURN, DAMAGED, LOST
- **ViolationStatus**: PENDING, RESOLVED

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Protected routes
- ✅ Input validation
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Environment variables for secrets

## 🚀 Deployment

### Development
```bash
./scripts/setup.sh
./scripts/start.sh
```

### Production (Docker)
```bash
docker-compose up -d
```

### Environment Variables
- `DATABASE_URL`: Supabase connection string
- `JWT_SECRET`: Secret key for JWT
- `SMTP_*`: Email configuration
- `MAX_BOOKS_PER_USER`: Borrowing limit
- `DEFAULT_BORROW_DAYS`: Default loan period
- `LATE_FEE_PER_DAY`: Late fee amount

## 📈 Performance Considerations

- ✅ Database indexing on frequently queried fields
- ✅ Pagination for large datasets
- ✅ Lazy loading for images
- ✅ API response caching (React Query)
- ✅ Connection pooling (Supabase)
- ✅ Optimized database queries with Prisma

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📝 API Endpoints Summary

- **Auth**: `/auth/*` - Authentication endpoints
- **Users**: `/users/*` - User management
- **Books**: `/books/*` - Book management
- **Borrowing**: `/borrowing/*` - Borrowing operations
- **Categories**: `/categories/*` - Category management
- **Authors**: `/authors/*` - Author management
- **Publishers**: `/publishers/*` - Publisher management
- **Reviews**: `/reviews/*` - Review system
- **Notifications**: `/notifications/*` - Notifications
- **Violations**: `/violations/*` - Violation tracking
- **Analytics**: `/analytics/*` - Statistics & reports
- **System Config**: `/system-config/*` - System settings
- **Activity Logs**: `/activity-logs/*` - Audit logs

### Python AI Service
- **Recommendations**: `/recommendations/*` - AI recommendations
- **Analytics**: `/analytics/*` - Advanced analytics
- **Anomaly**: `/anomaly/*` - Anomaly detection

## 🎓 Use Cases

### Sinh viên
1. Đăng ký tài khoản
2. Tìm kiếm sách cần mượn
3. Gửi yêu cầu mượn
4. Nhận thông báo khi được duyệt
5. Đến thư viện nhận sách
6. Nhận thông báo nhắc hạn trả
7. Gia hạn nếu cần
8. Trả sách đúng hạn
9. Đánh giá sách

### Thủ thư
1. Đăng nhập hệ thống
2. Xem dashboard tổng quan
3. Duyệt yêu cầu mượn sách
4. Cập nhật trạng thái khi sinh viên nhận sách
5. Xác nhận khi sinh viên trả sách
6. Xử lý vi phạm nếu có
7. Thêm sách mới vào hệ thống
8. Xem báo cáo thống kê

### Admin
1. Quản lý toàn bộ hệ thống
2. Phân quyền người dùng
3. Cấu hình quy định thư viện
4. Xem báo cáo chi tiết
5. Quản lý thủ thư

## 🔄 Workflow mượn sách

```
1. Reader gửi yêu cầu mượn
   ↓
2. Hệ thống kiểm tra điều kiện:
   - Tài khoản active?
   - Chưa vượt giới hạn?
   - Sách còn không?
   ↓
3. Tạo phiếu mượn (PENDING)
   ↓
4. Thủ thư duyệt (APPROVED/REJECTED)
   ↓
5. Nếu APPROVED:
   - Cập nhật số lượng sách
   - Tính ngày hạn trả
   - Gửi thông báo
   ↓
6. Reader đến nhận sách (BORROWED)
   ↓
7. Hệ thống tự động:
   - Nhắc trước 3 ngày
   - Cảnh báo quá hạn
   ↓
8. Reader trả sách (RETURNED)
   ↓
9. Hệ thống kiểm tra:
   - Đúng hạn? → OK
   - Trễ hạn? → Tạo violation
   - Hư/mất? → Tạo violation
```

## 📚 Documentation Files

- **README.md**: Tổng quan dự án
- **SETUP.md**: Hướng dẫn cài đặt chi tiết
- **QUICKSTART.md**: Hướng dẫn khởi động nhanh
- **API.md**: API documentation đầy đủ
- **PROJECT_SUMMARY.md**: Tóm tắt dự án (file này)

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] QR code scanning for books
- [ ] Barcode integration
- [ ] Advanced search filters
- [ ] Book reservation system
- [ ] Fine payment integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export reports to PDF/Excel
- [ ] Book cover upload
- [ ] User avatars
- [ ] Social features (share, like)
- [ ] Reading lists
- [ ] Book clubs

## 👥 Roles & Permissions

| Feature | Reader | Librarian | Admin |
|---------|--------|-----------|-------|
| View books | ✅ | ✅ | ✅ |
| Borrow books | ✅ | ✅ | ✅ |
| Manage own profile | ✅ | ✅ | ✅ |
| Review books | ✅ | ✅ | ✅ |
| Approve borrowings | ❌ | ✅ | ✅ |
| Manage books | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| System config | ❌ | ❌ | ✅ |
| View all logs | ❌ | ✅ | ✅ |

## 🏆 Key Achievements

✅ **Full-stack application** với 3 services độc lập
✅ **Modern tech stack** với TypeScript, React, NestJS
✅ **AI-powered recommendations** sử dụng ML algorithms
✅ **Comprehensive features** đáp ứng đầy đủ yêu cầu
✅ **Production-ready** với Docker deployment
✅ **Well-documented** với đầy đủ tài liệu
✅ **Scalable architecture** dễ mở rộng
✅ **Security best practices** được áp dụng

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Đọc SETUP.md và QUICKSTART.md
2. Kiểm tra API.md cho API documentation
3. Xem logs: `docker-compose logs -f`
4. Tạo issue trên GitHub

---

**Phát triển bởi**: Library Management System Team
**Năm**: 2025
**License**: MIT
