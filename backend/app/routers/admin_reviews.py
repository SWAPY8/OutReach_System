from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.admin import Admin
from app.models.shop import Shop
from app.models.category import Category
from app.models.review import ReviewTemplate
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/api/admin/reviews", tags=["admin-reviews"])

def format_review_response(rev: ReviewTemplate) -> ReviewResponse:
    return ReviewResponse(
        id=rev.id,
        shop_id=rev.shop_id,
        shop_name=rev.shop.name if rev.shop else None,
        category_id=rev.category_id,
        category_name=rev.category.name if rev.category else None,
        category_icon=rev.category.icon if rev.category else "star",
        review_text=rev.review_text,
        is_active=rev.is_active,
        created_at=rev.created_at,
        updated_at=rev.updated_at
    )

@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    shop_id: Optional[int] = Query(None, description="Filter by shop ID"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ReviewTemplate)
    if shop_id is not None:
        query = query.filter(ReviewTemplate.shop_id == shop_id)
    if category_id is not None:
        query = query.filter(ReviewTemplate.category_id == category_id)
    if is_active is not None:
        query = query.filter(ReviewTemplate.is_active == is_active)
    
    reviews = query.order_by(ReviewTemplate.id.desc()).all()
    return [format_review_response(r) for r in reviews]

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == review_in.shop_id).first()
    if not shop:
        raise HTTPException(status_code=400, detail="Shop does not exist")

    category = db.query(Category).filter(Category.id == review_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist")

    review = ReviewTemplate(
        shop_id=review_in.shop_id,
        category_id=review_in.category_id,
        review_text=review_in.review_text.strip(),
        is_active=True
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return format_review_response(review)

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(ReviewTemplate).filter(ReviewTemplate.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return format_review_response(review)

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_in: ReviewUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(ReviewTemplate).filter(ReviewTemplate.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review_in.shop_id is not None:
        shop = db.query(Shop).filter(Shop.id == review_in.shop_id).first()
        if not shop:
            raise HTTPException(status_code=400, detail="Shop does not exist")
        review.shop_id = review_in.shop_id

    if review_in.category_id is not None:
        category = db.query(Category).filter(Category.id == review_in.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category does not exist")
        review.category_id = review_in.category_id

    if review_in.review_text is not None:
        review.review_text = review_in.review_text.strip()
    if review_in.is_active is not None:
        review.is_active = review_in.is_active

    db.commit()
    db.refresh(review)
    return format_review_response(review)

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    review = db.query(ReviewTemplate).filter(ReviewTemplate.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return None
