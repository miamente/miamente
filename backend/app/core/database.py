"""
Database configuration and session management.
"""

import logging
from functools import lru_cache
from typing import Generator, Optional

from sqlalchemy import create_engine, orm
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

    except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE: Failed to create database engine: %s", exc)
        logger.error("DATABASE: Error type: %s", type(exc).__name__)
        return None


class _SessionFactoryCache:
    """Cache for session factory to avoid global variables."""

    def __init__(self):
        self.factory: Optional[orm.sessionmaker] = None
        self.engine_id: Optional[int] = None

    def get(self, engine: Engine) -> Optional[orm.sessionmaker]:
        """Get or create session factory for the given engine."""
        engine_id = id(engine)
        if self.factory is not None and self.engine_id == engine_id:
            return self.factory

        logger.info("DATABASE: Creating session factory")
        factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        self.factory = factory
        self.engine_id = engine_id
        return factory

    def clear(self) -> None:
        """Clear the cache."""
        self.factory = None
        self.engine_id = None


# Create a singleton instance
_session_factory_cache = _SessionFactoryCache()


def get_session_factory() -> Optional[orm.sessionmaker]:
    """Return a cached session factory bound to the current Engine.

    Implements our own cache so tests can patch `sessionmaker` and use
    `get_session_factory.cache_clear()` reliably across test cases.
    """
    try:
        engine = get_engine()
        if engine is None:
            logger.error("DATABASE: Cannot create session factory - engine is None")
            return None

        return _session_factory_cache.get(engine)
    except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE: Failed to create session factory: %s", exc)
        return None


# Expose a cache_clear method compatible with tests
get_session_factory.cache_clear = _session_factory_cache.clear


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
