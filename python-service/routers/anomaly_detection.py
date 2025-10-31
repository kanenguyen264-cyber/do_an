from fastapi import APIRouter, HTTPException
from typing import List
import httpx
import os
from datetime import datetime, timedelta
import numpy as np

router = APIRouter()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


@router.get("/detect-unusual-patterns")
async def detect_unusual_patterns():
    """
    Detect unusual borrowing patterns that might indicate issues
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/borrowing", params={"limit": 1000})
            if response.status_code != 200:
                return {"anomalies": []}

            borrowings = response.json().get("data", [])

            anomalies = []

            # Check for users with excessive borrowings
            user_borrow_counts = {}
            for borrowing in borrowings:
                user_id = borrowing.get("userId")
                if user_id:
                    user_borrow_counts[user_id] = user_borrow_counts.get(user_id, 0) + 1

            # Calculate mean and std
            if user_borrow_counts:
                counts = list(user_borrow_counts.values())
                mean_count = np.mean(counts)
                std_count = np.std(counts)

                # Flag users with borrowings > mean + 2*std
                threshold = mean_count + 2 * std_count
                for user_id, count in user_borrow_counts.items():
                    if count > threshold:
                        anomalies.append(
                            {
                                "type": "excessive_borrowing",
                                "userId": user_id,
                                "borrowCount": count,
                                "threshold": threshold,
                                "message": f"User has {count} borrowings (threshold: {threshold:.1f})",
                            }
                        )

            # Check for overdue patterns
            overdue_count = sum(1 for b in borrowings if b.get("status") == "OVERDUE")
            if overdue_count > len(borrowings) * 0.2:  # More than 20% overdue
                anomalies.append(
                    {
                        "type": "high_overdue_rate",
                        "overdueCount": overdue_count,
                        "totalBorrowings": len(borrowings),
                        "rate": overdue_count / len(borrowings) if borrowings else 0,
                        "message": f"High overdue rate: {overdue_count}/{len(borrowings)}",
                    }
                )

            return {"anomalies": anomalies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predict-demand/{book_id}")
async def predict_book_demand(book_id: str):
    """
    Predict future demand for a specific book based on historical data
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/borrowing", params={"bookId": book_id, "limit": 100}
            )
            if response.status_code != 200:
                return {"prediction": "low"}

            borrowings = response.json().get("data", [])

            if not borrowings:
                return {"prediction": "low", "confidence": 0}

            # Simple prediction based on recent borrowing frequency
            recent_date = datetime.now() - timedelta(days=30)
            recent_borrowings = [
                b
                for b in borrowings
                if datetime.fromisoformat(b["createdAt"].replace("Z", "+00:00")) >= recent_date
            ]

            demand_level = "low"
            if len(recent_borrowings) > 10:
                demand_level = "high"
            elif len(recent_borrowings) > 5:
                demand_level = "medium"

            return {
                "prediction": demand_level,
                "recentBorrowings": len(recent_borrowings),
                "totalBorrowings": len(borrowings),
                "confidence": min(len(borrowings) / 20, 1.0),  # Max confidence at 20+ borrowings
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
