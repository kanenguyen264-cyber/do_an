# Fullstack Application

Ứng dụng fullstack với NestJS (Backend), ReactJS (Frontend), và FastAPI (Python Services).

## 🏗️ Kiến trúc

```
do_an/
├── backend/          # NestJS API Server
├── frontend/         # React + Vite + TailwindCSS
├── python-service/   # FastAPI Microservice
└── docker-compose.yml
```

## 🚀 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: class-validator

### Frontend (ReactJS)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router

### Python Service (FastAPI)
- **Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy)
- **Validation**: Pydantic
- **CORS**: FastAPI middleware

## 📦 Cài đặt

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- PostgreSQL (hoặc Supabase account)

### 1. Clone repository
```bash
git clone <repository-url>
cd do_an
```

### 2. Cấu hình environment variables
```bash
cp .env.example .env
# Cập nhật các biến môi trường trong file .env
```

### 3. Cài đặt Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### 4. Cài đặt Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 5. Cài đặt Python Service (FastAPI)
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 🐳 Docker

Chạy toàn bộ stack với Docker Compose:

```bash
docker-compose up -d
```

## 🌐 Endpoints

- **Frontend**: http://localhost:5173
- **NestJS API**: http://localhost:3001
- **FastAPI Service**: http://localhost:8000
- **FastAPI Docs**: http://localhost:8000/docs

## 📚 API Documentation

- NestJS Swagger: http://localhost:3001/api
- FastAPI Swagger: http://localhost:8000/docs

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Python Service Development
```bash
cd python-service
source venv/bin/activate
uvicorn main:app --reload
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Python Tests
```bash
cd python-service
pytest
```

## 📝 License

MIT