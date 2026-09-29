from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from app.database.database import get_db
from app.schemas.auth import LoginRequest, Token, AdminResponse
from app.core.security import verify_password, create_access_token
from app.routers.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Database = Depends(get_db)):
    admin = db.admins.find_one({"email": login_data.email.lower().strip()})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    expires_delta = timedelta(days=30) if login_data.remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=str(admin["_id"]), expires_delta=expires_delta)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": AdminResponse(
            id=str(admin["_id"]),
            name=admin["name"],
            email=admin["email"],
            created_at=admin["created_at"]
        )
    }

@router.get("/me", response_model=AdminResponse)
def get_current_user_profile(admin: dict = Depends(get_current_admin)):
    return AdminResponse(
        id=str(admin["_id"]),
        name=admin["name"],
        email=admin["email"],
        created_at=admin["created_at"]
    )
