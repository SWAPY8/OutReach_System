import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Absolute path to backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_FILE = BACKEND_DIR / "data" / "review_app.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "OutReach Review System"
    SECRET_KEY: str = "dev-secret-key-change-in-production-only-for-demo-use"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    FRONTEND_BASE_URL: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
