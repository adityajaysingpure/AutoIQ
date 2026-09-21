from fastapi import APIRouter, HTTPException
from core.database import get_db
from models.car import CarQuery, CarAnalysisResult
from services.car_analysis_service import analyse_car
from datetime import datetime

router = APIRouter()


@router.post("/analyse", response_model=CarAnalysisResult)
async def analyse_car_endpoint(query: CarQuery):
    """
    Main endpoint. Accepts car details, runs full AI analysis,
    saves a summary to MongoDB, creates a chat session,
    and returns the complete CarAnalysisResult.
    """
    if query.year < 1990 or query.year > 2025:
        raise HTTPException(status_code=400, detail="Year must be between 1990 and 2025.")
    if query.km_driven < 0 or query.km_driven > 500000:
        raise HTTPException(status_code=400, detail="KM driven seems invalid.")
    if query.asking_price <= 0:
        raise HTTPException(status_code=400, detail="Asking price must be greater than 0.")

    try:
        result = await analyse_car(query)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # Save search record + create chat session in MongoDB
    db = get_db()
    now = datetime.utcnow()

    # Save compact search record for history
    await db.searches.insert_one({
        "make": query.make,
        "model": query.model,
        "variant": query.variant,
        "year": query.year,
        "km_driven": query.km_driven,
        "asking_price": query.asking_price,
        "fuel_type": query.fuel_type,
        "transmission": query.transmission,
        "city": query.city,
        "price_verdict": result.price_analysis.verdict,
        "reliability_score": result.reliability_score,
        "buy_recommendation": result.buy_recommendation,
        "created_at": now,
    })

    # Create a chat session pre-loaded with context
    session_result = await db.chat_sessions.insert_one({
        "car_query": query.model_dump(),
        "analysis_summary": result.car_context_summary,
        "messages": [],
        "created_at": now,
    })

    # Attach session_id to result for frontend chat feature
    result_dict = result.model_dump()
    result_dict["session_id"] = str(session_result.inserted_id)

    return result_dict


@router.get("/popular")
async def get_popular_cars():
    """
    Return the most commonly searched cars from history.
    Used to show quick-search suggestions on the home page.
    """
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": {"make": "$make", "model": "$model"},
            "count": {"$sum": 1},
            "avg_reliability": {"$avg": "$reliability_score"},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 8},
    ]
    results = await db.searches.aggregate(pipeline).to_list(8)
    return [
        {
            "make": r["_id"]["make"],
            "model": r["_id"]["model"],
            "search_count": r["count"],
            "avg_reliability": round(r["avg_reliability"], 1),
        }
        for r in results
    ]
