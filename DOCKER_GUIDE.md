# 🐳 Docker Deployment Guide

## Hướng Dẫn Chạy Toàn Bộ Hệ Thống Bằng Docker

### 📋 Prerequisites

- Docker Desktop đã cài đặt
- Docker Compose đã cài đặt (thường đi kèm với Docker Desktop)

### 🚀 Cách 1: Chạy Tất Cả Services

#### Bước 1: Build và Start

```bash
# Từ thư mục root của project
docker-compose up --build
```

Hoặc chạy ở chế độ background (detached):

```bash
docker-compose up -d --build
```

#### Bước 2: Kiểm Tra Services

```bash
# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f python-service

# Kiểm tra status
docker-compose ps
```

#### Bước 3: Truy Cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Python API**: http://localhost:8000/docs

### 🛑 Dừng Services

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Dừng và xóa images
docker-compose down --rmi all
```

### 🔄 Rebuild Services

Nếu bạn thay đổi code và muốn rebuild:

```bash
# Rebuild tất cả
docker-compose up --build

# Rebuild service cụ thể
docker-compose up --build backend
docker-compose up --build frontend
docker-compose up --build python-service
```

### 🔧 Cách 2: Chạy Từng Service Riêng Lẻ

#### Backend

```bash
docker-compose up backend
```

#### Frontend

```bash
docker-compose up frontend
```

#### Python Service

```bash
docker-compose up python-service
```

### 📊 Monitoring

#### Xem Resource Usage

```bash
docker stats
```

#### Xem Logs Real-time

```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f backend
```

#### Exec vào Container

```bash
# Backend
docker exec -it library-backend sh

# Frontend
docker exec -it library-frontend sh

# Python
docker exec -it library-python sh
```

### 🐛 Troubleshooting

#### Lỗi Port Already in Use

```bash
# Tìm process đang dùng port
lsof -i :3001
lsof -i :5173
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Lỗi Build

```bash
# Xóa cache và rebuild
docker-compose build --no-cache

# Xóa tất cả containers và images cũ
docker-compose down --rmi all
docker system prune -a
```

#### Lỗi Database Connection

Kiểm tra biến môi trường `DATABASE_URL` trong `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:Thehoa2604@@db.kslaskzvzxlveqhgnaeh.supabase.co:5432/postgres
```

### 📝 Environment Variables

File `docker-compose.yml` đã được cấu hình với các biến môi trường cần thiết:

**Backend**:
- `NODE_ENV=development`
- `DATABASE_URL` - Supabase PostgreSQL
- `JWT_SECRET` - Secret key cho JWT
- `NEST_PORT=3001`

**Frontend**:
- `VITE_API_URL=http://localhost:3001`
- `VITE_PYTHON_API_URL=http://localhost:8000`

**Python Service**:
- `DATABASE_URL` - Supabase PostgreSQL
- `FASTAPI_ENV=development`

### 🔐 Production Deployment

Để deploy production, thay đổi trong `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - FASTAPI_ENV=production
```

Và đảm bảo thay đổi `JWT_SECRET` thành giá trị bảo mật.

### 📦 Docker Commands Cheat Sheet

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View running containers
docker-compose ps

# Restart service
docker-compose restart backend

# Remove stopped containers
docker-compose rm

# Execute command in container
docker-compose exec backend npm run migration:run
```

### 🎯 Health Checks

Services có health checks tự động:

- **Backend**: `http://localhost:3001/health`
- **Python**: `http://localhost:8000/health`

Docker sẽ tự động restart services nếu health check fail.

### 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd do_an

# 2. Start all services
docker-compose up -d --build

# 3. Wait for services to be healthy
docker-compose ps

# 4. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001/api
# Python: http://localhost:8000/docs

# 5. View logs
docker-compose logs -f

# 6. Stop when done
docker-compose down
```

### 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)

### ⚡ Performance Tips

1. **Use Multi-stage Builds**: Đã được implement trong Dockerfiles
2. **Layer Caching**: Dependencies được cache riêng
3. **Health Checks**: Tự động restart khi service fail
4. **Resource Limits**: Có thể thêm trong docker-compose.yml

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 🎉 Done!

Hệ thống của bạn đã sẵn sàng chạy hoàn toàn bằng Docker!
