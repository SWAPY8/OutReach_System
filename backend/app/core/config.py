import os
from pathlib import Path
from typing import List
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings

# Absolute path to backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_FILE = BACKEND_DIR / "data" / "review_app.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "OutReach Review System"
    # Supports JWT_SECRET (recommended for Render/production) and SECRET_KEY
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-only-for-demo-use",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    FRONTEND_BASE_URL: str = Field(
        default="http://localhost:5173",
        validation_alias=AliasChoices("FRONTEND_BASE_URL", "FRONTEND_URL")
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Returns clean list of CORS origins with trailing slashes stripped to match browser Origin headers."""
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def clean_frontend_base_url(self) -> str:
        """Returns frontend base URL with trailing slash removed."""
        return self.FRONTEND_BASE_URL.strip().rstrip("/")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
