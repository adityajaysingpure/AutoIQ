from fastapi import APIRouter, HTTPException
from core.database import get_db
from models.car import ChatRequest
from services.chat_service import answer_followup
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/ask")
async def ask_followup(request: ChatRequest):
    """
    Answer a follow-up question about a specific car analysis session.
    Maintains full conversation history per session.
    """
    db = get_db()

    try:
        session = await db.chat_sessions.find_one(
            {"_id": ObjectId(request.session_id)}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID.")

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    history = session.get("messages", [])

    try:
        answer = await answer_followup(
            question=request.question,
            car_context=session["analysis_summary"],
            chat_history=history,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

    now = datetime.utcnow()
    new_messages = [
        {"role": "user",      "content": request.question, "timestamp": now},
        {"role": "assistant", "content": answer,            "timestamp": now},
    ]

    await db.chat_sessions.update_one(
        {"_id": ObjectId(request.session_id)},
        {"$push": {"messages": {"$each": new_messages}}},
    )

    return {"answer": answer, "session_id": request.session_id}


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """Return full chat history for a session."""
    db = get_db()
    session = await db.chat_sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session["_id"] = str(session["_id"])
    return session
