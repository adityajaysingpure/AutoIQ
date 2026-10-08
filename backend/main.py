"""
main.py
-------
FastAPI application entry point.

Uses lifespan context manager (replaces deprecated on_event) for
startup tasks — DB index creation runs once on boot.

Exception handler for RequestValidationError gives the frontend
a clean, human-readable error message when Pydantic validation fails
(e.g. year out of range, negative km) rather than the raw 422 detail list.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from core.config import get_settings
from core.database import create_indexes
from routers import cars, chat, history

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before serving, cleanup after shutdown."""
    await create_indexes()
    yield
    # Add any cleanup here if needed (e.g. close external connections)


app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered used car research assistant for the Indian market. "
        "Price analysis, known issues, negotiation tips, inspection checklist."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ────────────────────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Convert Pydantic validation errors into a single readable string.
    Without this, the frontend receives a raw 422 list that's hard to display.
    """
    messages = [
        f"{' → '.join(str(loc) for loc in err['loc'] if loc != 'body')}: {err['msg']}"
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": " | ".join(messages)},
    )


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(cars.router,    prefix="/api/cars",    tags=["Cars"])
app.include_router(chat.router,    prefix="/api/chat",    tags=["Chat"])
app.include_router(history.router, prefix="/api/history", tags=["History"])


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root() -> dict:
    return {"status": "ok", "app": settings.app_name, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health() -> dict:
    return {"status": "healthy"}
