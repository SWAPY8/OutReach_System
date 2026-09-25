from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.shop import Shop
from app.models.category import Category
from app.models.review import ReviewTemplate
from app.models.review_session import ReviewSession
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
def get_public_shop_review_page(qr_token: str, db: Session = Depends(get_db)):
    clean_token = qr_token.strip()
    shop = db.query(Shop).filter((Shop.qr_token == clean_token) | (Shop.slug == clean_token)).first()
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found. Please check your QR code."
        )
    if not shop.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This QR code is currently inactive. Please contact the shop owner."
        )

    # Fetch active reviews for this shop grouped by category
    reviews = (
        db.query(ReviewTemplate)
        .join(Category, ReviewTemplate.category_id == Category.id)
        .filter(
            ReviewTemplate.shop_id == shop.id,
            ReviewTemplate.is_active == True,
            Category.is_active == True
        )
        .order_by(Category.id.asc(), ReviewTemplate.id.asc())
        .all()
    )

    categories_dict = {}
    for r in reviews:
        cat_id = r.category.id
        if cat_id not in categories_dict:
            categories_dict[cat_id] = {
                "category": r.category,
                "reviews": []
            }
        categories_dict[cat_id]["reviews"].append(
            PublicReviewItem(id=r.id, review_text=r.review_text)
        )

    categories_list = []
    for cat_data in categories_dict.values():
        cat = cat_data["category"]
        categories_list.append(
            PublicCategoryItem(
                id=cat.id,
                name=cat.name,
                description=cat.description,
                icon=cat.icon,
                reviews=cat_data["reviews"]
            )
        )

    return PublicShopReviewPageResponse(
        shop=PublicShopItem(
            id=shop.id,
            name=shop.name,
            tagline=shop.tagline or "Share Market & Trading Education",
            review_url=shop.review_url,
            qr_token=shop.qr_token
        ),
        categories=categories_list
    )

@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_customer_session(payload: SessionCreate, db: Session = Depends(get_db)):
    clean_token = payload.qr_token.strip()
    shop = db.query(Shop).filter((Shop.qr_token == clean_token) | (Shop.slug == clean_token)).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if not shop.is_active:
        raise HTTPException(status_code=403, detail="This shop is inactive")

    token = generate_session_token()
    session = ReviewSession(
        session_token=token,
        shop_id=shop.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        session_token=session.session_token,
        shop_id=session.shop_id,
        selected_review_id=session.selected_review_id,
        selected_at=session.selected_at,
        copied_at=session.copied_at,
        redirected_at=session.redirected_at,
        created_at=session.created_at
    )

@router.post("/sessions/{session_token}/select", response_model=SessionResponse)
def select_review_in_session(
    session_token: str,
    payload: SessionSelectRequest,
    db: Session = Depends(get_db)
):
    session = db.query(ReviewSession).filter(ReviewSession.session_token == session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    review = db.query(ReviewTemplate).filter(
        ReviewTemplate.id == payload.review_id,
        ReviewTemplate.shop_id == session.shop_id,
        ReviewTemplate.is_active == True
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="Selected review is not available")

    session.selected_review_id = review.id
    session.selected_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        session_token=session.session_token,
        shop_id=session.shop_id,
        selected_review_id=session.selected_review_id,
        selected_at=session.selected_at,
        copied_at=session.copied_at,
        redirected_at=session.redirected_at,
        created_at=session.created_at
    )

@router.post("/sessions/{session_token}/copy", response_model=SessionResponse)
def mark_review_copied(session_token: str, db: Session = Depends(get_db)):
    session = db.query(ReviewSession).filter(ReviewSession.session_token == session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    # If already copied, we still update timestamp or preserve first copy timestamp
    if not session.copied_at:
        session.copied_at = datetime.now(timezone.utc)
    else:
        # Also update so we know it was re-copied
        session.copied_at = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(session)

    return SessionResponse(
        session_token=session.session_token,
        shop_id=session.shop_id,
        selected_review_id=session.selected_review_id,
        selected_at=session.selected_at,
        copied_at=session.copied_at,
        redirected_at=session.redirected_at,
        created_at=session.created_at
    )

@router.post("/sessions/{session_token}/redirect", response_model=SessionResponse)
def mark_session_redirected(session_token: str, db: Session = Depends(get_db)):
    session = db.query(ReviewSession).filter(ReviewSession.session_token == session_token).first()
    if not session:
        raise HTTPException(status_code=404, detail="Review session not found")

    session.redirected_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        session_token=session.session_token,
        shop_id=session.shop_id,
        selected_review_id=session.selected_review_id,
        selected_at=session.selected_at,
        copied_at=session.copied_at,
        redirected_at=session.redirected_at,
        created_at=session.created_at
    )
