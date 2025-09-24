"""
Pytest configuration and fixtures for integration / acceptance tests.

Dual-mode:
- REMOTE (AWS): if APP_BASE_URL is set, hit the deployed app via HTTP and DO NOT
  spin up a local FastAPI app nor connect directly to DB.
- LOCAL: if APP_BASE_URL is not set, behave as before (TestClient + DATABASE_URL).

Only test data is cleaned in LOCAL mode. Remote cleanup should be done via
dedicated admin endpoints or separate jobs if needed.
"""

import os
import pytest
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Local-only imports (used in LOCAL mode)
from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.database import Base, get_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

pytestmark = pytest.mark.integration

# -------------------------------------------------------------------
# Mode detection
# -------------------------------------------------------------------
APP_BASE_URL = os.getenv("APP_BASE_URL", "").rstrip("/")
IS_REMOTE = bool(APP_BASE_URL)

# Test data identification
TEST_DATA_PREFIX = "TEST_INTEGRATION_"
TEST_TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")


def generate_test_email(test_name: str = "user") -> str:
    """Generate a test email with clear identification."""
    return f"{TEST_DATA_PREFIX}{test_name}_{TEST_TIMESTAMP}@example.com"


def generate_test_name(test_name: str = "User") -> str:
    """Generate a test name with clear identification."""
    return f"{TEST_DATA_PREFIX}{test_name}_{TEST_TIMESTAMP}"


# -------------------------------------------------------------------
# Local app constructor (LOCAL mode only)
# -------------------------------------------------------------------
def _build_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Test Backend API for Miamente mental health platform",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    async def root():
        return {"message": "Miamente Test Backend API", "version": settings.VERSION}

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    return app


# -------------------------------------------------------------------
# DB helpers (LOCAL mode only)
# -------------------------------------------------------------------
def _build_engine_and_session_factory():
    """
    LOCAL mode: use DATABASE_URL.
    REMOTE mode: disabled (we don't connect directly to RDS from tests).
    """
    if IS_REMOTE:
        raise RuntimeError("Engine/session cannot be built in REMOTE mode (APP_BASE_URL set).")
    settings = get_settings()
    database_url = settings.DATABASE_URL
    engine = create_engine(database_url, poolclass=StaticPool)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, session_factory


def _cleanup_test_data(session_factory):
    """Clean only test data with precise identification to avoid deleting production data (LOCAL mode)."""
    session = session_factory()
    try:
        test_patterns = [
            f"email LIKE '{TEST_DATA_PREFIX}%'",
            "email LIKE '%@example.com'",
            "email LIKE '%@test.com'",
            "full_name LIKE 'Test %'",
            "full_name LIKE '% Test'",
            "email = 'test@example.com'",
            "email = 'professional@example.com'",
            "email = 'nonexistent@example.com'",
            "full_name = 'Test User'",
            "full_name = 'Test Professional'",
            "full_name = 'Test User 1'",
            "full_name = 'Test User 2'",
            "full_name = 'Updated Name'",
        ]
        where_clause = " OR ".join(test_patterns)

        # Pre-capture professional IDs (for relation cleanup)
        test_professional_ids = session.execute(
            text(f"SELECT id FROM professionals WHERE {where_clause}")
        ).fetchall()

        # Users
        result = session.execute(text(f"DELETE FROM users WHERE {where_clause}"))
        deleted_users = result.rowcount

        # Professionals
        result = session.execute(text(f"DELETE FROM professionals WHERE {where_clause}"))
        deleted_professionals = result.rowcount

        # Relations for those professionals
        if test_professional_ids:
            professional_id_list = [str(row[0]) for row in test_professional_ids]
            professional_ids_str = "', '".join(professional_id_list)

            session.execute(
                text(
                    f"DELETE FROM professional_specialties "
                    f"WHERE professional_id IN ('{professional_ids_str}')"
                )
            )
            session.execute(
                text(
                    f"DELETE FROM professional_modalities "
                    f"WHERE professional_id IN ('{professional_ids_str}')"
                )
            )
            session.execute(
                text(
                    f"DELETE FROM professional_therapeutic_approaches "
                    f"WHERE professional_id IN ('{professional_ids_str}')"
                )
            )

        # Reference tables (only test-ish data)
        session.execute(
            text(
                "DELETE FROM specialties "
                "WHERE name LIKE 'Test %' OR name LIKE '% Test' OR name = 'psychology'"
            )
        )
        session.execute(
            text(
                "DELETE FROM therapeutic_approaches "
                "WHERE name LIKE 'Test %' OR name LIKE '% Test'"
            )
        )
        session.execute(
            text("DELETE FROM modalities WHERE name LIKE 'Test %' OR name LIKE '% Test'")
        )

        session.commit()
        print(
            f"✅ Test data cleanup completed (LOCAL): {deleted_users} users, "
            f"{deleted_professionals} professionals removed"
        )
    except Exception as e:
        session.rollback()
        print(f"⚠️ Warning: Could not clean test data (LOCAL): {e}")
    finally:
        session.close()


# -------------------------------------------------------------------
# Pytest fixtures
# -------------------------------------------------------------------
@pytest.fixture(scope="session")
def engine_and_session_factory():
    """
    LOCAL mode: return engine and session factory.
    REMOTE mode: skip (not used).
    """
    if IS_REMOTE:
        yield None, None
        return
    engine, session_factory = _build_engine_and_session_factory()
    Base.metadata.create_all(bind=engine)
    yield engine, session_factory


@pytest.fixture(scope="session", autouse=False)
def setup_test_db(engine_and_session_factory):
    """
    LOCAL mode: clean test data before/after session.
    REMOTE mode: no-op (cleanup must be done by endpoints or separate jobs).
    """
    if IS_REMOTE:
        yield
        return
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)
    yield
    _cleanup_test_data(session_factory)


@pytest.fixture(scope="function")
def db_session(engine_and_session_factory, setup_test_db):
    """
    LOCAL mode: provide SQLAlchemy session that cleans test data.
    REMOTE mode: not applicable (raise helpful error if accidentally used).
    """
    if IS_REMOTE:
        raise RuntimeError("db_session fixture is not available in REMOTE mode.")
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        _cleanup_test_data(session_factory)


@pytest.fixture
def client(engine_and_session_factory):
    """
    Dual-mode client:
    - REMOTE: simple wrapper over requests.Session hitting APP_BASE_URL.
    - LOCAL: FastAPI TestClient with overridden DB dependency.
    """
    if IS_REMOTE:
        import requests

        session = requests.Session()
        base = APP_BASE_URL  # already stripped of trailing slash

        class RemoteClient:
            def _url(self, path: str) -> str:
                path = path or ""
                return base + (path if path.startswith("/") else f"/{path}")

            def get(self, path: str, **kw):
                return session.get(self._url(path), **kw)

            def post(self, path: str, **kw):
                return session.post(self._url(path), **kw)

            def put(self, path: str, **kw):
                return session.put(self._url(path), **kw)

            def delete(self, path: str, **kw):
                return session.delete(self._url(path), **kw)

        return RemoteClient()

    # --- LOCAL ---
    from fastapi.testclient import TestClient  # local-only import
    _, session_factory = engine_and_session_factory
    app = _build_app()

    def override_get_db():
        try:
            db = session_factory()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture(scope="function", autouse=not IS_REMOTE)
def reset_db_before_each_test(engine_and_session_factory):
    """
    LOCAL mode: auto cleanup before each test.
    REMOTE mode: disabled (no direct DB access).
    """
    if IS_REMOTE:
        return
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)


@pytest.fixture
def test_email_generator():
    """Provide test email generator function."""
    return generate_test_email


@pytest.fixture
def test_name_generator():
    """Provide test name generator function."""
    return generate_test_name


@pytest.fixture
def test_data_factory():
    """Provide test data factory with safe test data generation."""

    def create_test_user_data(name_suffix="user"):
        return {
            "email": generate_test_email(name_suffix),
            "password": "testpassword123",
            "full_name": generate_test_name(name_suffix.title()),
            "phone": "+1234567890",
        }

    def create_test_professional_data(name_suffix="professional"):
        return {
            "email": generate_test_email(name_suffix),
            "password": "testpassword123",
            "full_name": generate_test_name(name_suffix.title()),
            "specialty_ids": ["psychology"],
            "bio": f"Test bio for {name_suffix}",
            "rate_cents": 50000,
        }

    return {"user": create_test_user_data, "professional": create_test_professional_data}
