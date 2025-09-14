"""
Pytest configuration and fixtures for backend tests.
"""
import asyncio
import os
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.main import app
from app.core.database import get_db
from app.core.config import settings
from test_config import test_settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

# Create a separate Base for tests to avoid conflicts
from sqlalchemy.orm import declarative_base
TestBase = declarative_base()

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


# Test models compatible with SQLite
class UserModel(TestBase):
    """Test User model compatible with SQLite."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string for user preferences
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("AppointmentModel", back_populates="user")
    payments = relationship("PaymentModel", back_populates="user")
    held_slots = relationship("AvailabilityModel", back_populates="user")


class ProfessionalModel(TestBase):
    """Test Professional model compatible with SQLite."""
    
    __tablename__ = "professionals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)
    
    # Professional specific fields
    specialty = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=True)
    years_experience = Column(Integer, default=0)
    rate_cents = Column(Integer, nullable=False)  # Rate in cents
    currency = Column(String(3), default="COP")
    bio = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)  # JSON string instead of ARRAY
    languages = Column(Text, nullable=True)  # JSON string instead of ARRAY
    therapy_approaches = Column(Text, nullable=True)  # JSON string instead of ARRAY
    
    # Availability settings
    timezone = Column(String(50), default="America/Bogota")
    working_hours = Column(Text, nullable=True)  # JSON string
    
    # Contact information
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("AppointmentModel", back_populates="professional")
    availability = relationship("AvailabilityModel", back_populates="professional")


class AppointmentModel(TestBase):
    """Test Appointment model compatible with SQLite."""
    
    __tablename__ = "appointments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    availability_id = Column(UUID(as_uuid=True), ForeignKey("availability.id"), nullable=False)
    
    # Appointment details
    status = Column(String(50), default="pending_payment")
    paid = Column(Boolean, default=False)
    
    # Time information
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Integer, default=60)  # Duration in minutes
    timezone = Column(String(50), default="America/Bogota")
    
    # Session information
    jitsi_url = Column(Text, nullable=True)
    session_notes = Column(Text, nullable=True)
    session_rating = Column(Integer, nullable=True)  # 1-5 rating
    session_feedback = Column(Text, nullable=True)
    
    # Payment information
    payment_amount_cents = Column(Integer, nullable=False)
    payment_currency = Column(String(3), default="COP")
    payment_provider = Column(String(50), default="mock")
    payment_status = Column(String(50), default="pending")
    payment_id = Column(String(255), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("UserModel", back_populates="appointments")
    professional = relationship("ProfessionalModel", back_populates="appointments")
    availability = relationship("AvailabilityModel")
    payment = relationship("PaymentModel", back_populates="appointment", uselist=False)


class AvailabilityModel(TestBase):
    """Test Availability model compatible with SQLite."""
    
    __tablename__ = "availability"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    
    # Time information
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(String(10), nullable=False)  # HH:MM format
    duration = Column(Integer, default=60)  # Duration in minutes
    timezone = Column(String(50), default="America/Bogota")
    
    # Slot management
    status = Column(String(50), default="free")
    held_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    held_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    professional = relationship("ProfessionalModel", back_populates="availability")
    user = relationship("UserModel", back_populates="held_slots")


class PaymentModel(TestBase):
    """Test Payment model compatible with SQLite."""
    
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="COP")
    provider = Column(String(50), default="mock")
    status = Column(String(50), default="pending")
    
    # Provider specific information
    provider_payment_id = Column(String(255), nullable=True)
    provider_transaction_id = Column(String(255), nullable=True)
    provider_response = Column(Text, nullable=True)  # JSON string instead of JSONB
    
    # Payment metadata
    description = Column(Text, nullable=True)
    payment_metadata = Column(Text, nullable=True)  # JSON string instead of JSONB
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    appointment = relationship("AppointmentModel", back_populates="payment")
    user = relationship("UserModel", back_populates="payments")


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    TestBase.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    yield session
    
    # Clean up
    session.close()
    TestBase.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    # Override database dependency for test app
    test_app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(test_app) as test_client:
        yield test_client
    
    test_app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "full_name": "Test User",
        "phone": "+1234567890"
    }


@pytest.fixture
def test_professional_data():
    """Sample professional data for testing."""
    return {
        "email": "professional@example.com",
        "full_name": "Test Professional",
        "phone": "+1234567890",
        "specialty": "Psychology",
        "bio": "Test professional bio",
        "rate_cents": 50000,  # $500.00
        "is_verified": True
    }


@pytest.fixture
def test_appointment_data():
    """Sample appointment data for testing."""
    return {
        "professional_id": 1,
        "user_id": 1,
        "start_time": "2024-12-01T10:00:00Z",
        "end_time": "2024-12-01T11:00:00Z",
        "status": "scheduled",
        "notes": "Test appointment"
    }
