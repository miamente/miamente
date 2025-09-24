"""
Database configuration and session management.
"""

import logging
from functools import lru_cache
from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import get_settings

# Set up logging
logger = logging.getLogger(__name__)

# Declarative base for models
Base = declarative_base()


@lru_cache(maxsize=1)
def get_engine() -> Optional[Engine]:
    """Return a singleton SQLAlchemy Engine built from settings."""
    try:
        settings = get_settings()
        logger.info("DATABASE: Creating database engine")
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_timeout=30,
            echo=settings.DEBUG,
        )

        # Don't test the connection during engine creation
        # Let the application handle connection failures gracefully
        logger.info("DATABASE: Database engine created successfully")
        return engine

    except Exception as exc:
        logger.error("DATABASE: Failed to create database engine: %s", exc)
        logger.error("DATABASE: Error type: %s", type(exc).__name__)
        return None


@lru_cache(maxsize=1)
def get_session_factory() -> Optional[sessionmaker]:
    """Return a singleton session factory (sessionmaker) bound to the Engine."""
    try:
        engine = get_engine()
        if engine is None:
            logger.error("DATABASE: Cannot create session factory - engine is None")
            return None

        logger.info("DATABASE: Creating session factory")
        return sessionmaker(autocommit=False, autoflush=False, bind=engine)
    except Exception as exc:
        logger.error("DATABASE: Failed to create session factory: %s", exc)
        return None


def get_db() -> Generator[Optional[Session], None, None]:
    """Yield a database session and ensure it is closed afterwards."""
    session_factory = get_session_factory()

    if session_factory is None:
        logger.error("DATABASE: Cannot create database session - session factory is None")
        yield None
        return

    db = None
    try:
        db = session_factory()
        logger.debug("DATABASE: Database session created successfully")
        yield db
    except SQLAlchemyError as db_error:
        logger.error("DATABASE: SQLAlchemy error in database session: %s", db_error)
        if db:
            db.rollback()
        yield None
    except Exception as exc:
        logger.error("DATABASE: Unexpected error in database session: %s", exc)
        if db:
            db.rollback()
        yield None
    finally:
        if db:
            try:
                db.close()
                logger.debug("DATABASE: Database session closed successfully")
            except Exception as exc:
                logger.error("DATABASE: Error closing database session: %s", exc)
