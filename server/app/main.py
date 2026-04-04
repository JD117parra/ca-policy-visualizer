"""
CA Policy Visualizer — FastAPI application entry point.
"""
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.policies import router as policies_router

app = FastAPI(
    title="CA Policy Visualizer API",
    description="Fetches Microsoft Entra ID Conditional Access policies via Microsoft Graph.",
    version="0.1.0",
)

# Allow requests from the Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Register routers
app.include_router(policies_router, prefix="/api")


@app.get("/api/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Simple liveness check."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
