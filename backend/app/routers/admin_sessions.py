from typing import List
from fastapi import APIRouter, Depends
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.session import SessionDetailResponse
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/api/admin/sessions", tags=["admin-sessions"])

@router.get("", response_model=List[SessionDetailResponse])
def get_sessions(
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    sessions = list(db.review_sessions.find().sort("created_at", -1).limit(100))
    results = []
    for s in sessions:
        # Look up related shop
        shop = db.shops.find_one({"_id": s["shop_id"]}) if s.get("shop_id") else None
        shop_name = shop["name"] if shop else "Unknown"
        
        # Look up related review and category
        review_text = None
        category_name = None
        if s.get("selected_review_id"):
            review = db.review_templates.find_one({"_id": s["selected_review_id"]})
            if review:
                review_text = review["review_text"]
                category = db.categories.find_one({"_id": review["category_id"]}) if review.get("category_id") else None
                category_name = category["name"] if category else None
        
        results.append(SessionDetailResponse(
            id=str(s["_id"]),
            session_token=s["session_token"],
            shop_id=str(s["shop_id"]),
            shop_name=shop_name,
            review_id=str(s["selected_review_id"]) if s.get("selected_review_id") else None,
            review_text=review_text,
            category_name=category_name,
            selected_at=s.get("selected_at"),
            copied_at=s.get("copied_at"),
            redirected_at=s.get("redirected_at"),
            created_at=s["created_at"]
        ))
    return results
