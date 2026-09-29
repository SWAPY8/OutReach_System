"""
ReviewTemplate document schema for MongoDB.
Document structure:
{
    _id: ObjectId,
    shop_id: ObjectId (ref: shops),
    category_id: ObjectId (ref: categories),
    review_text: str,
    is_active: bool,
    created_at: datetime (UTC),
    updated_at: datetime (UTC)
}
"""
