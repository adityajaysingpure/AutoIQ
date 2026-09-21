from fastapi import APIRouter, Query
from core.database import get_db
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def get_search_history(limit: int = Query(20, le=100)):
    """Return recent car searches ordered newest first."""
    db = get_db()
    records = await db.searches.find(
        {}, {"_id": 1, "make": 1, "model": 1, "variant": 1, "year": 1,
             "km_driven": 1, "asking_price": 1, "fuel_type": 1,
             "price_verdict": 1, "reliability_score": 1,
             "buy_recommendation": 1, "created_at": 1}
    ).sort("created_at", -1).limit(limit).to_list(limit)

    for r in records:
        r["_id"] = str(r["_id"])
    return records


@router.delete("/{record_id}")
async def delete_record(record_id: str):
    db = get_db()
    await db.searches.delete_one({"_id": ObjectId(record_id)})
    return {"message": "Deleted."}
