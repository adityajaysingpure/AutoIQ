"""
cars.py
-------
Car analysis endpoints.

Validation is handled entirely by Pydantic field_validators on CarQuery —
no duplicate guards in the router. The router's job is routing only.
"""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from core.database import get_db
from models.car import CarAnalysisResult, CarQuery
from services.car_analysis_service import analyse_car

router = APIRouter()


@router.post("/analyse", response_model=CarAnalysisResult)
async def analyse_car_endpoint(query: CarQuery) -> CarAnalysisResult:
    """
    Accepts car details, runs GPT-4 analysis, persists summary
    and chat session to MongoDB, returns full CarAnalysisResult.
    """
    try:
        result = await analyse_car(query)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {exc}",
        )

    db  = get_db()
    now = datetime.now(timezone.utc)

    # Persist compact search record for history + aggregation
    await db.searches.insert_one({
        "make":               query.make,
        "model":              query.model,
        "variant":            query.variant,
        "year":               query.year,
        "km_driven":          query.km_driven,
        "asking_price":       query.asking_price,
        "fuel_type":          query.fuel_type,
        "transmission":       query.transmission,
        "city":               query.city,
        "price_verdict":      result.price_analysis.verdict,
        "reliability_score":  result.reliability_score,
        "buy_recommendation": result.buy_recommendation,
        "created_at":         now,
    })

    # Create chat session pre-loaded with car context
    session_doc = await db.chat_sessions.insert_one({
        "car_query":        query.model_dump(),
        "analysis_summary": result.car_context_summary,
        "messages":         [],
        "created_at":       now,
    })

    # Attach session_id — defined as Optional in the response model
    result.session_id = str(session_doc.inserted_id)
    return result


@router.get("/popular")
async def get_popular_cars() -> list[dict]:
    """
    Most searched make/model combinations with average reliability score.
    Powers quick-search suggestions on the home page.
    """
    db = get_db()
    pipeline = [
        {"$group": {
            "_id":              {"make": "$make", "model": "$model"},
            "search_count":     {"$sum": 1},
            "avg_reliability":  {"$avg": "$reliability_score"},
        }},
        {"$sort": {"search_count": -1}},
        {"$limit": 8},
    ]
    results = await db.searches.aggregate(pipeline).to_list(8)
    return [
        {
            "make":            r["_id"]["make"],
            "model":           r["_id"]["model"],
            "search_count":    r["search_count"],
            "avg_reliability": round(r["avg_reliability"], 1),
        }
        for r in results
    ]
