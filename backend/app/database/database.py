"""
MongoDB database connection module.
Provides a PyMongo client, database reference, and FastAPI dependency.
"""
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings

# Global PyMongo client — initialized on import
_client: MongoClient = None
_db: Database = None


def get_mongo_client() -> MongoClient:
    """Returns the global MongoClient, creating it lazily if needed."""
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI)
    return _client


def get_database() -> Database:
    """Returns the application MongoDB database instance."""
    global _db
    if _db is None:
        _db = get_mongo_client()[settings.MONGODB_DATABASE]
    return _db


def get_db() -> Database:
    """FastAPI dependency that yields the MongoDB database instance.
    
    This is the primary dependency injected into all routers.
    Unlike SQLAlchemy, PyMongo connections are pooled automatically
    so there is no session lifecycle to manage.
    """
    return get_database()


def ensure_indexes():
    """Creates all required indexes on MongoDB collections.
    
    Called once during application startup. All index creations
    are idempotent (createIndex is a no-op if the index already exists).
    """
    db = get_database()

    # admins collection
    db.admins.create_index("email", unique=True)

    # shops collection
    db.shops.create_index("slug", unique=True)
    db.shops.create_index("qr_token", unique=True)

    # categories collection
    db.categories.create_index(
        [("name", 1)],
        unique=True,
        collation={"locale": "en", "strength": 2}  # case-insensitive uniqueness
    )

    # review_templates collection
    db.review_templates.create_index("shop_id")
    db.review_templates.create_index("category_id")
    db.review_templates.create_index([("shop_id", 1), ("category_id", 1)])

    # review_sessions collection
    db.review_sessions.create_index("session_token", unique=True)
    db.review_sessions.create_index("shop_id")


def close_connection():
    """Closes the MongoDB client connection. Called on application shutdown."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
