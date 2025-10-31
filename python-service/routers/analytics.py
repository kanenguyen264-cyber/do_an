from fastapi import APIRouter, HTTPException
from typing import List, Dict
import httpx
import os
from collections import Counter
from datetime import datetime, timedelta

router = APIRouter()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


@router.get("/borrowing-trends")
async def get_borrowing_trends(days: int = 30):
    """
    Analyze borrowing trends over the specified number of days
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/borrowing", params={"limit": 1000})
            if response.status_code != 200:
                return {"trends": []}

            borrowings = response.json().get("data", [])

            # Group by date
            date_counts = Counter()
            cutoff_date = datetime.now() - timedelta(days=days)

            for borrowing in borrowings:
                created_at = datetime.fromisoformat(borrowing["createdAt"].replace("Z", "+00:00"))
                if created_at >= cutoff_date:
                    date_key = created_at.strftime("%Y-%m-%d")
                    date_counts[date_key] += 1

            # Convert to list of dicts
            trends = [{"date": date, "count": count} for date, count in sorted(date_counts.items())]

            return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category-distribution")
async def get_category_distribution():
    """
    Get distribution of books by category
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/books", params={"limit": 1000})
            if response.status_code != 200:
                return {"distribution": []}

            books = response.json().get("data", [])

            # Count by category
            category_counts = Counter()
            for book in books:
                category = book.get("category", {}).get("name", "Unknown")
                category_counts[category] += 1

            distribution = [
                {"category": cat, "count": count} for cat, count in category_counts.most_common()
            ]

            return {"distribution": distribution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-activity")
async def get_user_activity():
    """
    Analyze user activity patterns
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/borrowing", params={"limit": 1000})
            if response.status_code != 200:
                return {"activity": []}

            borrowings = response.json().get("data", [])

            # Count borrowings per user
            user_counts = Counter()
            for borrowing in borrowings:
                user_id = borrowing.get("userId")
                if user_id:
                    user_counts[user_id] += 1

            # Get top active users
            top_users = [
                {"userId": user_id, "borrowCount": count}
                for user_id, count in user_counts.most_common(10)
            ]

            return {"topUsers": top_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
