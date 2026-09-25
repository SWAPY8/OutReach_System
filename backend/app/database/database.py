import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings, BACKEND_DIR

db_url = settings.DATABASE_URL

# Normalize SQLite path so it always points to backend/data/review_app.db
if db_url.startswith("sqlite:///"):
    raw_path = db_url.replace("sqlite:///", "")
    if not os.path.isabs(raw_path):
        resolved_path = (BACKEND_DIR / raw_path).resolve()
        db_url = f"sqlite:///{resolved_path.as_posix()}"
    else:
        resolved_path = Path(raw_path)
    
    # Ensure directory exists
    resolved_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
