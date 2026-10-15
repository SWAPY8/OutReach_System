from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ShopBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    tagline: Optional[str] = Field(None, max_length=500)
    review_url: str = Field(..., min_length=5, max_length=2048)

class ShopCreate(ShopBase):
    is_active: Optional[bool] = True

class ShopUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    tagline: Optional[str] = Field(None, max_length=500)
    review_url: Optional[str] = Field(None, min_length=5, max_length=2048)
    is_active: Optional[bool] = None

class ShopResponse(ShopBase):
    id: str
    slug: str
    qr_token: str
    customer_url: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_reviews: Optional[int] = 0
    total_sessions: Optional[int] = 0

class ShopQRResponse(BaseModel):
    shop_id: str
    shop_name: str
    qr_token: str
    customer_url: str
    qr_data_url: Optional[str] = None
