from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base

class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, index=True, nullable=False)
    tagline = Column(String(255), nullable=True, default="Great Service. Better Experience.")
    review_url = Column(String(500), nullable=False)
    qr_token = Column(String(64), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    review_templates = relationship("ReviewTemplate", back_populates="shop", cascade="all, delete-orphan")
    review_sessions = relationship("ReviewSession", back_populates="shop", cascade="all, delete-orphan")
