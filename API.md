# 📚 API Documentation

## Base URLs

- **Backend API**: `http://localhost:3000`
- **Python AI Service**: `http://localhost:8000`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "userCode": "SV001",
  "userType": "STUDENT",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công",
  "user": { ... }
}
```

### POST /auth/login
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "READER"
  }
}
```

### POST /auth/forgot-password
Quên mật khẩu

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Đặt lại mật khẩu

**Request Body:**
```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

### GET /auth/me
Lấy thông tin người dùng hiện tại (requires auth)

---

## 📚 Books Endpoints

### GET /books
Lấy danh sách sách

**Query Parameters:**
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, tác giả, ISBN
- `categoryId` (optional): Lọc theo thể loại

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Clean Code",
      "isbn": "978-0132350884",
      "description": "A Handbook of Agile Software Craftsmanship",
      "coverImage": "url",
      "publishYear": 2008,
      "totalCopies": 5,
      "availableCopies": 3,
      "shelfLocation": "A1-01",
      "category": { "id": "uuid", "name": "Công nghệ thông tin" },
      "authors": [
        { "author": { "id": "uuid", "name": "Robert C. Martin" } }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### GET /books/:id
Lấy chi tiết sách

### POST /books (requires ADMIN/LIBRARIAN)
Tạo sách mới

**Request Body:**
```json
{
  "title": "Book Title",
  "isbn": "978-1234567890",
  "description": "Book description",
  "publishYear": 2024,
  "totalCopies": 5,
  "availableCopies": 5,
  "shelfLocation": "A1-01",
  "categoryId": "uuid",
  "publisherId": "uuid",
  "authorIds": ["uuid1", "uuid2"]
}
```

### PUT /books/:id (requires ADMIN/LIBRARIAN)
Cập nhật sách

### DELETE /books/:id (requires ADMIN/LIBRARIAN)
Xóa sách

---

## 📖 Borrowing Endpoints

### GET /borrowing
Lấy danh sách phiếu mượn (requires auth)

**Query Parameters:**
- `page`, `limit`: Phân trang
- `status`: Lọc theo trạng thái (PENDING, APPROVED, BORROWED, RETURNED, OVERDUE)
- `userId`: Lọc theo người dùng

### POST /borrowing
Tạo yêu cầu mượn sách (requires auth)

**Request Body:**
```json
{
  "bookId": "uuid",
  "notes": "Optional notes"
}
```

### GET /borrowing/:id
Lấy chi tiết phiếu mượn

### PUT /borrowing/:id/approve (requires ADMIN/LIBRARIAN)
Duyệt phiếu mượn

### PUT /borrowing/:id/reject (requires ADMIN/LIBRARIAN)
Từ chối phiếu mượn

**Request Body:**
```json
{
  "reason": "Lý do từ chối"
}
```

### PUT /borrowing/:id/return (requires ADMIN/LIBRARIAN)
Trả sách

### PUT /borrowing/:id/renew
Gia hạn mượn sách (requires auth)

### POST /borrowing/check-overdue (requires ADMIN/LIBRARIAN)
Kiểm tra sách quá hạn

---

## 👥 Users Endpoints

### GET /users (requires ADMIN/LIBRARIAN)
Lấy danh sách người dùng

**Query Parameters:**
- `page`, `limit`: Phân trang
- `search`: Tìm kiếm
- `role`: Lọc theo vai trò
- `status`: Lọc theo trạng thái

### GET /users/:id
Lấy thông tin người dùng

### PUT /users/:id
Cập nhật thông tin người dùng

### PUT /users/:id/change-password
Đổi mật khẩu

**Request Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### DELETE /users/:id (requires ADMIN)
Xóa người dùng

### GET /users/:id/borrowing-history
Lấy lịch sử mượn sách

---

## 📊 Analytics Endpoints

### GET /analytics/dashboard
Lấy thống kê tổng quan

**Response:**
```json
{
  "totalBooks": 150,
  "totalUsers": 50,
  "totalBorrowings": 300,
  "activeBorrowings": 25,
  "overdueBorrowings": 5
}
```

### GET /analytics/popular-books
Lấy danh sách sách phổ biến

---

## 🤖 AI Recommendation Endpoints (Python Service)

### GET /recommendations/for-book/{book_id}
Gợi ý sách dựa trên một cuốn sách cụ thể

**Query Parameters:**
- `limit` (optional): Số lượng gợi ý (default: 5)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "title": "Design Patterns",
      "category": "Công nghệ thông tin",
      "authors": ["Gang of Four"],
      "similarity_score": 0.85,
      "reason": "Similar content and category"
    }
  ]
}
```

### GET /recommendations/for-user/{user_id}
Gợi ý sách cá nhân hóa cho người dùng

**Query Parameters:**
- `limit` (optional): Số lượng gợi ý (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "title": "Refactoring",
      "category": "Công nghệ thông tin",
      "authors": ["Martin Fowler"],
      "reason": "Based on your interest in Công nghệ thông tin"
    }
  ]
}
```

### GET /recommendations/popular
Lấy sách phổ biến

### GET /analytics/borrowing-trends
Phân tích xu hướng mượn sách

**Query Parameters:**
- `days` (optional): Số ngày phân tích (default: 30)

### GET /analytics/category-distribution
Phân bố sách theo thể loại

### GET /analytics/user-activity
Phân tích hoạt động người dùng

### GET /anomaly/detect-unusual-patterns
Phát hiện bất thường trong hệ thống

### GET /anomaly/predict-demand/{book_id}
Dự đoán nhu cầu cho một cuốn sách

---

## 📝 Reviews Endpoints

### GET /reviews/book/:bookId
Lấy đánh giá của một cuốn sách

### POST /reviews (requires auth)
Tạo đánh giá mới

**Request Body:**
```json
{
  "bookId": "uuid",
  "rating": 5,
  "comment": "Great book!"
}
```

### PUT /reviews/:id (requires auth)
Cập nhật đánh giá

### DELETE /reviews/:id (requires auth)
Xóa đánh giá

---

## 🔔 Notifications Endpoints

### GET /notifications (requires auth)
Lấy thông báo của người dùng

### PUT /notifications/:id/read (requires auth)
Đánh dấu đã đọc

### PUT /notifications/read-all (requires auth)
Đánh dấu tất cả đã đọc

---

## ⚠️ Violations Endpoints

### GET /violations (requires ADMIN/LIBRARIAN)
Lấy danh sách vi phạm

### PUT /violations/:id/resolve (requires ADMIN/LIBRARIAN)
Xử lý vi phạm

---

## ⚙️ System Config Endpoints

### GET /system-config
Lấy cấu hình hệ thống

### PUT /system-config (requires ADMIN)
Cập nhật cấu hình hệ thống

**Request Body:**
```json
{
  "libraryName": "Thư viện Trường Đại học",
  "maxBooksPerUser": 5,
  "defaultBorrowDays": 14,
  "maxRenewalCount": 1,
  "lateFeePerDay": 5000,
  "damageFeePercentage": 20
}
```

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

## Swagger Documentation

Interactive API documentation is available at:
- Backend: `http://localhost:3000/api`
- Python Service: `http://localhost:8000/docs`
