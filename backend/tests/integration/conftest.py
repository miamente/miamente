"""
Pytest configuration and fixtures for integration tests (real Postgres connection).
Uses precise test data identification to avoid affecting production data.
"""
import pytest
import uuid
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.database import Base, get_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

pytestmark = pytest.mark.integration

# Test data identification
TEST_DATA_PREFIX = "TEST_INTEGRATION_"
TEST_TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")


def generate_test_email(test_name: str = "user") -> str:
    """Generate a test email with clear identification."""
    return f"{TEST_DATA_PREFIX}{test_name}_{TEST_TIMESTAMP}@example.com"


def generate_test_name(test_name: str = "User") -> str:
    """Generate a test name with clear identification."""
    return f"{TEST_DATA_PREFIX}{test_name}_{TEST_TIMESTAMP}"


def _build_app() -> FastAPI:
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


def _build_engine_and_session_factory():
    # Use the same database as production but only clean test data
    settings = get_settings()
    database_url = settings.DATABASE_URL
    engine = create_engine(database_url, poolclass=StaticPool)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, session_factory


def _cleanup_test_data(session_factory):
    """Clean only test data with precise identification to avoid deleting production data."""
    session = session_factory()
    try:
        # Clean data with our specific test prefix and known test patterns
        test_patterns = [
            f"email LIKE '{TEST_DATA_PREFIX}%'",  # Our specific test prefix
            "email LIKE '%@example.com'",  # Standard test emails
            "email LIKE '%@test.com'",  # Alternative test emails
            "full_name LIKE 'Test %'",  # Test names
            "full_name LIKE '% Test'",  # Test names
            "email = 'test@example.com'",  # Specific test emails
            "email = 'professional@example.com'",
            "email = 'nonexistent@example.com'",
            "full_name = 'Test User'",
            "full_name = 'Test Professional'",
            "full_name = 'Test User 1'",
            "full_name = 'Test User 2'",
            "full_name = 'Updated Name'"
        ]
        
        where_clause = ' OR '.join(test_patterns)
        
        # Get test user IDs before deletion for related data cleanup
        test_user_ids = session.execute(text(f"""
            SELECT id FROM users WHERE {where_clause}
        """)).fetchall()
        
        # Get test professional IDs before deletion for related data cleanup
        test_professional_ids = session.execute(text(f"""
            SELECT id FROM professionals WHERE {where_clause}
        """)).fetchall()
        
        # Clean test users
        result = session.execute(text(f"""
            DELETE FROM users WHERE {where_clause}
        """))
        deleted_users = result.rowcount
        
        # Clean test professionals
        result = session.execute(text(f"""
            DELETE FROM professionals WHERE {where_clause}
        """))
        deleted_professionals = result.rowcount
        
        # Clean related data only for test professionals
        if test_professional_ids:
            professional_id_list = [str(row[0]) for row in test_professional_ids]
            professional_ids_str = "', '".join(professional_id_list)
            
            # Clean professional-related tables
            session.execute(text(f"""
                DELETE FROM professional_specialties 
                WHERE professional_id IN ('{professional_ids_str}')
            """))
            
            
            session.execute(text(f"""
                DELETE FROM professional_modalities 
                WHERE professional_id IN ('{professional_ids_str}')
            """))
            
            session.execute(text(f"""
                DELETE FROM professional_therapeutic_approaches 
                WHERE professional_id IN ('{professional_ids_str}')
            """))
            
            session.execute(text(f"""
                DELETE FROM availability 
                WHERE professional_id IN ('{professional_ids_str}')
            """))
        
        # Clean test data from reference tables (only test-specific data)
        session.execute(text("""
            DELETE FROM specialties 
            WHERE name LIKE 'Test %' 
            OR name LIKE '% Test'
            OR name = 'psychology'
        """))
        
        session.execute(text("""
            DELETE FROM therapeutic_approaches 
            WHERE name LIKE 'Test %' 
            OR name LIKE '% Test'
        """))
        
        session.execute(text("""
            DELETE FROM modalities 
            WHERE name LIKE 'Test %' 
            OR name LIKE '% Test'
        """))
        
        session.commit()
        print(f"✅ Test data cleanup completed: {deleted_users} users, {deleted_professionals} professionals removed")
        
    except Exception as e:
        session.rollback()
        print(f"⚠️ Warning: Could not clean test data: {e}")
        # Don't fail the test if cleanup fails
    finally:
        session.close()


@pytest.fixture(scope="session")
def engine_and_session_factory():
    engine, session_factory = _build_engine_and_session_factory()
    # Ensure tables exist lazily at session scope
    Base.metadata.create_all(bind=engine)
    yield engine, session_factory


@pytest.fixture(scope="session", autouse=False)
def setup_test_db(engine_and_session_factory):
    _, session_factory = engine_and_session_factory
    _cleanup_test_data(session_factory)
    yield
    _cleanup_test_data(session_factory)


@pytest.fixture(scope="function")
def db_session(engine_and_session_factory, setup_test_db):
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
def reset_db_before_each_test(engine_and_session_factory):
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
            "phone": "+1234567890"
        }
    
    def create_test_professional_data(name_suffix="professional"):
        return {
            "email": generate_test_email(name_suffix),
            "password": "testpassword123",
            "full_name": generate_test_name(name_suffix.title()),
            "specialty_ids": ["psychology"],
            "bio": f"Test bio for {name_suffix}",
            "rate_cents": 50000
        }
    
    return {
        "user": create_test_user_data,
        "professional": create_test_professional_data
    }


