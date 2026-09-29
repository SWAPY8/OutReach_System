import re
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.shop import ShopCreate, ShopUpdate, ShopResponse, ShopQRResponse
from app.routers.deps import get_current_admin
from app.core.security import generate_qr_token
from app.services.qr_service import get_customer_url, generate_qr_base64
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin/shops", tags=["admin-shops"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def format_shop_response(shop: dict, db: Database) -> ShopResponse:
    shop_id = shop["_id"]
    total_reviews = db.review_templates.count_documents({"shop_id": shop_id})
    total_sessions = db.review_sessions.count_documents({"shop_id": shop_id})
    
    return ShopResponse(
        id=str(shop_id),
        name=shop["name"],
        slug=shop["slug"],
        tagline=shop.get("tagline"),
        review_url=shop["review_url"],
        qr_token=shop["qr_token"],
        customer_url=get_customer_url(shop["qr_token"]),
        is_active=shop.get("is_active", True),
        created_at=shop.get("created_at", datetime.now(timezone.utc)),
        updated_at=shop.get("updated_at"),
        total_reviews=total_reviews,
        total_sessions=total_sessions
    )

@router.get("", response_model=List[ShopResponse])
def get_shops(
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    shops = list(db.shops.find().sort("created_at", -1))
    return [format_shop_response(s, db) for s in shops]

@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
def create_shop(
    shop_in: ShopCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    base_slug = slugify(shop_in.name) or "shop"
    slug = base_slug
    counter = 1
    while db.shops.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    qr_token = generate_qr_token()
    while db.shops.find_one({"qr_token": qr_token}):
        qr_token = generate_qr_token()

    now = datetime.now(timezone.utc)
    shop_doc = {
        "name": shop_in.name.strip(),
        "slug": slug,
        "tagline": shop_in.tagline.strip() if shop_in.tagline else "Great Service. Better Experience.",
        "review_url": shop_in.review_url.strip(),
        "qr_token": qr_token,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    result = db.shops.insert_one(shop_doc)
    shop_doc["_id"] = result.inserted_id
    return format_shop_response(shop_doc, db)

@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(
    shop_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop = db.shops.find_one({"_id": oid})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return format_shop_response(shop, db)

@router.put("/{shop_id}", response_model=ShopResponse)
def update_shop(
    shop_id: str,
    shop_in: ShopUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop = db.shops.find_one({"_id": oid})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    update_fields = {"updated_at": datetime.now(timezone.utc)}
    if shop_in.name is not None:
        update_fields["name"] = shop_in.name.strip()
    if shop_in.tagline is not None:
        update_fields["tagline"] = shop_in.tagline.strip()
    if shop_in.review_url is not None:
        update_fields["review_url"] = shop_in.review_url.strip()
    if shop_in.is_active is not None:
        update_fields["is_active"] = shop_in.is_active

    db.shops.update_one({"_id": oid}, {"$set": update_fields})
    updated_shop = db.shops.find_one({"_id": oid})
    return format_shop_response(updated_shop, db)

@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shop(
    shop_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop = db.shops.find_one({"_id": oid})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # Cascade delete: remove related review_templates and review_sessions
    db.review_templates.delete_many({"shop_id": oid})
    db.review_sessions.delete_many({"shop_id": oid})
    db.shops.delete_one({"_id": oid})
    return None

@router.get("/{shop_id}/qr", response_model=ShopQRResponse)
def get_shop_qr(
    shop_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Database = Depends(get_db)
):
    try:
        oid = ObjectId(shop_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop = db.shops.find_one({"_id": oid})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    customer_url = get_customer_url(shop["qr_token"])
    qr_data_url = generate_qr_base64(customer_url)

    return ShopQRResponse(
        shop_id=str(shop["_id"]),
        shop_name=shop["name"],
        qr_token=shop["qr_token"],
        customer_url=customer_url,
        qr_data_url=qr_data_url
    )
