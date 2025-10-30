# FastAPI Service

Python microservice built with FastAPI and SQLAlchemy.

## Features

- **FastAPI Framework**: High-performance async API
- **SQLAlchemy ORM**: Database operations with PostgreSQL
- **Pydantic Validation**: Request/response validation
- **Auto Documentation**: Swagger UI and ReDoc
- **CORS Support**: Cross-origin resource sharing

## Setup

### 1. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Run the service

```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health status

### Items
- `POST /api/items` - Create item
- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/top-items` - Get top items by value

## Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest
```

## Docker

```bash
docker build -t python-service .
docker run -p 8000:8000 python-service
```
