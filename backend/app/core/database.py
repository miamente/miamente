"""
Database configuration and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

# Lazy-loaded database engine
_engine = None


def get_engine():
    """Get database engine, creating it if it doesn't exist."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=settings.DEBUG,
        )
    return _engine


# Create session factory (will be initialized when engine is created)
session_local = None


def get_session_factory():
    """Get session factory, creating it if it doesn't exist."""
    global session_local
    if session_local is None:
        session_local = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return session_local


# Create base class for models
Base = declarative_base()


def get_db():
    """Get database session."""
    session_local = get_session_factory()
    db = session_local()
    try:
        yield db
    finally:
        db.close()
