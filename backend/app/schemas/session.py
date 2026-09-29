from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SessionCreate(BaseModel):
    qr_token: str

class SessionSelectRequest(BaseModel):
    review_id: str

class SessionResponse(BaseModel):
    session_token: str
    shop_id: str
    selected_review_id: Optional[str] = None
    selected_at: Optional[datetime] = None
    copied_at: Optional[datetime] = None
    redirected_at: Optional[datetime] = None
    created_at: datetime

class SessionDetailResponse(BaseModel):
    id: str
    session_token: str
    shop_id: str
    shop_name: str
    review_id: Optional[str] = None
    review_text: Optional[str] = None
    category_name: Optional[str] = None
    selected_at: Optional[datetime] = None
    copied_at: Optional[datetime] = None
    redirected_at: Optional[datetime] = None
    created_at: datetime
