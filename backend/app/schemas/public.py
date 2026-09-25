from typing import List, Optional
from pydantic import BaseModel

class PublicReviewItem(BaseModel):
    id: int
    review_text: str

class PublicCategoryItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: str
    reviews: List[PublicReviewItem]

class PublicShopItem(BaseModel):
    id: int
    name: str
    tagline: Optional[str] = None
    review_url: str
    qr_token: str

class PublicShopReviewPageResponse(BaseModel):
    shop: PublicShopItem
    categories: List[PublicCategoryItem]
