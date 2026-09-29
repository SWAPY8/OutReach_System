from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    shop_id: str
    category_id: str
    review_text: str = Field(..., min_length=5, max_length=1000)

class ReviewUpdate(BaseModel):
    shop_id: Optional[str] = None
    category_id: Optional[str] = None
    review_text: Optional[str] = Field(None, min_length=5, max_length=1000)
    is_active: Optional[bool] = None

class ReviewResponse(BaseModel):
    id: str
    shop_id: str
    shop_name: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    review_text: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
