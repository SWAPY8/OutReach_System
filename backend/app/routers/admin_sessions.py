from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.admin import Admin
from app.models.review_session import ReviewSession
from app.schemas.session import SessionDetailResponse
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/api/admin/sessions", tags=["admin-sessions"])

@router.get("", response_model=List[SessionDetailResponse])
def get_sessions(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sessions = db.query(ReviewSession).order_by(ReviewSession.created_at.desc()).limit(100).all()
    results = []
    for s in sessions:
        results.append(SessionDetailResponse(
            id=s.id,
            session_token=s.session_token,
            shop_id=s.shop_id,
            shop_name=s.shop.name if s.shop else "Unknown",
            review_id=s.selected_review_id,
            review_text=s.selected_review.review_text if s.selected_review else None,
            category_name=s.selected_review.category.name if (s.selected_review and s.selected_review.category) else None,
            selected_at=s.selected_at,
            copied_at=s.copied_at,
            redirected_at=s.redirected_at,
            created_at=s.created_at
        ))
    return results
