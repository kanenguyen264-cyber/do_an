from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.item import Item

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get analytics summary"""
    total_items = db.query(func.count(Item.id)).scalar()
    active_items = db.query(func.count(Item.id)).filter(Item.is_active == True).scalar()
    total_value = db.query(func.sum(Item.price * Item.quantity)).scalar() or 0
    total_quantity = db.query(func.sum(Item.quantity)).scalar() or 0
    
    return {
        "total_items": total_items,
        "active_items": active_items,
        "inactive_items": total_items - active_items,
        "total_inventory_value": round(total_value, 2),
        "total_quantity": total_quantity
    }

@router.get("/top-items")
def get_top_items(limit: int = 5, db: Session = Depends(get_db)):
    """Get top items by value"""
    items = (
        db.query(Item)
        .filter(Item.is_active == True)
        .order_by((Item.price * Item.quantity).desc())
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
            "total_value": round(item.price * item.quantity, 2)
        }
        for item in items
    ]
