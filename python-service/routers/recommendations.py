from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

from database import get_db

router = APIRouter()

@router.get("/books/{user_id}")
async def get_book_recommendations(user_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get personalized book recommendations for a user based on borrowing history
    Uses collaborative filtering and content-based filtering
    """
    try:
        # Get user's borrowing history
        user_borrowings = db.execute("""
            SELECT b.id, b.title, b.description, c.name as category, 
                   array_agg(a.name) as authors
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            WHERE br.user_id = :user_id
            GROUP BY b.id, b.title, b.description, c.name
        """, {"user_id": user_id}).fetchall()

        if not user_borrowings:
            # Return popular books if no history
            popular_books = db.execute("""
                SELECT b.id, b.title, b.description, b.borrow_count, b.rating
                FROM books b
                WHERE b.available_copies > 0
                ORDER BY b.borrow_count DESC, b.rating DESC
                LIMIT :limit
            """, {"limit": limit}).fetchall()
            
            return {
                "recommendations": [
                    {
                        "book_id": book.id,
                        "title": book.title,
                        "description": book.description,
                        "score": book.borrow_count / 100.0,
                        "reason": "Popular book"
                    }
                    for book in popular_books
                ]
            }

        # Get all available books
        all_books = db.execute("""
            SELECT b.id, b.title, b.description, c.name as category,
                   array_agg(a.name) as authors, b.rating
            FROM books b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            WHERE b.available_copies > 0
            AND b.id NOT IN (
                SELECT book_id FROM borrowings WHERE user_id = :user_id
            )
            GROUP BY b.id, b.title, b.description, c.name, b.rating
        """, {"user_id": user_id}).fetchall()

        if not all_books:
            return {"recommendations": []}

        # Create feature vectors using TF-IDF
        user_books_text = [
            f"{book.title} {book.description} {book.category} {' '.join(book.authors or [])}"
            for book in user_borrowings
        ]
        
        all_books_text = [
            f"{book.title} {book.description} {book.category} {' '.join(book.authors or [])}"
            for book in all_books
        ]

        # Combine for vectorization
        all_text = user_books_text + all_books_text
        
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(all_text)

        # Calculate similarity between user's books and all books
        user_profile = tfidf_matrix[:len(user_books_text)].mean(axis=0)
        candidate_books = tfidf_matrix[len(user_books_text):]
        
        similarities = cosine_similarity(user_profile, candidate_books)[0]

        # Create recommendations with scores
        recommendations = []
        for idx, similarity_score in enumerate(similarities):
            book = all_books[idx]
            # Combine similarity score with rating
            final_score = (similarity_score * 0.7) + (book.rating / 5.0 * 0.3)
            
            recommendations.append({
                "book_id": book.id,
                "title": book.title,
                "description": book.description,
                "score": float(final_score),
                "similarity": float(similarity_score),
                "rating": float(book.rating),
                "reason": f"Similar to books you've read (similarity: {similarity_score:.2f})"
            })

        # Sort by score and return top N
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            "recommendations": recommendations[:limit],
            "total_candidates": len(all_books),
            "based_on_books": len(user_borrowings)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@router.get("/similar-books/{book_id}")
async def get_similar_books(book_id: str, limit: int = 5, db: Session = Depends(get_db)):
    """
    Get books similar to a specific book
    """
    try:
        # Get the target book
        target_book = db.execute("""
            SELECT b.id, b.title, b.description, c.name as category,
                   array_agg(a.name) as authors
            FROM books b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            WHERE b.id = :book_id
            GROUP BY b.id, b.title, b.description, c.name
        """, {"book_id": book_id}).fetchone()

        if not target_book:
            raise HTTPException(status_code=404, detail="Book not found")

        # Get all other books
        other_books = db.execute("""
            SELECT b.id, b.title, b.description, c.name as category,
                   array_agg(a.name) as authors, b.rating
            FROM books b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN book_authors ba ON b.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            WHERE b.id != :book_id AND b.available_copies > 0
            GROUP BY b.id, b.title, b.description, c.name, b.rating
        """, {"book_id": book_id}).fetchall()

        if not other_books:
            return {"similar_books": []}

        # Create feature vectors
        target_text = f"{target_book.title} {target_book.description} {target_book.category} {' '.join(target_book.authors or [])}"
        other_texts = [
            f"{book.title} {book.description} {book.category} {' '.join(book.authors or [])}"
            for book in other_books
        ]

        all_texts = [target_text] + other_texts
        
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        # Calculate similarities
        target_vector = tfidf_matrix[0:1]
        other_vectors = tfidf_matrix[1:]
        
        similarities = cosine_similarity(target_vector, other_vectors)[0]

        # Create results
        similar_books = []
        for idx, similarity_score in enumerate(similarities):
            book = other_books[idx]
            similar_books.append({
                "book_id": book.id,
                "title": book.title,
                "description": book.description,
                "similarity": float(similarity_score),
                "rating": float(book.rating),
                "category": book.category
            })

        # Sort by similarity
        similar_books.sort(key=lambda x: x['similarity'], reverse=True)
        
        return {
            "target_book": {
                "id": target_book.id,
                "title": target_book.title
            },
            "similar_books": similar_books[:limit]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar books: {str(e)}")
