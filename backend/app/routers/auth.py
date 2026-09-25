from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, Token, AdminResponse
from app.core.security import verify_password, create_access_token
from app.routers.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == login_data.email.lower().strip()).first()
    if not admin or not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    expires_delta = timedelta(days=30) if login_data.remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=str(admin.id), expires_delta=expires_delta)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": AdminResponse.model_validate(admin)
    }

@router.get("/me", response_model=AdminResponse)
def get_current_user_profile(admin: Admin = Depends(get_current_admin)):
    return AdminResponse.model_validate(admin)
