from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.routers.deps import get_current_admin
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin/reviews", tags=["admin-reviews"])

def format_review_response(rev: dict, db: Database) -> ReviewResponse:
    # Look up shop and category names
    shop = db.shops.find_one({"_id": rev["shop_id"]}) if rev.get("shop_id") else None
    category = db.categories.find_one({"_id": rev["category_id"]}) if rev.get("category_id") else None
    
    return ReviewResponse(
        id=str(rev["_id"]),
        shop_id=str(rev["shop_id"]),
        shop_name=shop["name"] if shop else None,
        category_id=str(rev["category_id"]),
        category_name=category["name"] if category else None,
        category_icon=category.get("icon", "star") if category else "star",
        review_text=rev["review_text"],
        is_active=rev.get("is_active", True),
        created_at=rev.get("created_at", datetime.now(timezone.utc)),
        updated_at=rev.get("updated_at")
    )

@router.get("", response_model=List[ReviewResponse])
def get_reviews(
    shop_id: Optional[str] = Query(None, description="Filter by shop ID"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    query_filter = {}
    if shop_id is not None:
        try:
            query_filter["shop_id"] = ObjectId(shop_id)
        except Exception:
            return []
    if category_id is not None:
        try:
            query_filter["category_id"] = ObjectId(category_id)
        except Exception:
            return []
    if is_active is not None:
        query_filter["is_active"] = is_active
    
    reviews = list(db.review_templates.find(query_filter).sort("_id", -1))
    return [format_review_response(r, db) for r in reviews]

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        shop_oid = ObjectId(review_in.shop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shop ID")
    
    shop = db.shops.find_one({"_id": shop_oid})
    if not shop:
        raise HTTPException(status_code=400, detail="Shop does not exist")

    try:
        cat_oid = ObjectId(review_in.category_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    category = db.categories.find_one({"_id": cat_oid})
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist")

    now = datetime.now(timezone.utc)
    review_doc = {
        "shop_id": shop_oid,
        "category_id": cat_oid,
        "review_text": review_in.review_text.strip(),
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    result = db.review_templates.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    return format_review_response(review_doc, db)

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review = db.review_templates.find_one({"_id": oid})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return format_review_response(review, db)

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: str,
    review_in: ReviewUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review = db.review_templates.find_one({"_id": oid})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    update_fields = {"updated_at": datetime.now(timezone.utc)}
    
    if review_in.shop_id is not None:
        try:
            shop_oid = ObjectId(review_in.shop_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid shop ID")
        shop = db.shops.find_one({"_id": shop_oid})
        if not shop:
            raise HTTPException(status_code=400, detail="Shop does not exist")
        update_fields["shop_id"] = shop_oid

    if review_in.category_id is not None:
        try:
            cat_oid = ObjectId(review_in.category_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid category ID")
        category = db.categories.find_one({"_id": cat_oid})
        if not category:
            raise HTTPException(status_code=400, detail="Category does not exist")
        update_fields["category_id"] = cat_oid

    if review_in.review_text is not None:
        update_fields["review_text"] = review_in.review_text.strip()
    if review_in.is_active is not None:
        update_fields["is_active"] = review_in.is_active

    db.review_templates.update_one({"_id": oid}, {"$set": update_fields})
    updated_review = db.review_templates.find_one({"_id": oid})
    return format_review_response(updated_review, db)

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review = db.review_templates.find_one({"_id": oid})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Also nullify any review_sessions that reference this review
    db.review_sessions.update_many(
        {"selected_review_id": oid},
        {"$set": {"selected_review_id": None}}
    )
    db.review_templates.delete_one({"_id": oid})
    return None
