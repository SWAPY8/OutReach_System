from bson import ObjectId
from fastapi import Depends, HTTPException, status
from pymongo.database import Database
from app.database.database import get_db
from app.core.security import oauth2_scheme, decode_access_token


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Database = Depends(get_db)
) -> dict:
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
        oid = ObjectId(admin_id)
    except Exception:
        raise credentials_exception
        
    admin = db.admins.find_one({"_id": oid})
    if admin is None:
        raise credentials_exception
    return admin
