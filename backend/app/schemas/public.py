from typing import List, Optional
from pydantic import BaseModel

class PublicReviewItem(BaseModel):
    id: str
    review_text: str

class PublicCategoryItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: str
    reviews: List[PublicReviewItem]

class PublicShopItem(BaseModel):
    id: str
    name: str
    tagline: Optional[str] = None
    review_url: str
    qr_token: str

class PublicShopReviewPageResponse(BaseModel):
    shop: PublicShopItem
    categories: List[PublicCategoryItem]
