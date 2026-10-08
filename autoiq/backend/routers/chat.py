"""
chat.py
-------
Follow-up chat endpoints.

Session lookup uses ObjectId — raises 400 on invalid format,
404 when session genuinely not found. Keeps error semantics correct.
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from core.database import get_db
from models.car import ChatRequest
from services.chat_service import answer_followup

router = APIRouter()


@router.post("/ask")
async def ask_followup(request: ChatRequest) -> dict:
    """
    Answer a follow-up question in the context of a car analysis session.
    Appends both user message and assistant reply to the session history.
    """
    db = get_db()

    try:
        oid = ObjectId(request.session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session ID format.")

    session = await db.chat_sessions.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    try:
        answer = await answer_followup(
            question=request.question,
            car_context=session["analysis_summary"],
            chat_history=session.get("messages", []),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat error: {exc}")

    now = datetime.now(timezone.utc)
    new_messages = [
        {"role": "user",      "content": request.question, "timestamp": now},
        {"role": "assistant", "content": answer,            "timestamp": now},
    ]

    await db.chat_sessions.update_one(
        {"_id": oid},
        {"$push": {"messages": {"$each": new_messages}}},
    )

    return {"answer": answer, "session_id": request.session_id}


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str) -> dict:
    """Return full chat history for a session."""
    db = get_db()

    try:
        oid = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid session ID format.")

    session = await db.chat_sessions.find_one({"_id": oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    session["_id"] = str(session["_id"])
    return session
