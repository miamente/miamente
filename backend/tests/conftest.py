"""
Pytest configuration and fixtures for backend tests.
"""
import asyncio
import os
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings
from tests.unit.services.test_config import test_settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

# Override settings for testing
import app.core.config
app.core.config.settings = test_settings

# Create test app without TrustedHostMiddleware
test_app = FastAPI(
    title=test_settings.PROJECT_NAME,
    version=test_settings.VERSION,
    description="Test Backend API for Miamente mental health platform",
    openapi_url=f"{test_settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS for test app
test_app.add_middleware(
    CORSMiddleware,
    allow_origins=test_settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router in test app
test_app.include_router(api_router, prefix=test_settings.API_V1_STR)

@test_app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Miamente Test Backend API", "version": test_settings.VERSION}

@test_app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# Test database URL
SQLALCHEMY_DATABASE_URL = "postgresql://manueljurado@localhost:5432/miamente_test"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override the database dependency
def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency in the test app
test_app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(test_app)

# Create tables using the actual models
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Setup and teardown for the entire test session."""
    # Clean up before starting tests
    cleanup_database()
    yield
    # Clean up after all tests are done
    cleanup_database()

def cleanup_database():
    """Clean up all test data from the database."""
    session = TestingSessionLocal()
    try:
        # Disable foreign key checks temporarily
        session.execute(text("SET session_replication_role = replica"))
        
        # Clean up all tables in the correct order
        session.execute(text("TRUNCATE TABLE appointments CASCADE"))
        session.execute(text("TRUNCATE TABLE payments CASCADE"))
        session.execute(text("TRUNCATE TABLE availability CASCADE"))
        session.execute(text("TRUNCATE TABLE professional_modalities CASCADE"))
        session.execute(text("TRUNCATE TABLE professional_therapeutic_approaches CASCADE"))
        session.execute(text("TRUNCATE TABLE professional_specialties CASCADE"))
        session.execute(text("TRUNCATE TABLE professional_specialties_new CASCADE"))
        session.execute(text("TRUNCATE TABLE professionals CASCADE"))
        session.execute(text("TRUNCATE TABLE users CASCADE"))
        session.execute(text("TRUNCATE TABLE specialties CASCADE"))
        session.execute(text("TRUNCATE TABLE specialties_new CASCADE"))
        session.execute(text("TRUNCATE TABLE therapeutic_approaches CASCADE"))
        session.execute(text("TRUNCATE TABLE modalities CASCADE"))
        
        # Re-enable foreign key checks
        session.execute(text("SET session_replication_role = DEFAULT"))
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error during cleanup: {e}")
    finally:
        session.close()

@pytest.fixture(scope="function", autouse=True)
def db_session():
    """Create a test database session."""
    # Clean up before each test
    cleanup_database()
    
    # Create tables using the actual models
    Base.metadata.create_all(bind=engine)
    
    # Create a new session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Clean up after each test
        cleanup_database()

@pytest.fixture
def test_user_data():
    """Test user data fixture."""
    return {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def test_professional_data():
    """Test professional data fixture."""
    return {
        "full_name": "Test Professional",
        "email": "professional@example.com",
        "password": "testpassword123",
        "rate_cents": 50000,
        "currency": "COP"
    }

@pytest.fixture
def client():
    """Test client fixture."""
    return TestClient(test_app)