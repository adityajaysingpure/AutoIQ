"""
chat_service.py
---------------
Multi-turn Q&A about a specific car analysis.

The car_context_summary from the analysis is injected as system context,
so every follow-up question has full awareness of the car details,
price verdict, and known issues without re-running the expensive analysis.
"""

from openai import AsyncOpenAI
from core.config import get_settings

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)


async def answer_followup(
    question: str,
    car_context: str,
    chat_history: list,
) -> str:
    """
    Answer a follow-up question about a specific car.
    Maintains conversation context using the last 8 messages.
    """
    system_prompt = f"""You are an expert Indian used car advisor.
The user is asking about this specific car:

{car_context}

Answer questions concisely and specifically. 
Reference the car details above where relevant.
If asked about something unrelated to the car purchase, 
politely redirect to car-buying topics."""

    messages = [{"role": "system", "content": system_prompt}]

    # Include recent chat history for context
    for msg in chat_history[-8:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    resp = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=400,
        temperature=0.4,
    )

    return resp.choices[0].message.content.strip()
