from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.public import (
    PublicShopReviewPageResponse,
    PublicShopItem,
    PublicCategoryItem,
    PublicReviewItem
)
from app.schemas.session import SessionCreate, SessionResponse, SessionSelectRequest
from app.core.security import generate_session_token

router = APIRouter(prefix="/api/public", tags=["public-review"])

@router.get("/review/{qr_token}", response_model=PublicShopReviewPageResponse)
def get_public_shop_review_page(qr_token: str, db: Database = Depends(get_db)):
    clean_token = qr_token.strip()
    # Look up by qr_token or slug
    shop = db.shops.find_one({
        "$or": [
            {"qr_token": clean_token},
            {"slug": clean_token}
        ]
    })
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found. Please check your QR code."
        )
    if not shop.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This QR code is currently inactive. Please contact the shop owner."
        )

    shop_id = shop["_id"]

    # Fetch active reviews for this shop
    reviews = list(db.review_templates.find({
        "shop_id": shop_id,
        "is_active": True
    }).sort([("category_id", 1), ("_id", 1)]))

    # Group reviews by category
    categories_dict = {}
    for r in reviews:
        cat_id = r["category_id"]
        if cat_id not in categories_dict:
            # Look up category
            cat = db.categories.find_one({"_id": cat_id, "is_active": True})
            if not cat:
                continue  # Skip reviews for inactive/missing categories
            categories_dict[cat_id] = {
                "category": cat,
                "reviews": []
            }
        if cat_id in categories_dict:
            categories_dict[cat_id]["reviews"].append(
                PublicReviewItem(id=str(r["_id"]), review_text=r["review_text"])
            )

    categories_list = []
    for cat_data in categories_dict.values():
        cat = cat_data["category"]
        categories_list.append(
            PublicCategoryItem(
                id=str(cat["_id"]),
                name=cat["name"],
                description=cat.get("description"),
                icon=cat.get("icon", "star"),
                reviews=cat_data["reviews"]
            )
        )

    return PublicShopReviewPageResponse(
        shop=PublicShopItem(
            id=str(shop["_id"]),
            name=shop["name"],
            tagline=shop.get("tagline") or "Share Market & Trading Education",
            review_url=shop["review_url"],
            qr_token=shop["qr_token"]
        ),
        categories=categories_list
    )

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_customer_session(payload: SessionCreate, db: Database = Depends(get_db)):
    clean_token = payload.qr_token.strip()
    shop = db.shops.find_one({
        "$or": [
            {"qr_token": clean_token},
            {"slug": clean_token}
        ]
    })
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if not shop.get("is_active", True):
        raise HTTPException(status_code=403, detail="This shop is inactive")

    token = generate_session_token()
    now = datetime.now(timezone.utc)
    session_doc = {
        "session_token": token,
        "shop_id": shop["_id"],
        "selected_review_id": None,
        "selected_at": None,
        "copied_at": None,
        "redirected_at": None,
        "created_at": now
    }
    result = db.review_sessions.insert_one(session_doc)
    session_doc["_id"] = result.inserted_id

    return SessionResponse(
        session_token=session_doc["session_token"],
        shop_id=str(session_doc["shop_id"]),
        selected_review_id=None,
        selected_at=None,
        copied_at=None,
        redirected_at=None,
        created_at=session_doc["created_at"]
    )

@router.post("/sessions/{session_token}/select", response_model=SessionResponse)
def select_review_in_session(
    session_token: str,
    payload: SessionSelectRequest,
    db: Database = Depends(get_db)
):
    session = db.review_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    try:
        review_oid = ObjectId(payload.review_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Selected review is not available")

    review = db.review_templates.find_one({
        "_id": review_oid,
        "shop_id": session["shop_id"],
        "is_active": True
    })

    if not review:
        raise HTTPException(status_code=404, detail="Selected review is not available")

    now = datetime.now(timezone.utc)
    db.review_sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {
            "selected_review_id": review["_id"],
            "selected_at": now
        }}
    )
    
    updated_session = db.review_sessions.find_one({"_id": session["_id"]})

    return SessionResponse(
        session_token=updated_session["session_token"],
        shop_id=str(updated_session["shop_id"]),
        selected_review_id=str(updated_session["selected_review_id"]) if updated_session.get("selected_review_id") else None,
        selected_at=updated_session.get("selected_at"),
        copied_at=updated_session.get("copied_at"),
        redirected_at=updated_session.get("redirected_at"),
        created_at=updated_session["created_at"]
    )

@router.post("/sessions/{session_token}/copy", response_model=SessionResponse)
def mark_review_copied(session_token: str, db: Database = Depends(get_db)):
    session = db.review_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    now = datetime.now(timezone.utc)
    db.review_sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {"copied_at": now}}
    )
    
    updated_session = db.review_sessions.find_one({"_id": session["_id"]})

    return SessionResponse(
        session_token=updated_session["session_token"],
        shop_id=str(updated_session["shop_id"]),
        selected_review_id=str(updated_session["selected_review_id"]) if updated_session.get("selected_review_id") else None,
        selected_at=updated_session.get("selected_at"),
        copied_at=updated_session.get("copied_at"),
        redirected_at=updated_session.get("redirected_at"),
        created_at=updated_session["created_at"]
    )

@router.post("/sessions/{session_token}/redirect", response_model=SessionResponse)
def mark_session_redirected(session_token: str, db: Database = Depends(get_db)):
    session = db.review_sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    now = datetime.now(timezone.utc)
    db.review_sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {"redirected_at": now}}
    )
    
    updated_session = db.review_sessions.find_one({"_id": session["_id"]})

    return SessionResponse(
        session_token=updated_session["session_token"],
        shop_id=str(updated_session["shop_id"]),
        selected_review_id=str(updated_session["selected_review_id"]) if updated_session.get("selected_review_id") else None,
        selected_at=updated_session.get("selected_at"),
        copied_at=updated_session.get("copied_at"),
        redirected_at=updated_session.get("redirected_at"),
        created_at=updated_session["created_at"]
    )
