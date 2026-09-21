"""
car_analysis_service.py
-----------------------
AI engine for AutoIQ.

Pipeline:
  1. Price analysis  — GPT estimates fair market price range for the
                       specific make/model/year/km in Indian market
  2. Reliability     — Known issues, reliability score, ownership costs
  3. Negotiation     — Specific negotiation script for this car
  4. Merge           — Combine into CarAnalysisResult
"""

import json
import re
from openai import AsyncOpenAI
from core.config import get_settings
from models.car import (
    CarQuery, CarAnalysisResult, PriceAnalysis, PriceFairness,
    KnownIssue, InspectionCheck
)

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)


def _build_car_context(q: CarQuery) -> str:
    return (
        f"{q.year} {q.make} {q.model}"
        + (f" {q.variant}" if q.variant else "")
        + f" | {q.fuel_type} | {q.transmission}"
        + f" | {q.km_driven:,} km driven"
        + f" | Asking price: ₹{q.asking_price:,.0f}"
        + (f" | City: {q.city}" if q.city else "")
        + (f" | Seller: {q.seller_type}" if q.seller_type else "")
    )


async def analyse_car(q: CarQuery) -> CarAnalysisResult:
    """
    Run the full AI analysis for a used car query.
    Uses one GPT-4 call with a structured JSON prompt
    to keep latency low and costs predictable.
    """
    car_ctx = _build_car_context(q)
    age_years = 2024 - q.year

    prompt = f"""You are an expert Indian used car advisor with deep knowledge of 
the Indian automotive market, CarDekho and Cars24 pricing trends, and 
common issues with popular Indian car models.

Analyse this used car listing and return ONLY valid JSON — no markdown, no extra text.

Car Details:
{car_ctx}
Car Age: {age_years} years

Return this exact JSON structure:
{{
  "price_analysis": {{
    "fair_price_range_low": <number in INR>,
    "fair_price_range_high": <number in INR>,
    "market_avg": <number in INR>,
    "verdict": <"great_deal"|"fair"|"overpriced"|"avoid">,
    "price_reasoning": "<2-3 sentences explaining the price verdict with specific references to km, age, and model>",
    "depreciation_note": "<note on depreciation curve for this model>"
  }},
  "reliability_score": <integer 1-10>,
  "reliability_verdict": "<1-2 sentence reliability summary for this specific model-year>",
  "known_issues": [
    {{
      "component": "<component name>",
      "description": "<specific issue description>",
      "severity": "<minor|moderate|major>",
      "estimated_repair_cost": "<INR range or null>"
    }}
  ],
  "avg_mileage_kmpl": <number or null>,
  "estimated_service_cost_per_year": "<INR range>",
  "insurance_estimate": "<annual INR range for this car value>",
  "resale_value_3yr": "<estimated resale value after 3 more years>",
  "negotiation_tips": [
    "<specific negotiation tip referencing the km/age/issues>",
    "<tip 2>",
    "<tip 3>"
  ],
  "max_negotiable_price": <realistic lowest price you could negotiate to in INR>,
  "inspection_checklist": [
    {{
      "item": "<part to check>",
      "what_to_check": "<specific thing to look for>",
      "why_it_matters": "<why this matters for this specific model>"
    }}
  ],
  "red_flags": [
    "<specific red flag to watch for in this model or at this km/age>"
  ],
  "overall_verdict": "<3-4 sentence honest overall assessment>",
  "buy_recommendation": "<Buy|Negotiate|Avoid|Get Inspected First>",
  "car_context_summary": "<one paragraph summary of the car and analysis for use as chat context>"
}}

Be specific to the Indian market. Reference actual known issues for this 
make/model combination. Give real INR price ranges, not generic advice."""

    resp = await client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert Indian used car advisor. "
                    "Always respond with valid JSON only. "
                    "Be specific, honest, and practical for Indian buyers."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=2000,
        temperature=0.3,
    )

    raw = resp.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            raise ValueError("GPT returned malformed JSON. Please try again.")

    # Build typed result
    pa = data["price_analysis"]
    price_analysis = PriceAnalysis(
        fair_price_range_low=pa["fair_price_range_low"],
        fair_price_range_high=pa["fair_price_range_high"],
        market_avg=pa["market_avg"],
        verdict=PriceFairness(pa["verdict"]),
        price_reasoning=pa["price_reasoning"],
        depreciation_note=pa["depreciation_note"],
    )

    known_issues = [KnownIssue(**issue) for issue in data.get("known_issues", [])]
    checklist = [InspectionCheck(**item) for item in data.get("inspection_checklist", [])]

    return CarAnalysisResult(
        price_analysis=price_analysis,
        reliability_score=data["reliability_score"],
        reliability_verdict=data["reliability_verdict"],
        known_issues=known_issues,
        avg_mileage_kmpl=data.get("avg_mileage_kmpl"),
        estimated_service_cost_per_year=data["estimated_service_cost_per_year"],
        insurance_estimate=data["insurance_estimate"],
        resale_value_3yr=data["resale_value_3yr"],
        negotiation_tips=data["negotiation_tips"],
        max_negotiable_price=data["max_negotiable_price"],
        inspection_checklist=checklist,
        red_flags=data.get("red_flags", []),
        overall_verdict=data["overall_verdict"],
        buy_recommendation=data["buy_recommendation"],
        car_context_summary=data["car_context_summary"],
    )
