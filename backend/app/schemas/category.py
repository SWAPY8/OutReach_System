from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    icon: str = Field("star", max_length=50)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    icon: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: str
    is_active: bool
    created_at: datetime
    review_count: Optional[int] = 0
