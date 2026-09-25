from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.admin import Admin
from app.models.category import Category
from app.models.review import ReviewTemplate
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.routers.deps import get_current_admin

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])

def format_category_response(cat: Category, db: Session) -> CategoryResponse:
    review_count = db.query(func.count(ReviewTemplate.id)).filter(ReviewTemplate.category_id == cat.id).scalar() or 0
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        description=cat.description,
        icon=cat.icon,
        is_active=cat.is_active,
        created_at=cat.created_at,
        review_count=review_count
    )

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    categories = db.query(Category).order_by(Category.id.asc()).all()
    return [format_category_response(c, db) for c in categories]

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(Category.name.ilike(cat_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    category = Category(
        name=cat_in.name.strip(),
        description=cat_in.description.strip() if cat_in.description else None,
        icon=cat_in.icon.strip() if cat_in.icon else "star",
        is_active=True
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return format_category_response(category, db)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return format_category_response(category, db)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    cat_in: CategoryUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if cat_in.name is not None:
        name_clean = cat_in.name.strip()
        existing = db.query(Category).filter(Category.name.ilike(name_clean), Category.id != category_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another category already has this name")
        category.name = name_clean

    if cat_in.description is not None:
        category.description = cat_in.description.strip() if cat_in.description else None
    if cat_in.icon is not None:
        category.icon = cat_in.icon.strip()
    if cat_in.is_active is not None:
        category.is_active = cat_in.is_active

    db.commit()
    db.refresh(category)
    return format_category_response(category, db)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if review templates exist for this category
    reviews_count = db.query(ReviewTemplate).filter(ReviewTemplate.category_id == category_id).count()
    if reviews_count > 0:
        # Instead of breaking FK constraints, deactivate the category or delete associated templates if specified
        # Let's delete reviews or raise error:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category because {reviews_count} review templates are using it. You can deactivate it instead."
        )

    db.delete(category)
    db.commit()
    return None
