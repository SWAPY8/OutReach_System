"""
Admin document schema for MongoDB.
Document structure:
{
    _id: ObjectId,
    name: str,
    email: str (unique, lowercase),
    password_hash: str,
    created_at: datetime (UTC)
}
"""
