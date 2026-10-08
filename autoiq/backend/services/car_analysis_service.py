"""
car_analysis_service.py
-----------------------
AI engine for AutoIQ.

Design decisions:
  - Single GPT-4 call returns full structured JSON — avoids chained calls
    and keeps latency predictable.
  - AsyncOpenAI client is created once per request via dependency injection
    rather than at module level — easier to mock in tests.
  - JSON parsing uses a fallback regex extraction so malformed GPT output
    with stray markdown doesn't silently fail.
  - age_years computed from current UTC year, not hardcoded 2024.
"""

import json
import re
from datetime import datetime, timezone

from openai import AsyncOpenAI
from core.config import get_settings
from models.car import (
    CarQuery, CarAnalysisResult, PriceAnalysis,
    PriceFairness, KnownIssue, InspectionCheck,
)

settings = get_settings()


def _get_client() -> AsyncOpenAI:
    """Factory — keeps client creation testable and explicit."""
    return AsyncOpenAI(api_key=settings.openai_api_key)


def _build_car_context(q: CarQuery) -> str:
    parts = [
        f"{q.year} {q.make} {q.model}",
        f"Variant: {q.variant}" if q.variant else None,
        f"Fuel: {q.fuel_type} | Transmission: {q.transmission}",
        f"KM driven: {q.km_driven:,}",
        f"Asking price: ₹{q.asking_price:,.0f}",
        f"City: {q.city}" if q.city else None,
        f"Seller: {q.seller_type}" if q.seller_type else None,
    ]
    return " | ".join(p for p in parts if p)


def _parse_gpt_json(raw: str) -> dict:
    """
    Strip markdown fences and parse JSON.
    Falls back to regex extraction if direct parse fails.
    Raises ValueError with a clear message on total failure.
    """
    cleaned = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    raise ValueError(
        "GPT returned malformed JSON. This is usually a temporary issue — please try again."
    )


async def analyse_car(q: CarQuery) -> CarAnalysisResult:
    """
    Run full AI analysis for a used car query.
    Returns a typed CarAnalysisResult ready for the API response.
    """
    client    = _get_client()
    car_ctx   = _build_car_context(q)
    age_years = datetime.now(timezone.utc).year - q.year

    system_msg = (
        "You are an expert Indian used car advisor. "
        "You have deep knowledge of CarDekho and Cars24 pricing trends, "
        "common issues with popular Indian models, and RTO norms. "
        "Always respond with valid JSON only — no markdown, no preamble."
    )

    user_msg = f"""Analyse this used car listing and return a detailed report.

Car: {car_ctx}
Age: {age_years} year(s)

Return ONLY this JSON structure:
{{
  "price_analysis": {{
    "fair_price_range_low": <INR number>,
    "fair_price_range_high": <INR number>,
    "market_avg": <INR number>,
    "verdict": <"great_deal"|"fair"|"overpriced"|"avoid">,
    "price_reasoning": "<2-3 sentences — reference km, age, model>",
    "depreciation_note": "<depreciation curve note for this model>"
  }},
  "reliability_score": <1-10>,
  "reliability_verdict": "<1-2 sentence verdict for this model-year>",
  "known_issues": [
    {{
      "component": "<name>",
      "description": "<specific issue>",
      "severity": "<minor|moderate|major>",
      "estimated_repair_cost": "<INR range or null>"
    }}
  ],
  "avg_mileage_kmpl": <number or null>,
  "estimated_service_cost_per_year": "<INR range>",
  "insurance_estimate": "<annual INR range>",
  "resale_value_3yr": "<estimated value after 3 more years>",
  "negotiation_tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "max_negotiable_price": <realistic lowest price in INR>,
  "inspection_checklist": [
    {{
      "item": "<part>",
      "what_to_check": "<what to look for>",
      "why_it_matters": "<why this matters for this model>"
    }}
  ],
  "red_flags": ["<flag 1>", "<flag 2>"],
  "overall_verdict": "<3-4 sentence honest assessment>",
  "buy_recommendation": "<Buy|Negotiate|Avoid|Get Inspected First>",
  "car_context_summary": "<one paragraph — car details + analysis summary for chat context>"
}}"""

    response = await client.chat.completions.create(
        model=settings.openai_model_analysis,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": user_msg},
        ],
        max_tokens=2000,
        temperature=0.3,
        response_format={"type": "json_object"},   # GPT-4 JSON mode
    )

    raw  = response.choices[0].message.content
    data = _parse_gpt_json(raw)

    return CarAnalysisResult(
        price_analysis=PriceAnalysis(
            fair_price_range_low=data["price_analysis"]["fair_price_range_low"],
            fair_price_range_high=data["price_analysis"]["fair_price_range_high"],
            market_avg=data["price_analysis"]["market_avg"],
            verdict=PriceFairness(data["price_analysis"]["verdict"]),
            price_reasoning=data["price_analysis"]["price_reasoning"],
            depreciation_note=data["price_analysis"]["depreciation_note"],
        ),
        reliability_score=data["reliability_score"],
        reliability_verdict=data["reliability_verdict"],
        known_issues=[KnownIssue(**i) for i in data.get("known_issues", [])],
        avg_mileage_kmpl=data.get("avg_mileage_kmpl"),
        estimated_service_cost_per_year=data["estimated_service_cost_per_year"],
        insurance_estimate=data["insurance_estimate"],
        resale_value_3yr=data["resale_value_3yr"],
        negotiation_tips=data["negotiation_tips"],
        max_negotiable_price=data["max_negotiable_price"],
        inspection_checklist=[InspectionCheck(**i) for i in data.get("inspection_checklist", [])],
        red_flags=data.get("red_flags", []),
        overall_verdict=data["overall_verdict"],
        buy_recommendation=data["buy_recommendation"],
        car_context_summary=data["car_context_summary"],
    )
