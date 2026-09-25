import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.admin import Admin
from app.models.shop import Shop
from app.models.review import ReviewTemplate
from app.models.review_session import ReviewSession
from app.schemas.shop import ShopCreate, ShopUpdate, ShopResponse, ShopQRResponse
from app.routers.deps import get_current_admin
from app.core.security import generate_qr_token
from app.services.qr_service import get_customer_url, generate_qr_base64

router = APIRouter(prefix="/api/admin/shops", tags=["admin-shops"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def format_shop_response(shop: Shop, db: Session) -> ShopResponse:
    total_reviews = db.query(func.count(ReviewTemplate.id)).filter(ReviewTemplate.shop_id == shop.id).scalar() or 0
    total_sessions = db.query(func.count(ReviewSession.id)).filter(ReviewSession.shop_id == shop.id).scalar() or 0
    
    return ShopResponse(
        id=shop.id,
        name=shop.name,
        slug=shop.slug,
        tagline=shop.tagline,
        review_url=shop.review_url,
        qr_token=shop.qr_token,
        customer_url=get_customer_url(shop.qr_token),
        is_active=shop.is_active,
        created_at=shop.created_at,
        updated_at=shop.updated_at,
        total_reviews=total_reviews,
        total_sessions=total_sessions
    )

@router.get("", response_model=List[ShopResponse])
def get_shops(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shops = db.query(Shop).order_by(Shop.created_at.desc()).all()
    return [format_shop_response(s, db) for s in shops]

@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
def create_shop(
    shop_in: ShopCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    base_slug = slugify(shop_in.name) or "shop"
    slug = base_slug
    counter = 1
    while db.query(Shop).filter(Shop.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    qr_token = generate_qr_token()
    while db.query(Shop).filter(Shop.qr_token == qr_token).first():
        qr_token = generate_qr_token()

    shop = Shop(
        name=shop_in.name.strip(),
        slug=slug,
        tagline=shop_in.tagline.strip() if shop_in.tagline else "Great Service. Better Experience.",
        review_url=shop_in.review_url.strip(),
        qr_token=qr_token,
        is_active=True
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return format_shop_response(shop, db)

@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(
    shop_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return format_shop_response(shop, db)

@router.put("/{shop_id}", response_model=ShopResponse)
def update_shop(
    shop_id: int,
    shop_in: ShopUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    if shop_in.name is not None:
        shop.name = shop_in.name.strip()
    if shop_in.tagline is not None:
        shop.tagline = shop_in.tagline.strip()
    if shop_in.review_url is not None:
        shop.review_url = shop_in.review_url.strip()
    if shop_in.is_active is not None:
        shop.is_active = shop_in.is_active

    db.commit()
    db.refresh(shop)
    return format_shop_response(shop, db)

@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shop(
    shop_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    db.delete(shop)
    db.commit()
    return None

@router.get("/{shop_id}/qr", response_model=ShopQRResponse)
def get_shop_qr(
    shop_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    customer_url = get_customer_url(shop.qr_token)
    qr_data_url = generate_qr_base64(customer_url)

    return ShopQRResponse(
        shop_id=shop.id,
        shop_name=shop.name,
        qr_token=shop.qr_token,
        customer_url=customer_url,
        qr_data_url=qr_data_url
    )
