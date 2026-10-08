"""
TaskProof FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Database Initialization
# ============================

@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()


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
