from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import engine, Base
from routers import items, analytics, recommendations, nlp, ocr, anomaly_detection

# Load environment variables
load_dotenv()

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Library Management AI Service",
    description="Python microservice with AI/ML capabilities for library management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router, prefix="/api/items", tags=["Items"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["AI Recommendations"])
app.include_router(nlp.router, prefix="/api/nlp", tags=["NLP & Text Analysis"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR & Image Recognition"])
app.include_router(anomaly_detection.router, prefix="/api/anomaly", tags=["Anomaly Detection"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Library Management AI Service!",
        "docs": "/docs",
        "version": "1.0.0",
        "features": [
            "AI Book Recommendations",
            "NLP Text Classification",
            "OCR ISBN Extraction",
            "Anomaly Detection",
            "Analytics & Reporting"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Library Management AI Service",
        "version": "1.0.0"
    }
