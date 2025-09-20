"""
Database configuration and session management.
"""

from functools import lru_cache
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import get_settings

# Declarative base for models
Base = declarative_base()


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Return a singleton SQLAlchemy Engine built from settings."""
    settings = get_settings()
    return create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
    )


@lru_cache(maxsize=1)
def get_session_factory() -> sessionmaker:
    """Return a singleton session factory (sessionmaker) bound to the Engine."""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is closed afterwards."""
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
