from fastapi import APIRouter, HTTPException
from typing import List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import httpx
import os

router = APIRouter()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


async def fetch_books():
    """Fetch all books from backend"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BACKEND_URL}/books", params={"limit": 1000})
        if response.status_code == 200:
            return response.json().get("data", [])
        return []


async def fetch_user_borrowings(user_id: str):
    """Fetch user's borrowing history"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BACKEND_URL}/borrowing", params={"userId": user_id, "limit": 100}
        )
        if response.status_code == 200:
            return response.json().get("data", [])
        return []


def content_based_filtering(books: List[dict], target_book_id: str, top_n: int = 5):
    """
    Content-based filtering using book metadata
    Recommends books similar to the target book based on category, authors, description
    """
    if not books:
        return []

    # Find target book
    target_book = next((b for b in books if b["id"] == target_book_id), None)
    if not target_book:
        return []

    # Create feature vectors from book metadata
    features = []
    for book in books:
        # Combine category, authors, and description
        category = book.get("category", {}).get("name", "")
        authors = " ".join([a.get("author", {}).get("name", "") for a in book.get("authors", [])])
        description = book.get("description", "")
        title = book.get("title", "")

        feature_text = f"{title} {category} {authors} {description}"
        features.append(feature_text)

    # TF-IDF vectorization
    vectorizer = TfidfVectorizer(stop_words="english", max_features=100)
    tfidf_matrix = vectorizer.fit_transform(features)

    # Calculate cosine similarity
    target_idx = next((i for i, b in enumerate(books) if b["id"] == target_book_id), None)
    if target_idx is None:
        return []

    similarities = cosine_similarity(tfidf_matrix[target_idx:target_idx + 1], tfidf_matrix)[0]

    # Get top N similar books (excluding the target book itself)
    similar_indices = similarities.argsort()[::-1][1 : top_n + 1]

    recommendations = []
    for idx in similar_indices:
        book = books[idx]
        recommendations.append(
            {
                "id": book["id"],
                "title": book["title"],
                "category": book.get("category", {}).get("name"),
                "authors": [a.get("author", {}).get("name") for a in book.get("authors", [])],
                "similarity_score": float(similarities[idx]),
                "reason": "Similar content and category",
            }
        )

    return recommendations


def collaborative_filtering(books: List[dict], borrowings: List[dict], user_id: str, top_n: int = 5):
    """
    Collaborative filtering based on user borrowing patterns
    Recommends books that similar users have borrowed
    """
    if not borrowings:
        return []

    # Get books the user has borrowed
    user_book_ids = set()
    for borrowing in borrowings:
        if borrowing.get("userId") == user_id:
            user_book_ids.add(borrowing.get("bookId"))

    # Find books from the same categories
    user_categories = set()
    for book in books:
        if book["id"] in user_book_ids:
            category = book.get("category", {}).get("name")
            if category:
                user_categories.add(category)

    # Recommend books from same categories that user hasn't borrowed
    recommendations = []
    for book in books:
        if book["id"] not in user_book_ids:
            category = book.get("category", {}).get("name")
            if category in user_categories:
                recommendations.append(
                    {
                        "id": book["id"],
                        "title": book["title"],
                        "category": category,
                        "authors": [a.get("author", {}).get("name") for a in book.get("authors", [])],
                        "reason": f"Based on your interest in {category}",
                    }
                )

    return recommendations[:top_n]


@router.get("/for-book/{book_id}")
async def get_book_recommendations(book_id: str, limit: int = 5):
    """
    Get book recommendations based on a specific book (content-based)
    """
    try:
        books = await fetch_books()
        recommendations = content_based_filtering(books, book_id, limit)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/for-user/{user_id}")
async def get_user_recommendations(user_id: str, limit: int = 10):
    """
    Get personalized book recommendations for a user (hybrid approach)
    """
    try:
        books = await fetch_books()
        borrowings = await fetch_user_borrowings(user_id)

        # Collaborative filtering
        collab_recs = collaborative_filtering(books, borrowings, user_id, limit)

        # If user has borrowing history, also add content-based recommendations
        if borrowings:
            # Get the most recent borrowed book
            recent_borrowing = max(borrowings, key=lambda x: x.get("createdAt", ""))
            recent_book_id = recent_borrowing.get("bookId")

            if recent_book_id:
                content_recs = content_based_filtering(books, recent_book_id, limit // 2)
                # Combine and deduplicate
                all_recs = collab_recs + content_recs
                seen_ids = set()
                unique_recs = []
                for rec in all_recs:
                    if rec["id"] not in seen_ids:
                        seen_ids.add(rec["id"])
                        unique_recs.append(rec)
                return {"recommendations": unique_recs[:limit]}

        return {"recommendations": collab_recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/popular")
async def get_popular_books(limit: int = 10):
    """
    Get popular books based on borrowing frequency
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BACKEND_URL}/analytics/popular-books")
            if response.status_code == 200:
                books = response.json()
                return {"recommendations": books[:limit]}
        return {"recommendations": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
