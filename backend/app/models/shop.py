"""
Shop document schema for MongoDB.
Document structure:
{
    _id: ObjectId,
    name: str,
    slug: str (unique),
    tagline: str,
    review_url: str,
    qr_token: str (unique),
    is_active: bool,
    created_at: datetime (UTC),
    updated_at: datetime (UTC)
}
"""
