from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FuelType(str, Enum):
    petrol = "petrol"
    diesel = "diesel"
    cng    = "cng"
    electric = "electric"
    hybrid = "hybrid"


class TransmissionType(str, Enum):
    manual    = "manual"
    automatic = "automatic"
    amt       = "amt"


class PriceFairness(str, Enum):
    great_deal  = "great_deal"
    fair        = "fair"
    overpriced  = "overpriced"
    avoid       = "avoid"


class CarQuery(BaseModel):
    make: str                        # e.g. "Maruti"
    model: str                       # e.g. "Swift"
    variant: Optional[str] = None    # e.g. "VXI"
    year: int
    km_driven: int
    asking_price: float              # in INR
    fuel_type: FuelType
    transmission: TransmissionType
    city: Optional[str] = None
    seller_type: Optional[str] = None  # "dealer" | "individual"


class KnownIssue(BaseModel):
    component: str
    description: str
    severity: str          # "minor" | "moderate" | "major"
    estimated_repair_cost: Optional[str] = None


class InspectionCheck(BaseModel):
    item: str
    what_to_check: str
    why_it_matters: str


class PriceAnalysis(BaseModel):
    fair_price_range_low: float
    fair_price_range_high: float
    market_avg: float
    verdict: PriceFairness
    price_reasoning: str
    depreciation_note: str


class CarAnalysisResult(BaseModel):
    # Price
    price_analysis: PriceAnalysis

    # Reliability
    reliability_score: int           # 0-10
    reliability_verdict: str
    known_issues: List[KnownIssue]

    # Ownership cost
    avg_mileage_kmpl: Optional[float]
    estimated_service_cost_per_year: str
    insurance_estimate: str
    resale_value_3yr: str

    # Negotiation
    negotiation_tips: List[str]
    max_negotiable_price: float

    # Inspection checklist
    inspection_checklist: List[InspectionCheck]

    # Red flags
    red_flags: List[str]

    # Overall
    overall_verdict: str
    buy_recommendation: str          # "Buy", "Negotiate", "Avoid", "Get Inspected First"

    # Chat context (stored for follow-up questions)
    car_context_summary: str


class ChatMessage(BaseModel):
    role: str     # "user" | "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    car_query: dict
    analysis_summary: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    session_id: str
    question: str


class SearchRecord(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    make: str
    model: str
    year: int
    km_driven: int
    asking_price: float
    price_verdict: str
    reliability_score: int
    buy_recommendation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
