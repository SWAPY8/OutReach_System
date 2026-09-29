from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class AdminResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse
