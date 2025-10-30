from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter()

class BookClassificationRequest(BaseModel):
    title: str
    description: Optional[str] = None

class BookClassificationResponse(BaseModel):
    title: str
    predicted_category: str
    confidence: float
    top_categories: List[dict]

# Simple keyword-based classification (can be replaced with BERT model)
CATEGORY_KEYWORDS = {
    "Science Fiction": ["space", "future", "alien", "robot", "technology", "sci-fi", "cyberpunk", "dystopia"],
    "Fantasy": ["magic", "wizard", "dragon", "fantasy", "kingdom", "quest", "mythical", "enchanted"],
    "Mystery": ["detective", "murder", "crime", "mystery", "investigation", "clue", "suspect"],
    "Romance": ["love", "romance", "relationship", "heart", "passion", "wedding", "dating"],
    "Thriller": ["thriller", "suspense", "danger", "action", "spy", "conspiracy", "chase"],
    "Horror": ["horror", "ghost", "haunted", "terror", "fear", "nightmare", "monster"],
    "Biography": ["life", "biography", "memoir", "autobiography", "story of", "journey"],
    "History": ["history", "historical", "war", "ancient", "century", "era", "civilization"],
    "Self-Help": ["self-help", "motivation", "success", "habits", "productivity", "mindfulness"],
    "Business": ["business", "entrepreneur", "management", "leadership", "strategy", "marketing"],
    "Science": ["science", "research", "theory", "physics", "chemistry", "biology", "mathematics"],
    "Technology": ["technology", "programming", "computer", "software", "coding", "algorithm", "data"],
    "Children": ["children", "kids", "young", "illustrated", "picture book", "bedtime"],
    "Poetry": ["poetry", "poems", "verse", "rhyme", "lyric"],
    "Cooking": ["cooking", "recipe", "food", "cuisine", "chef", "kitchen", "baking"],
}

@router.post("/classify-book", response_model=BookClassificationResponse)
async def classify_book_category(request: BookClassificationRequest):
    """
    Classify book category based on title and description using NLP
    This is a simplified version - can be enhanced with BERT/DistilBERT
    """
    try:
        text = f"{request.title} {request.description or ''}".lower()
        
        # Calculate scores for each category
        category_scores = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = 0
            matched_keywords = []
            
            for keyword in keywords:
                # Count occurrences of keyword
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text))
                if count > 0:
                    score += count
                    matched_keywords.append(keyword)
            
            if score > 0:
                category_scores[category] = {
                    "score": score,
                    "matched_keywords": matched_keywords
                }
        
        if not category_scores:
            return BookClassificationResponse(
                title=request.title,
                predicted_category="General",
                confidence=0.5,
                top_categories=[{"category": "General", "confidence": 0.5}]
            )
        
        # Sort categories by score
        sorted_categories = sorted(
            category_scores.items(),
            key=lambda x: x[1]["score"],
            reverse=True
        )
        
        # Calculate confidence (normalized score)
        total_score = sum(cat[1]["score"] for cat in sorted_categories)
        top_category = sorted_categories[0]
        confidence = top_category[1]["score"] / total_score if total_score > 0 else 0
        
        # Prepare top categories
        top_categories = [
            {
                "category": cat[0],
                "confidence": round(cat[1]["score"] / total_score, 3),
                "matched_keywords": cat[1]["matched_keywords"][:5]
            }
            for cat in sorted_categories[:5]
        ]
        
        return BookClassificationResponse(
            title=request.title,
            predicted_category=top_category[0],
            confidence=round(confidence, 3),
            top_categories=top_categories
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error classifying book: {str(e)}")


class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10

@router.post("/semantic-search")
async def semantic_search(request: SemanticSearchRequest):
    """
    Semantic search for books using natural language queries
    This is a placeholder - should be implemented with Sentence Transformers
    """
    try:
        # This would use sentence-transformers in production
        # For now, return a simple keyword-based search structure
        
        query_lower = request.query.lower()
        
        # Extract potential search terms
        search_terms = {
            "keywords": query_lower.split(),
            "intent": "search",
            "filters": {}
        }
        
        # Detect intent patterns
        if any(word in query_lower for word in ["recommend", "suggest", "similar"]):
            search_terms["intent"] = "recommendation"
        elif any(word in query_lower for word in ["popular", "best", "top"]):
            search_terms["intent"] = "popular"
        elif any(word in query_lower for word in ["new", "recent", "latest"]):
            search_terms["intent"] = "new_arrivals"
        
        # Extract category if mentioned
        for category in CATEGORY_KEYWORDS.keys():
            if category.lower() in query_lower:
                search_terms["filters"]["category"] = category
                break
        
        return {
            "query": request.query,
            "parsed_query": search_terms,
            "message": "Semantic search parsed successfully. Integrate with database for results."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in semantic search: {str(e)}")


@router.post("/text-to-sql")
async def text_to_sql(query: str):
    """
    Convert natural language query to SQL
    Example: "Top 5 most borrowed books" -> SQL query
    """
    try:
        query_lower = query.lower()
        
        # Simple pattern matching for common queries
        sql_query = None
        
        if "most borrowed" in query_lower or "popular" in query_lower:
            limit = 10
            if "top" in query_lower:
                # Extract number
                import re
                numbers = re.findall(r'\d+', query_lower)
                if numbers:
                    limit = int(numbers[0])
            
            sql_query = f"""
                SELECT b.title, b.borrow_count, c.name as category
                FROM books b
                JOIN categories c ON b.category_id = c.id
                ORDER BY b.borrow_count DESC
                LIMIT {limit}
            """
        
        elif "overdue" in query_lower:
            sql_query = """
                SELECT u.email, b.title, br.due_date, 
                       CURRENT_DATE - br.due_date as days_overdue
                FROM borrowings br
                JOIN users u ON br.user_id = u.id
                JOIN books b ON br.book_id = b.id
                WHERE br.status = 'overdue'
                ORDER BY days_overdue DESC
            """
        
        elif "available" in query_lower and "books" in query_lower:
            sql_query = """
                SELECT b.title, b.available_copies, c.name as category
                FROM books b
                JOIN categories c ON b.category_id = c.id
                WHERE b.available_copies > 0
                ORDER BY b.title
            """
        
        else:
            return {
                "query": query,
                "sql": None,
                "message": "Could not parse query. Please try: 'top 5 most borrowed books', 'overdue books', 'available books'"
            }
        
        return {
            "query": query,
            "sql": sql_query.strip(),
            "message": "SQL generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting text to SQL: {str(e)}")
