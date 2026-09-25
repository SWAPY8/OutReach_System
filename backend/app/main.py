from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import Base, engine
import app.models  # ensure models are registered
from app.routers import (
    auth,
    admin_shops,
    admin_categories,
    admin_reviews,
    admin_dashboard,
    admin_sessions,
    public_review
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = settings.cors_origins_list
if "*" not in origins:
    # also ensure 127.0.0.1 and localhost variations are included
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])
    origins = list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin_shops.router)
app.include_router(admin_categories.router)
app.include_router(admin_reviews.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_sessions.router)
app.include_router(public_review.router)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
