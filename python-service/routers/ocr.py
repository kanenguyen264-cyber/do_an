from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import pytesseract
from PIL import Image
import io
import re
import httpx

router = APIRouter()

class ISBNExtractionResponse(BaseModel):
    isbn: Optional[str]
    confidence: float
    raw_text: str

class BookInfoResponse(BaseModel):
    isbn: str
    title: Optional[str]
    authors: Optional[list]
    publisher: Optional[str]
    published_date: Optional[str]
    description: Optional[str]
    cover_image: Optional[str]
    source: str

@router.post("/extract-isbn", response_model=ISBNExtractionResponse)
async def extract_isbn_from_image(file: UploadFile = File(...)):
    """
    Extract ISBN from book cover image using OCR
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Extract ISBN using regex
        # ISBN-10: 10 digits
        # ISBN-13: 13 digits (usually starts with 978 or 979)
        isbn_patterns = [
            r'ISBN[-:\s]*(97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d)',  # ISBN-13
            r'ISBN[-:\s]*(\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?[\dX])',  # ISBN-10
            r'(97[89]\d{10})',  # ISBN-13 without hyphens
            r'(\d{9}[\dX])',  # ISBN-10 without hyphens
        ]
        
        isbn = None
        for pattern in isbn_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                isbn = match.group(1).replace('-', '').replace(' ', '')
                break
        
        confidence = 0.8 if isbn else 0.0
        
        return ISBNExtractionResponse(
            isbn=isbn,
            confidence=confidence,
            raw_text=text[:500]  # Return first 500 chars
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting ISBN: {str(e)}")


@router.get("/book-info/{isbn}", response_model=BookInfoResponse)
async def get_book_info_from_isbn(isbn: str):
    """
    Fetch book information from Google Books API using ISBN
    """
    try:
        # Clean ISBN
        isbn_clean = isbn.replace('-', '').replace(' ', '')
        
        # Call Google Books API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.googleapis.com/books/v1/volumes",
                params={"q": f"isbn:{isbn_clean}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Google Books API error")
            
            data = response.json()
            
            if data.get("totalItems", 0) == 0:
                raise HTTPException(status_code=404, detail="Book not found")
            
            # Extract book info
            book = data["items"][0]["volumeInfo"]
            
            return BookInfoResponse(
                isbn=isbn_clean,
                title=book.get("title"),
                authors=book.get("authors", []),
                publisher=book.get("publisher"),
                published_date=book.get("publishedDate"),
                description=book.get("description"),
                cover_image=book.get("imageLinks", {}).get("thumbnail"),
                source="Google Books API"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching book info: {str(e)}")


@router.post("/extract-and-fetch")
async def extract_isbn_and_fetch_info(file: UploadFile = File(...)):
    """
    Extract ISBN from image and fetch book information in one call
    """
    try:
        # Extract ISBN
        isbn_result = await extract_isbn_from_image(file)
        
        if not isbn_result.isbn:
            return {
                "success": False,
                "message": "No ISBN found in image",
                "raw_text": isbn_result.raw_text
            }
        
        # Fetch book info
        try:
            book_info = await get_book_info_from_isbn(isbn_result.isbn)
            return {
                "success": True,
                "isbn_extraction": isbn_result,
                "book_info": book_info
            }
        except HTTPException as e:
            return {
                "success": False,
                "message": f"ISBN found but book info not available: {e.detail}",
                "isbn": isbn_result.isbn,
                "raw_text": isbn_result.raw_text
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in extraction and fetch: {str(e)}")
