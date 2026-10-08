from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum


class FuelType(str, Enum):
    petrol   = "petrol"
    diesel   = "diesel"
    cng      = "cng"
    electric = "electric"
    hybrid   = "hybrid"


class TransmissionType(str, Enum):
    manual    = "manual"
    automatic = "automatic"
    amt       = "amt"


class PriceFairness(str, Enum):
    great_deal = "great_deal"
    fair       = "fair"
    overpriced = "overpriced"
    avoid      = "avoid"


# ── Request schema ────────────────────────────────────────

class CarQuery(BaseModel):
    make:         str
    model:        str
    variant:      Optional[str]  = None
    year:         int
    km_driven:    int
    asking_price: float
    fuel_type:    FuelType
    transmission: TransmissionType
    city:         Optional[str]  = None
    seller_type:  Optional[str]  = None

    # Pydantic v2 field validators — replaces router-level guards
    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int) -> int:
        current = datetime.now(timezone.utc).year
        if not (1990 <= v <= current):
            raise ValueError(f"Year must be between 1990 and {current}.")
        return v

    @field_validator("km_driven")
    @classmethod
    def validate_km(cls, v: int) -> int:
        if not (0 <= v <= 500_000):
            raise ValueError("KM driven must be between 0 and 500,000.")
        return v

    @field_validator("asking_price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Asking price must be greater than 0.")
        return v

    @field_validator("make", "model")
    @classmethod
    def strip_and_cap(cls, v: str) -> str:
        return v.strip()


# ── Analysis response schemas ─────────────────────────────

class KnownIssue(BaseModel):
    component:             str
    description:           str
    severity:              str
    estimated_repair_cost: Optional[str] = None


class InspectionCheck(BaseModel):
    item:            str
    what_to_check:   str
    why_it_matters:  str


class PriceAnalysis(BaseModel):
    fair_price_range_low:  float
    fair_price_range_high: float
    market_avg:            float
    verdict:               PriceFairness
    price_reasoning:       str
    depreciation_note:     str


class CarAnalysisResult(BaseModel):
    price_analysis:                  PriceAnalysis
    reliability_score:               int
    reliability_verdict:             str
    known_issues:                    List[KnownIssue]
    avg_mileage_kmpl:                Optional[float]
    estimated_service_cost_per_year: str
    insurance_estimate:              str
    resale_value_3yr:                str
    negotiation_tips:                List[str]
    max_negotiable_price:            float
    inspection_checklist:            List[InspectionCheck]
    red_flags:                       List[str]
    overall_verdict:                 str
    buy_recommendation:              str
    car_context_summary:             str
    # Injected after DB insert — not from GPT
    session_id:                      Optional[str] = None


# ── Chat schemas ──────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    question:   str

    @field_validator("question")
    @classmethod
    def question_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Question cannot be empty.")
        return v.strip()


# ── History schema ────────────────────────────────────────

class SearchRecord(BaseModel):
    id:                  Optional[str] = Field(None, alias="_id")
    make:                str
    model:               str
    year:                int
    km_driven:           int
    asking_price:        float
    price_verdict:       str
    reliability_score:   int
    buy_recommendation:  str
    created_at:          datetime
