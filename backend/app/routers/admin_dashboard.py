from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.admin import Admin
from app.models.shop import Shop
from app.models.category import Category
from app.models.review import ReviewTemplate
from app.models.review_session import ReviewSession
from app.schemas.dashboard import DashboardStats
from app.schemas.shop import ShopResponse
from app.routers.deps import get_current_admin
from app.routers.admin_shops import format_shop_response

router = APIRouter(prefix="/api/admin/dashboard", tags=["admin-dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_shops = db.query(func.count(Shop.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_reviews = db.query(func.count(ReviewTemplate.id)).scalar() or 0
    total_sessions = db.query(func.count(ReviewSession.id)).scalar() or 0

    recent_shops_db = db.query(Shop).order_by(Shop.created_at.desc()).limit(5).all()
    recent_shops = [format_shop_response(s, db) for s in recent_shops_db]

    return DashboardStats(
        total_shops=total_shops,
        total_categories=total_categories,
        total_reviews=total_reviews,
        total_sessions=total_sessions,
        recent_shops=recent_shops
    )
