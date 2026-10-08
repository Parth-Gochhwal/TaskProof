"""
TaskProof FastAPI Backend
Main application entry point.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db, SessionLocal
from app.api.routes import auth, tasks, submissions, wallet, users, leaderboard, business

# ============================
# App Instance
# ============================

app = FastAPI(
    title="TaskProof API",
    description="Backend API for TaskProof — Verified Micro-task Marketplace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ============================
# CORS
# ============================

# ALLOWED_ORIGINS: space-separated list of origins (set in Render env vars).
# For local dev, defaults to localhost Vite ports.
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173 http://127.0.0.1:5173 http://localhost:4173",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split() if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Database Initialization
# ============================

@app.on_event("startup")
def on_startup():
    """Initialize database tables and auto-seed demo data on startup."""
    init_db()
    # Auto-seed demo data if database is empty (safe to run on every restart).
    from app.db.seed import seed
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


# ============================
# Health Check
# ============================

@app.get("/health", tags=["health"])
def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "TaskProof API",
        "version": "1.0.0",
        "database": "SQLite — TaskProof Local Network",
        "note": "Prototype / Demo Environment",
    }


# ============================
# API Routes
# ============================

API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(tasks.router, prefix=API_PREFIX)
app.include_router(submissions.router, prefix=API_PREFIX)
app.include_router(wallet.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(leaderboard.router, prefix=API_PREFIX)
app.include_router(business.router, prefix=API_PREFIX)
