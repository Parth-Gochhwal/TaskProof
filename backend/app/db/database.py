"""
Database configuration and session management.
Uses SQLite with SQLAlchemy 2.0 ORM.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

# Store DB in the backend directory (used when DATABASE_URL is not set)
DB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLITE_PATH = os.path.join(DB_DIR, "taskproof.db")
_default_url = f"sqlite:///{SQLITE_PATH}"

# Allow DATABASE_URL env var override (e.g., for non-default Render disk mount paths)
DATABASE_URL = os.environ.get("DATABASE_URL", _default_url)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables if they don't exist."""
    from app.db import models  # noqa: F401 - ensure models are registered
    Base.metadata.create_all(bind=engine)
