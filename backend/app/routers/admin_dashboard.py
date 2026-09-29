from fastapi import APIRouter, Depends
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.dashboard import DashboardStats
from app.routers.deps import get_current_admin
from app.routers.admin_shops import format_shop_response

router = APIRouter(prefix="/api/admin/dashboard", tags=["admin-dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    total_shops = db.shops.count_documents({})
    total_categories = db.categories.count_documents({})
    total_reviews = db.review_templates.count_documents({})
    total_sessions = db.review_sessions.count_documents({})

    recent_shops_docs = list(db.shops.find().sort("created_at", -1).limit(5))
    recent_shops = [format_shop_response(s, db) for s in recent_shops_docs]

    return DashboardStats(
        total_shops=total_shops,
        total_categories=total_categories,
        total_reviews=total_reviews,
        total_sessions=total_sessions,
        recent_shops=recent_shops
    )
