"""
chat_service.py
---------------
Multi-turn Q&A about a specific car.

Design decisions:
  - GPT-3.5-turbo for chat — 10x cheaper than GPT-4,
    fast enough for conversation, quality sufficient for follow-up Qs.
  - car_context injected as system message — GPT always knows the car
    without re-running the expensive analysis.
  - History truncated to last 8 messages — enough context,
    keeps token count predictable.
  - Client created via factory, not module-level — consistent with analysis service.
"""

from openai import AsyncOpenAI
from core.config import get_settings

settings = get_settings()


def _get_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def answer_followup(
    question: str,
    car_context: str,
    chat_history: list[dict],
) -> str:
    client = _get_client()

    system_prompt = (
        "You are an expert Indian used car advisor. "
        "The user is asking follow-up questions about this specific car:\n\n"
        f"{car_context}\n\n"
        "Answer concisely and specifically. Reference the car details where relevant. "
        "If asked something unrelated to this car purchase, redirect politely."
    )

    messages = [{"role": "system", "content": system_prompt}]

    # Last 8 messages for context — keeps token usage bounded
    for msg in chat_history[-8:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    response = await client.chat.completions.create(
        model=settings.openai_model_chat,
        messages=messages,
        max_tokens=400,
        temperature=0.4,
    )

    return response.choices[0].message.content.strip()
