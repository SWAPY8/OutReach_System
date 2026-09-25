from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.security import oauth2_scheme, decode_access_token
from app.models.admin import Admin

def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    admin_id: str = payload.get("sub")
    if admin_id is None:
        raise credentials_exception
    
    try:
        admin_id_int = int(admin_id)
    except ValueError:
        raise credentials_exception
        
    admin = db.query(Admin).filter(Admin.id == admin_id_int).first()
    if admin is None:
        raise credentials_exception
    return admin
