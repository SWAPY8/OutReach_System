"""
ReviewSession document schema for MongoDB.
Document structure:
{
    _id: ObjectId,
    session_token: str (unique),
    shop_id: ObjectId (ref: shops),
    selected_review_id: ObjectId or None (ref: review_templates),
    selected_at: datetime or None,
    copied_at: datetime or None,
    redirected_at: datetime or None,
    created_at: datetime (UTC)
}
"""
