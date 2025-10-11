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
import sqlalchemy.orm as orm

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

    except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE: Failed to create database engine: %s", exc)
        logger.error("DATABASE: Error type: %s", type(exc).__name__)
        return None


_SESSION_FACTORY_CACHE: Optional[orm.sessionmaker] = None
_SESSION_FACTORY_ENGINE_ID: Optional[int] = None


def get_session_factory() -> Optional[orm.sessionmaker]:
    """Return a cached session factory bound to the current Engine.

    Implements our own cache so tests can patch `sessionmaker` and use
    `get_session_factory.cache_clear()` reliably across test cases.
    """
    global _SESSION_FACTORY_CACHE, _SESSION_FACTORY_ENGINE_ID
    try:
        engine = get_engine()
        if engine is None:
            logger.error("DATABASE: Cannot create session factory - engine is None")
            return None

        engine_id = id(engine)
        if _SESSION_FACTORY_CACHE is not None and _SESSION_FACTORY_ENGINE_ID == engine_id:
            return _SESSION_FACTORY_CACHE

        logger.info("DATABASE: Creating session factory")
        factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _SESSION_FACTORY_CACHE = factory
        _SESSION_FACTORY_ENGINE_ID = engine_id
        return factory
    except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE: Failed to create session factory: %s", exc)
        return None


def _clear_session_factory_cache() -> None:
    global _SESSION_FACTORY_CACHE, _SESSION_FACTORY_ENGINE_ID
    _SESSION_FACTORY_CACHE = None
    _SESSION_FACTORY_ENGINE_ID = None


# Expose a cache_clear method compatible with tests
setattr(get_session_factory, "cache_clear", _clear_session_factory_cache)


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
    except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE: Unexpected error in database session: %s", exc)
        if db:
            db.rollback()
        yield None
    finally:
        if db:
            try:
                db.close()
                logger.debug("DATABASE: Database session closed successfully")
            except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
                logger.error("DATABASE: Error closing database session: %s", exc)
