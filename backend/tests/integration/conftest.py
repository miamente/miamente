"""
Pytest configuration for integration tests.
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
from fastapi.testclient import TestClient
import requests

pytestmark = pytest.mark.integration

# -------------------------------------------------------------------
# Mode detection
# -------------------------------------------------------------------
APP_BASE_URL = os.getenv("APP_BASE_URL", "").rstrip("/")

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

    # DO NOT add TrustedHostMiddleware for tests
    # TestClient uses "testserver" as hostname which would be blocked

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
    Build SQLAlchemy engine and session factory for LOCAL mode.
    """
    settings = get_settings()
    database_url = settings.DATABASE_URL
    engine = create_engine(database_url, poolclass=StaticPool)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, session_factory


# ...existing code...
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

        # Clean up NEW unified accounts system
        # Get test account IDs first
        test_account_ids_result = session.execute(text(f"SELECT id FROM accounts WHERE {where_clause}")).fetchall()
        deleted_accounts = 0

        if test_account_ids_result:
            account_id_list = [str(row[0]) for row in test_account_ids_result]
            account_ids_str = "', '".join(account_id_list)

            # Delete junction tables first (they reference accounts now)
            session.execute(text(f"DELETE FROM professional_modalities WHERE professional_id IN ('{account_ids_str}')"))
            session.execute(
                text(f"DELETE FROM professional_specialties WHERE professional_id IN ('{account_ids_str}')")
            )
            session.execute(
                text(f"DELETE FROM professional_therapeutic_approaches WHERE professional_id IN ('{account_ids_str}')")
            )

            # Delete profiles (CASCADE should handle this, but explicit is safer)
            session.execute(text(f"DELETE FROM user_profiles WHERE account_id IN ('{account_ids_str}')"))
            session.execute(text(f"DELETE FROM professional_profiles WHERE account_id IN ('{account_ids_str}')"))

            # Delete accounts
            result = session.execute(text(f"DELETE FROM accounts WHERE {where_clause}"))
            deleted_accounts = result.rowcount

        # Clean up LEGACY tables (if they still exist)
        deleted_users = 0
        deleted_professionals = 0
        try:
            # Pre-capture professional IDs (for relation cleanup)
            test_professional_ids = session.execute(
                text(f"SELECT id FROM professionals WHERE {where_clause}")
            ).fetchall()

            # Delete relations first to avoid foreign key constraints
            if test_professional_ids:
                professional_id_list = [str(row[0]) for row in test_professional_ids]
                professional_ids_str = "', '".join(professional_id_list)

                # Only if still using legacy professionals table
                session.execute(
                    text(f"DELETE FROM professional_modalities WHERE professional_id IN ('{professional_ids_str}')")
                )
                session.execute(
                    text(f"DELETE FROM professional_specialties WHERE professional_id IN ('{professional_ids_str}')")
                )
                session.execute(
                    text(
                        f"DELETE FROM professional_therapeutic_approaches "
                        f"WHERE professional_id IN ('{professional_ids_str}')"
                    )
                )

            # Users
            result = session.execute(text(f"DELETE FROM users WHERE {where_clause}"))
            deleted_users = result.rowcount

            # Professionals
            result = session.execute(text(f"DELETE FROM professionals WHERE {where_clause}"))
            deleted_professionals = result.rowcount
        except Exception:
            # Tables might not exist, that's ok
            pass

        # Reference tables (only test-ish data)
        # Delete in correct order to avoid foreign key constraints
        session.execute(
            text(
                "DELETE FROM professional_specialties "
                "WHERE specialty_id IN (SELECT id FROM specialties WHERE "
                "name LIKE 'Test %' OR name LIKE '% Test' OR name = 'psychology')"
            )
        )
        session.execute(
            text("DELETE FROM specialties WHERE name LIKE 'Test %' OR name LIKE '% Test' OR name = 'psychology'")
        )

        session.execute(
            text(
                "DELETE FROM professional_therapeutic_approaches "
                "WHERE therapeutic_approach_id IN (SELECT id FROM therapeutic_approaches WHERE "
                "name LIKE 'Test %' OR name LIKE '% Test')"
            )
        )
        session.execute(text("DELETE FROM therapeutic_approaches WHERE name LIKE 'Test %' OR name LIKE '% Test'"))

        session.execute(
            text(
                "DELETE FROM professional_modalities "
                "WHERE modality_id IN (SELECT id FROM modalities WHERE name LIKE 'Test %' OR name LIKE '% Test')"
            )
        )
        session.execute(text("DELETE FROM modalities WHERE name LIKE 'Test %' OR name LIKE '% Test'"))

        session.commit()
        print(
            f"✅ Test data cleanup completed (LOCAL): {deleted_accounts} accounts, "
            f"{deleted_users} users, {deleted_professionals} professionals removed"
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        session.rollback()
        print(f"⚠️ Warning: Could not clean test data (LOCAL): {e}")
    finally:
        session.close()


# ...existing code...


# -------------------------------------------------------------------
# Pytest fixtures
# -------------------------------------------------------------------
@pytest.fixture(scope="session")
def engine_and_session_factory():
    """
    Construct engine and session factory once per test session (LOCAL mode only).
    """
    engine, session_factory = _build_engine_and_session_factory()
    Base.metadata.create_all(bind=engine)

    # Insert default roles for the unified accounts system
    session = session_factory()
    try:
        from app.models.role import Role

        # Check if roles already exist
        existing_roles = session.query(Role).count()
        if existing_roles == 0:
            roles = [
                Role(name="user", description="Regular user account"),
                Role(name="professional", description="Professional/therapist account"),
                Role(name="admin", description="Administrator account"),
            ]
            session.add_all(roles)
            session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

    yield engine, session_factory


@pytest.fixture(scope="session", autouse=False)
def setup_test_db(engine_and_session_factory):  # pylint: disable=redefined-outer-name
    """
    One-time setup/teardown of test DB schema.
    """
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)
    yield
    _cleanup_test_data(session_factory)


@pytest.fixture(scope="function")
def db_session(engine_and_session_factory, setup_test_db):  # pylint: disable=redefined-outer-name
    """
    Provide a new database session for a test.
    """
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        _cleanup_test_data(session_factory)


@pytest.fixture
def client(engine_and_session_factory):  # pylint: disable=redefined-outer-name
    """
    Provide a TestClient for LOCAL mode or a simple HTTP client for REMOTE mode.
    """
    app_base_url = os.getenv("APP_BASE_URL", "").rstrip("/")  # pylint: disable=redefined-outer-name
    if app_base_url:

        class RemoteClient:
            """HTTP client for remote testing."""

            def __init__(self, base_url):
                self.base_url = base_url
                self.session = requests.Session()

            def request(self, method, url, **kwargs):
                full_url = self.base_url + url
                return self.session.request(method, full_url, **kwargs)

            def get(self, url, **kwargs):
                return self.request("GET", url, **kwargs)

            def post(self, url, **kwargs):
                return self.request("POST", url, **kwargs)

            def put(self, url, **kwargs):
                return self.request("PUT", url, **kwargs)

            def patch(self, url, **kwargs):
                return self.request("PATCH", url, **kwargs)

            def delete(self, url, **kwargs):
                return self.request("DELETE", url, **kwargs)

        return RemoteClient(app_base_url)

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


@pytest.fixture(scope="function", autouse=True)
def reset_db_before_each_test(engine_and_session_factory):  # pylint: disable=redefined-outer-name
    """
    Ensure test data is cleaned before each test (LOCAL mode only).
    """
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
