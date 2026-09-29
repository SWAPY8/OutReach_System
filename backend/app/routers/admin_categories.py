import re
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.routers.deps import get_current_admin
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])

def format_category_response(cat: dict, db: Database) -> CategoryResponse:
    cat_id = cat["_id"]
    review_count = db.review_templates.count_documents({"category_id": cat_id})
    return CategoryResponse(
        id=str(cat_id),
        name=cat["name"],
        description=cat.get("description"),
        icon=cat.get("icon", "star"),
        is_active=cat.get("is_active", True),
        created_at=cat.get("created_at", datetime.now(timezone.utc)),
        review_count=review_count
    )

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    categories = list(db.categories.find().sort("_id", 1))
    return [format_category_response(c, db) for c in categories]

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    name_clean = cat_in.name.strip()
    # Case-insensitive check
    existing = db.categories.find_one(
        {"name": {"$regex": f"^{re.escape(name_clean)}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    now = datetime.now(timezone.utc)
    cat_doc = {
        "name": name_clean,
        "description": cat_in.description.strip() if cat_in.description else None,
        "icon": cat_in.icon.strip() if cat_in.icon else "star",
        "is_active": True,
        "created_at": now
    }
    result = db.categories.insert_one(cat_doc)
    cat_doc["_id"] = result.inserted_id
    return format_category_response(cat_doc, db)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = db.categories.find_one({"_id": oid})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return format_category_response(category, db)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    cat_in: CategoryUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = db.categories.find_one({"_id": oid})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_fields = {}
    if cat_in.name is not None:
        name_clean = cat_in.name.strip()
        existing = db.categories.find_one({
            "name": {"$regex": f"^{re.escape(name_clean)}$", "$options": "i"},
            "_id": {"$ne": oid}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Another category already has this name")
        update_fields["name"] = name_clean

    if cat_in.description is not None:
        update_fields["description"] = cat_in.description.strip() if cat_in.description else None
    if cat_in.icon is not None:
        update_fields["icon"] = cat_in.icon.strip()
    if cat_in.is_active is not None:
        update_fields["is_active"] = cat_in.is_active

    if update_fields:
        db.categories.update_one({"_id": oid}, {"$set": update_fields})
    
    updated_cat = db.categories.find_one({"_id": oid})
    return format_category_response(updated_cat, db)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(category_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = db.categories.find_one({"_id": oid})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if review templates exist for this category
    reviews_count = db.review_templates.count_documents({"category_id": oid})
    if reviews_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category because {reviews_count} review templates are using it. You can deactivate it instead."
        )

    db.categories.delete_one({"_id": oid})
    return None
