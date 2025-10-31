from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import recommendations, analytics, anomaly_detection

load_dotenv()

app = FastAPI(
    title="Library AI Service",
    description="AI-powered recommendation and analytics service for library management",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(anomaly_detection.router, prefix="/anomaly", tags=["Anomaly Detection"])


@app.get("/")
async def root():
    return {
        "message": "Library AI Service",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/recommendations",
            "analytics": "/analytics",
            "anomaly_detection": "/anomaly",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PYTHON_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
