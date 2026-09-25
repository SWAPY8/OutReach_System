from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.shop import ShopResponse

class DashboardStats(BaseModel):
    total_shops: int
    total_categories: int
    total_reviews: int
    total_sessions: int
    recent_shops: List[ShopResponse]
