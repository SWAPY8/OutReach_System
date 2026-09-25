from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base

class ReviewSession(Base):
    __tablename__ = "review_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(64), unique=True, index=True, nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False)
    selected_review_id = Column(Integer, ForeignKey("review_templates.id", ondelete="SET NULL"), nullable=True)
    selected_at = Column(DateTime, nullable=True)
    copied_at = Column(DateTime, nullable=True)
    redirected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    shop = relationship("Shop", back_populates="review_sessions")
    selected_review = relationship("ReviewTemplate", back_populates="review_sessions")
