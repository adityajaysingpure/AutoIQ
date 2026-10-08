"""
history.py
----------
Search history endpoints.

Uses typed return annotations throughout.
ObjectId validation catches malformed IDs explicitly.
"""

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Query

from core.database import get_db

router = APIRouter()


@router.get("/")
async def get_search_history(limit: int = Query(20, ge=1, le=100)) -> list[dict]:
    """Return recent car searches, newest first."""
    db = get_db()
    records = await db.searches.find(
        {},
        {
            "_id": 1, "make": 1, "model": 1, "variant": 1,
            "year": 1, "km_driven": 1, "asking_price": 1,
            "fuel_type": 1, "price_verdict": 1,
            "reliability_score": 1, "buy_recommendation": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).limit(limit).to_list(limit)

    for r in records:
        r["_id"] = str(r["_id"])
    return records


@router.delete("/{record_id}", status_code=204)
async def delete_record(record_id: str) -> None:
    """Delete a search record. Returns 204 No Content on success."""
    db = get_db()

    try:
        oid = ObjectId(record_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid record ID format.")

    result = await db.searches.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found.")
