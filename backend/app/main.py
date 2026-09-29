from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import ensure_indexes, close_connection, get_database
from app.routers import (
    auth,
    admin_shops,
    admin_categories,
    admin_reviews,
    admin_dashboard,
    admin_sessions,
    public_review
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initialize MongoDB indexes on startup, close connection on shutdown."""
    # Startup: verify MongoDB connectivity and create indexes
    db = get_database()
    db.command("ping")  # Verify connectivity
    ensure_indexes()
    print(f"[MongoDB] Connected to database: {settings.MONGODB_DATABASE}")
    yield
    # Shutdown: close MongoDB client
    close_connection()
    print("[MongoDB] Connection closed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
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
        "version": "2.0.0",
        "database": "MongoDB Atlas",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
