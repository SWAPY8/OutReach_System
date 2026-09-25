from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SessionCreate(BaseModel):
    qr_token: str

class SessionSelectRequest(BaseModel):
    review_id: int

class SessionResponse(BaseModel):
    session_token: str
    shop_id: int
    selected_review_id: Optional[int] = None
    selected_at: Optional[datetime] = None
    copied_at: Optional[datetime] = None
    redirected_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SessionDetailResponse(BaseModel):
    id: int
    session_token: str
    shop_id: int
    shop_name: str
    review_id: Optional[int] = None
    review_text: Optional[str] = None
    category_name: Optional[str] = None
    selected_at: Optional[datetime] = None
    copied_at: Optional[datetime] = None
    redirected_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
