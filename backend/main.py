"""
NiyamAI Backend Application.
FastAPI entrypoint providing REST endpoints for Indian SMB compliance:
- Licence scanning with Gemini AI
- Invoice auditing and rule checking
- Health score computation and breakdown
- Flag-to-CA collaboration workflow
- Firebase token verification and business-level authorization
"""

import os
import json
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routers import licences, invoices, flags, score, businesses

app = FastAPI(
    title="NiyamAI Compliance Engine API",
    description="Backend API for NiyamAI - Compliance Operating System for Indian SMBs.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Allow custom frontend origins from environment
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("CORS_ALLOW_ALL", "true").lower() == "true" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(licences.router)
app.include_router(invoices.router)
app.include_router(flags.router)
app.include_router(score.router)
app.include_router(businesses.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "NiyamAI API",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "timestamp": "2026-10-29T14:58:53+05:30"}


@app.get("/rules", tags=["Rules Engine"])
def get_rules_endpoint():
    """
    GET /rules
    Returns the legal rules database for display on the Penalties page.
    Every penalty and rule_code is traceable to legislation.
    """
    rules_file = Path(__file__).parent / "data" / "rules.json"
    if rules_file.exists():
        try:
            with open(rules_file, "r", encoding="utf-8") as f:
                rules = json.load(f)
                return rules
        except Exception:
            pass

    return []


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
