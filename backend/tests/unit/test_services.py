"""
Unit tests for services.
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from tests.unit.test_user_service import TestUserService as UserService
from tests.unit.test_professional_service import TestProfessionalService as ProfessionalService
from tests.unit.test_appointment_service import TestAppointmentService as AppointmentService
from tests.unit.test_auth_service import TestAuthService as AuthService
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate
from tests.fixtures.test_appointment import TestAppointmentCreate
from tests.conftest import UserModel, ProfessionalModel, AppointmentModel


class TestUserService:
    """Test UserService."""
    
    def test_get_user_by_email(self, db_session):
        """Test getting user by email."""
        # Create user using AuthService first
        auth_service = AuthService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
        
        created_user = auth_service.create_user(user_data)
        
        # Now test UserService
        service = UserService(db_session)
        found_user = service.get_user_by_email("test@example.com")
        
        assert found_user is not None
        assert found_user.email == "test@example.com"
        assert found_user.full_name == "Test User"
    
    def test_get_user_by_email_not_found(self, db_session):
        """Test getting user by email when not found."""
        service = UserService(db_session)
        found_user = service.get_user_by_email("nonexistent@example.com")
        assert found_user is None
    
    def test_update_user(self, db_session):
        """Test updating a user."""
        # Create user first
        auth_service = AuthService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
        
        created_user = auth_service.create_user(user_data)
        
        # Test update
        service = UserService(db_session)
        update_data = UserUpdate(full_name="Updated Name")
        updated_user = service.update_user(created_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.full_name == "Updated Name"
        assert updated_user.email == "test@example.com"
    
    def test_verify_user(self, db_session):
        """Test verifying a user."""
        # Create user first
        auth_service = AuthService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
        
        created_user = auth_service.create_user(user_data)
        
        # Test verification
        service = UserService(db_session)
        update_data = UserUpdate(is_verified=True)
        updated_user = service.update_user(created_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.is_verified is True


class TestProfessionalService:
    """Test ProfessionalService."""
    
    def test_get_professionals(self, db_session):
        """Test getting all professionals."""
        # Create professionals using AuthService first
        auth_service = AuthService(db_session)
        
        professional1_data = ProfessionalCreate(
            email="professional1@example.com",
            password="testpassword123",
            full_name="Professional 1",
            specialty="Psychology",
            rate_cents=50000
        )
        
        professional2_data = ProfessionalCreate(
            email="professional2@example.com",
            password="testpassword123",
            full_name="Professional 2",
            specialty="Therapy",
            rate_cents=60000
        )
        
        auth_service.create_professional(professional1_data)
        auth_service.create_professional(professional2_data)
        
        # Test getting professionals
        service = ProfessionalService(db_session)
        professionals = service.get_professionals()
        
        assert len(professionals) == 2
        assert professionals[0].email in ["professional1@example.com", "professional2@example.com"]
        assert professionals[1].email in ["professional1@example.com", "professional2@example.com"]
    
    def test_get_professional_by_id(self, db_session):
        """Test getting professional by ID."""
        # Create professional first
        auth_service = AuthService(db_session)
        professional_data = ProfessionalCreate(
            email="professional@example.com",
            password="testpassword123",
            full_name="Test Professional",
            specialty="Psychology",
            rate_cents=50000
        )
        
        created_professional = auth_service.create_professional(professional_data)
        
        # Test getting by ID
        service = ProfessionalService(db_session)
        found_professional = service.get_professional_by_id(created_professional.id)
        
        assert found_professional is not None
        assert found_professional.email == "professional@example.com"
        assert found_professional.full_name == "Test Professional"
    
    def test_verify_professional(self, db_session):
        """Test verifying a professional."""
        # Create professional first
        auth_service = AuthService(db_session)
        professional_data = ProfessionalCreate(
            email="professional@example.com",
            password="testpassword123",
            full_name="Test Professional",
            specialty="Psychology",
            rate_cents=50000
        )
        
        created_professional = auth_service.create_professional(professional_data)
        
        # Test verification
        service = ProfessionalService(db_session)
        update_data = ProfessionalUpdate(is_verified=True)
        updated_professional = service.update_professional(created_professional.id, update_data)
        
        assert updated_professional is not None
        assert updated_professional.is_verified is True


class TestAppointmentService:
    """Test AppointmentService."""
    
    def test_create_appointment(self, db_session, test_user_data, test_professional_data):
        """Test creating an appointment through service."""
        # Create user and professional
        auth_service = AuthService(db_session)
        user = auth_service.create_user(UserCreate(**test_user_data, password="testpassword123"))
        professional = auth_service.create_professional(ProfessionalCreate(**test_professional_data, password="testpassword123"))
        
        # Create appointment
        service = AppointmentService(db_session)
        appointment_data = TestAppointmentCreate(
            professional_id=professional.id,
            user_id=user.id,
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1),
            notes="Test appointment"
        )
        
        appointment = service.create_appointment(appointment_data)
        
        assert appointment is not None
        assert appointment.professional_id == professional.id
        assert appointment.user_id == user.id
        assert appointment.session_notes == "Test appointment"
        assert appointment.status == "pending_payment"
    
    def test_get_user_appointments(self, db_session, test_user_data, test_professional_data):
        """Test getting appointments for a user."""
        # Create user and professional
        auth_service = AuthService(db_session)
        user = auth_service.create_user(UserCreate(**test_user_data, password="testpassword123"))
        professional = auth_service.create_professional(ProfessionalCreate(**test_professional_data, password="testpassword123"))
        
        # Create appointment
        service = AppointmentService(db_session)
        appointment_data = TestAppointmentCreate(
            professional_id=professional.id,
            user_id=user.id,
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1)
        )
        
        service.create_appointment(appointment_data)
        
        # Get user appointments
        appointments = service.get_user_appointments(user.id)
        
        assert len(appointments) == 1
        assert appointments[0].user_id == user.id
        assert appointments[0].professional_id == professional.id
    
    def test_cancel_appointment(self, db_session, test_user_data, test_professional_data):
        """Test canceling an appointment."""
        # Create user and professional
        auth_service = AuthService(db_session)
        user = auth_service.create_user(UserCreate(**test_user_data, password="testpassword123"))
        professional = auth_service.create_professional(ProfessionalCreate(**test_professional_data, password="testpassword123"))
        
        # Create appointment
        service = AppointmentService(db_session)
        appointment_data = TestAppointmentCreate(
            professional_id=professional.id,
            user_id=user.id,
            start_time=datetime.now() + timedelta(days=1),
            end_time=datetime.now() + timedelta(days=1, hours=1)
        )
        
        appointment = service.create_appointment(appointment_data)
        
        # Cancel appointment
        cancelled = service.cancel_appointment(appointment.id)
        
        assert cancelled is True
        
        # Verify appointment is cancelled
        updated_appointment = service.get_appointment_by_id(appointment.id)
        assert updated_appointment.status == "cancelled"


class TestAuthService:
    """Test AuthService."""
    
    def test_verify_password(self, db_session):
        """Test password verification."""
        from app.core.security import verify_password, get_password_hash
        
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False
    
    def test_create_access_token(self, db_session):
        """Test creating access token."""
        from app.core.security import create_token_response
        
        user_data = {"sub": "test@example.com", "user_id": "123"}
        token_response = create_token_response(user_data)
        
        assert "access_token" in token_response
        assert token_response["token_type"] == "bearer"
    
    def test_authenticate_user(self, db_session):
        """Test user authentication."""
        # Create a user first
        auth_service = AuthService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
        
        user = auth_service.create_user(user_data)
        
        # Test authentication
        authenticated_user = auth_service.authenticate_user("test@example.com", "testpassword123")
        
        assert authenticated_user is not None
        assert authenticated_user.email == "test@example.com"
        assert authenticated_user.id == user.id
    
    def test_authenticate_user_wrong_password(self, db_session):
        """Test user authentication with wrong password."""
        # Create a user first
        auth_service = AuthService(db_session)
        user_data = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User"
        )
        
        auth_service.create_user(user_data)
        
        # Test authentication with wrong password
        authenticated_user = auth_service.authenticate_user("test@example.com", "wrongpassword")
        
        assert authenticated_user is None
    
    def test_authenticate_user_not_found(self, db_session):
        """Test user authentication when user not found."""
        auth_service = AuthService(db_session)
        authenticated_user = auth_service.authenticate_user("nonexistent@example.com", "password")
        
        assert authenticated_user is None