from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cars, chat, history
from core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered used car research assistant for the Indian market. "
        "Get fair price analysis, known issues, negotiation tips, "
        "and inspection checklists for any used car."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router,    prefix="/api/cars",    tags=["Cars"])
app.include_router(chat.router,    prefix="/api/chat",    tags=["Chat"])
app.include_router(history.router, prefix="/api/history", tags=["History"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.app_name}
