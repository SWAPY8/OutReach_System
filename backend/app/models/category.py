"""
Category document schema for MongoDB.
Document structure:
{
    _id: ObjectId,
    name: str (unique, case-insensitive),
    description: str or None,
    icon: str (default "star"),
    is_active: bool,
    created_at: datetime (UTC)
}
"""
