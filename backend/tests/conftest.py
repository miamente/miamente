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

# Create a separate Base for tests to avoid conflicts
from sqlalchemy.orm import declarative_base
TestBase = declarative_base()

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    appointments = relationship("AppointmentModel", back_populates="user")


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
    education = Column(Text, nullable=True)  # JSON string
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
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="scheduled")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    professional = relationship("ProfessionalModel", back_populates="appointments")
    user = relationship("UserModel", back_populates="appointments")


class AvailabilityModel(TestBase):
    """Test Availability model compatible with SQLite."""
    
    __tablename__ = "availability"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6 (Monday-Sunday)
    start_time = Column(String(8), nullable=False)  # HH:MM:SS format
    end_time = Column(String(8), nullable=False)  # HH:MM:SS format
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    professional = relationship("ProfessionalModel", back_populates="availability")


class PaymentModel(TestBase):
    """Test Payment model compatible with SQLite."""
    
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(String(50), default="pending")
    payment_method = Column(String(50), nullable=False)
    external_payment_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


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
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


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
