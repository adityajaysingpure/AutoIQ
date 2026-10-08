from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()

client = AsyncIOMotorClient(settings.mongo_uri)
db     = client[settings.db_name]


def get_db():
    return db


async def create_indexes() -> None:
    """
    Compound index on searches — (make, model) for the popular
    cars aggregation query called on every home page load.
    """
    await db.searches.create_index([("make", 1), ("model", 1)])
    await db.chat_sessions.create_index([("created_at", -1)])
