# Hướng Dẫn Triển Khai Hệ Thống Quản Lý Thư Viện

## 📋 Tổng Quan

Hệ thống quản lý thư viện được xây dựng với kiến trúc microservices:
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS  
- **AI Service**: FastAPI + scikit-learn + NLP

## ✅ Các Chức Năng Đã Triển Khai

### I. Chức Năng Cơ Bản (Backend - NestJS)

#### 1. Quản lý Sách (Books Module)
- ✅ CRUD operations cho sách
- ✅ Tìm kiếm theo tên, ISBN, tác giả, thể loại
- ✅ Phân loại theo category, author, publisher
- ✅ Quản lý số lượng sách available/total
- ✅ Tracking borrow count và rating

**Files**:
- `backend/src/books/entities/book.entity.ts`
- `backend/src/books/books.service.ts`
- `backend/src/books/books.controller.ts`

#### 2. Quản lý Người Dùng (Users Module)
- ✅ Đăng ký, đăng nhập với JWT
- ✅ Phân quyền: Admin, Librarian, Reader
- ✅ Quản lý profile, avatar
- ✅ Giới hạn số sách mượn (maxBorrowLimit)
- ✅ Tracking số sách đang mượn

**Files**:
- `backend/src/users/entities/user.entity.ts`
- `backend/src/users/users.service.ts`
- `backend/src/auth/auth.module.ts`

#### 3. Quản lý Mượn-Trả Sách (Borrowing Module)
- ✅ Tạo phiếu mượn với digital signature
- ✅ Trả sách và tính toán phạt tự động
- ✅ Gia hạn sách (renew)
- ✅ Kiểm tra tình trạng sách
- ✅ Lịch sử mượn-trả của user

**Files**:
- `backend/src/borrowing/entities/borrowing.entity.ts`
- `backend/src/borrowing/borrowing.service.ts`
- `backend/src/borrowing/borrowing.controller.ts`

#### 4. Quản lý Phạt (Fines)
- ✅ Tự động tính phạt khi trễ hạn
- ✅ Quản lý thanh toán phạt
- ✅ Miễn phạt (waive) cho admin
- ✅ Tổng phạt chưa thanh toán

**Files**:
- `backend/src/borrowing/entities/fine.entity.ts`
- `backend/src/borrowing/fines.service.ts`

#### 5. Đặt Trước Sách (Reservations)
- ✅ Đặt trước sách đang được mượn
- ✅ Hàng đợi (queue) tự động
- ✅ Thông báo khi sách sẵn sàng
- ✅ Hết hạn đặt trước tự động

**Files**:
- `backend/src/borrowing/entities/reservation.entity.ts`
- `backend/src/borrowing/reservations.service.ts`

#### 6. Hệ Thống Thông Báo (Notifications)
- ✅ Thông báo sắp đến hạn trả
- ✅ Thông báo quá hạn
- ✅ Thông báo sách đặt trước sẵn sàng
- ✅ Thông báo phạt
- ✅ Đánh dấu đã đọc

**Files**:
- `backend/src/notifications/entities/notification.entity.ts`
- `backend/src/notifications/notifications.service.ts`

#### 7. Phân Quyền (Role-Based Access Control)
- ✅ Guards cho JWT authentication
- ✅ Role-based authorization
- ✅ Decorators: @Roles(), @CurrentUser()

**Files**:
- `backend/src/auth/guards/roles.guard.ts`
- `backend/src/auth/decorators/roles.decorator.ts`

### II. Chức Năng Nâng Cao (Python - FastAPI)

#### 1. AI Recommendation System ✅
- Gợi ý sách dựa trên lịch sử mượn
- Collaborative filtering + Content-based filtering
- TF-IDF vectorization
- Cosine similarity

**Endpoint**: `POST /api/recommendations/books/{user_id}`

**File**: `python-service/routers/recommendations.py`

#### 2. NLP Text Classification ✅
- Phân loại thể loại sách tự động
- Keyword-based classification (có thể nâng cấp lên BERT)
- Semantic search
- Text-to-SQL conversion

**Endpoints**:
- `POST /api/nlp/classify-book`
- `POST /api/nlp/semantic-search`
- `POST /api/nlp/text-to-sql`

**File**: `python-service/routers/nlp.py`

#### 3. OCR + Image Recognition ✅
- Trích xuất ISBN từ ảnh bìa sách
- Tích hợp Google Books API
- Tự động lấy thông tin sách

**Endpoints**:
- `POST /api/ocr/extract-isbn`
- `GET /api/ocr/book-info/{isbn}`
- `POST /api/ocr/extract-and-fetch`

**File**: `python-service/routers/ocr.py`

#### 4. Anomaly Detection ✅
- Phát hiện hành vi bất thường
- Isolation Forest algorithm
- User risk scoring
- Recommendations dựa trên risk level

**Endpoints**:
- `GET /api/anomaly/detect-user-anomalies`
- `GET /api/anomaly/user-risk-score/{user_id}`

**File**: `python-service/routers/anomaly_detection.py`

### III. Chức Năng Cần Hoàn Thiện

#### 5. Xác Thực Hai Lớp (2FA) ⏳
- Cần implement: OTP generation
- Redis cho session storage
- Email/SMS integration

**Cần tạo**:
- `backend/src/auth/two-factor.service.ts`
- `backend/src/auth/two-factor.controller.ts`

#### 6. Chữ Ký Số ✅ (Đã có trong Borrowing)
- Digital signature đã được implement trong borrowing service
- Sử dụng HMAC-SHA256

#### 7. WebSocket Real-time ⏳
- Cần implement: WebSocket Gateway
- Real-time notifications
- Live borrowing updates

**Cần tạo**:
- `backend/src/websocket/websocket.gateway.ts`
- `backend/src/websocket/websocket.module.ts`

#### 8. Semantic Search với pgvector ⏳
- Cần cài đặt pgvector extension
- Sentence Transformers embeddings
- Vector similarity search

#### 9. Google Calendar Integration ⏳
- Sync due dates to Google Calendar
- Automatic reminders

**Cần tạo**:
- `python-service/routers/calendar.py`

#### 10. Dashboard & Reports ⏳
- Biểu đồ thống kê
- Export CSV/PDF
- Analytics dashboard

## 🚀 Hướng Dẫn Chạy

### 1. Cài Đặt Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
cd frontend
npm install
```

**Python Service**:
```bash
cd python-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Cấu Hình Database

File `.env` đã được tạo với thông tin Supabase PostgreSQL.

### 3. Chạy Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Terminal 3 - Python Service**:
```bash
cd python-service
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 4. Truy Cập

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Python API: http://localhost:8000/docs

## 📊 Database Schema

### Tables Created:
1. **users** - Người dùng (Admin, Librarian, Reader)
2. **books** - Sách
3. **categories** - Thể loại
4. **authors** - Tác giả
5. **publishers** - Nhà xuất bản
6. **book_authors** - Many-to-many relationship
7. **borrowings** - Phiếu mượn
8. **reservations** - Đặt trước
9. **fines** - Phạt
10. **notifications** - Thông báo

## 🔧 API Endpoints

### Books
- `GET /books` - Danh sách sách
- `GET /books/:id` - Chi tiết sách
- `POST /books` - Tạo sách (Admin/Librarian)
- `PATCH /books/:id` - Cập nhật sách
- `DELETE /books/:id` - Xóa sách (Admin)

### Borrowing
- `POST /borrowing` - Mượn sách
- `PATCH /borrowing/:id/return` - Trả sách
- `PATCH /borrowing/:id/renew` - Gia hạn
- `GET /borrowing/my-borrowings` - Lịch sử mượn

### Reservations
- `POST /reservations` - Đặt trước
- `GET /reservations/my-reservations` - Đặt trước của tôi
- `PATCH /reservations/:id/cancel` - Hủy đặt trước

### Fines
- `GET /fines/my-fines` - Phạt của tôi
- `PATCH /fines/:id/pay` - Thanh toán phạt

### AI Services
- `POST /api/recommendations/books/{user_id}` - Gợi ý sách
- `POST /api/nlp/classify-book` - Phân loại sách
- `POST /api/ocr/extract-isbn` - Trích xuất ISBN
- `GET /api/anomaly/user-risk-score/{user_id}` - Điểm rủi ro

## 📝 Next Steps

1. **Chạy npm install** trong thư mục backend và frontend
2. **Chạy pip install** trong python-service
3. **Test các API endpoints** bằng Swagger UI
4. **Implement Frontend pages** cho các chức năng
5. **Thêm WebSocket** cho real-time updates
6. **Implement 2FA** cho bảo mật
7. **Tích hợp Google Calendar API**
8. **Tạo Dashboard** với charts và analytics

## 🎯 Ưu Tiên Phát Triển

1. ✅ Core CRUD operations (Hoàn thành)
2. ✅ Authentication & Authorization (Hoàn thành)
3. ✅ Borrowing system (Hoàn thành)
4. ✅ AI Recommendations (Hoàn thành)
5. ⏳ Frontend UI/UX
6. ⏳ WebSocket real-time
7. ⏳ 2FA Security
8. ⏳ Advanced Analytics

## 📚 Documentation

- Backend Swagger: http://localhost:3001/api
- Python Swagger: http://localhost:8000/docs
- README.md - Tổng quan
- SETUP.md - Hướng dẫn cài đặt chi tiết
