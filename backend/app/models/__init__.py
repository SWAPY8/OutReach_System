"""
MongoDB collection name constants and helper utilities.
With MongoDB/PyMongo, we don't need ORM model classes.
Collections are accessed directly via db["collection_name"].
"""

# Collection name constants
ADMINS = "admins"
SHOPS = "shops"
CATEGORIES = "categories"
REVIEW_TEMPLATES = "review_templates"
REVIEW_SESSIONS = "review_sessions"
