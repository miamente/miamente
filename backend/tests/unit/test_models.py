"""
Unit tests for database models.
"""
import pytest
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from tests.conftest import UserModel, ProfessionalModel, AppointmentModel, AvailabilityModel, PaymentModel


class TestUserModel:
    """Test User model."""
    
    def test_create_user(self, db_session):
        """Test creating a user."""
        user = UserModel(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User",
            phone="+1234567890",
            is_verified=True
        )
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.phone == "+1234567890"
        assert user.is_verified is True
        assert user.created_at is not None
        # updated_at is None initially, only set on updates
    
    def test_user_email_unique(self, db_session):
        """Test that user email must be unique."""
        user1 = UserModel(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User 1"
        )
        user2 = UserModel(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User 2"
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_defaults(self, db_session):
        """Test user default values."""
        user = UserModel(
            email="test@example.com",
            hashed_password="hashed_password",
            full_name="Test User"
        )
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.is_verified is False
        assert user.phone is None


class TestProfessionalModel:
    """Test Professional model."""
    
    def test_create_professional(self, db_session):
        """Test creating a professional."""
        professional = ProfessionalModel(
            email="professional@example.com",
            hashed_password="hashed_password",
            full_name="Test Professional",
            specialty="Psychology",
            bio="Test bio",
            rate_cents=50000,
            is_verified=True
        )
        
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(professional)
        
        assert professional.id is not None
        assert professional.email == "professional@example.com"
        assert professional.full_name == "Test Professional"
        assert professional.specialty == "Psychology"
        assert professional.bio == "Test bio"
        assert professional.rate_cents == 50000
        assert professional.is_verified is True
        assert professional.is_active is True
    
    def test_professional_defaults(self, db_session):
        """Test professional default values."""
        professional = ProfessionalModel(
            email="professional@example.com",
            hashed_password="hashed_password",
            full_name="Test Professional",
            specialty="Psychology",  # Required field
            rate_cents=0  # Required field
        )
        
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(professional)
        
        assert professional.is_verified is False
        assert professional.is_active is True
        assert professional.rate_cents == 0
        assert professional.specialty == "Psychology"  # We set this value
        assert professional.bio is None


class TestAppointmentModel:
    """Test Appointment model."""
    
    def test_create_appointment(self, db_session, test_user_data, test_professional_data):
        """Test creating an appointment."""
        # Create user and professional first
        user = UserModel(**test_user_data, hashed_password="hashed")
        professional = ProfessionalModel(**test_professional_data, hashed_password="hashed")
        
        db_session.add(user)
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(user)
        db_session.refresh(professional)
        
        appointment = AppointmentModel(
            professional_id=professional.id,
            user_id=user.id,
            start_time=datetime(2024, 12, 1, 10, 0, 0, tzinfo=timezone.utc),
            end_time=datetime(2024, 12, 1, 11, 0, 0, tzinfo=timezone.utc),
            status="scheduled",
            notes="Test appointment"
        )
        
        db_session.add(appointment)
        db_session.commit()
        db_session.refresh(appointment)
        
        assert appointment.id is not None
        assert appointment.professional_id == professional.id
        assert appointment.user_id == user.id
        assert appointment.status == "scheduled"
        assert appointment.notes == "Test appointment"
        assert appointment.created_at is not None
        # updated_at is None initially, only set on updates
    
    def test_appointment_relationships(self, db_session, test_user_data, test_professional_data):
        """Test appointment relationships."""
        # Create user and professional
        user = UserModel(**test_user_data, hashed_password="hashed")
        professional = ProfessionalModel(**test_professional_data, hashed_password="hashed")
        
        db_session.add(user)
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(user)
        db_session.refresh(professional)
        
        appointment = AppointmentModel(
            professional_id=professional.id,
            user_id=user.id,
            start_time=datetime(2024, 12, 1, 10, 0, 0, tzinfo=timezone.utc),
            end_time=datetime(2024, 12, 1, 11, 0, 0, tzinfo=timezone.utc),
            status="scheduled"
        )
        
        db_session.add(appointment)
        db_session.commit()
        db_session.refresh(appointment)
        
        # Test relationships
        assert appointment.professional == professional
        assert appointment.user == user
        assert appointment in user.appointments
        assert appointment in professional.appointments


class TestAvailabilityModel:
    """Test Availability model."""
    
    def test_create_availability(self, db_session, test_professional_data):
        """Test creating availability."""
        professional = ProfessionalModel(**test_professional_data, hashed_password="hashed")
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(professional)
        
        availability = AvailabilityModel(
            professional_id=professional.id,
            day_of_week=1,  # Monday
            start_time="09:00:00",
            end_time="17:00:00",
            is_available=True
        )
        
        db_session.add(availability)
        db_session.commit()
        db_session.refresh(availability)
        
        assert availability.id is not None
        assert availability.professional_id == professional.id
        assert availability.day_of_week == 1
        assert availability.start_time == "09:00:00"
        assert availability.end_time == "17:00:00"
        assert availability.is_available is True
    
    def test_availability_relationship(self, db_session, test_professional_data):
        """Test availability relationship with professional."""
        professional = ProfessionalModel(**test_professional_data, hashed_password="hashed")
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(professional)
        
        availability = AvailabilityModel(
            professional_id=professional.id,
            day_of_week=1,
            start_time="09:00:00",
            end_time="17:00:00"
        )
        
        db_session.add(availability)
        db_session.commit()
        db_session.refresh(availability)
        
        assert availability.professional == professional
        assert availability in professional.availability


class TestPaymentModel:
    """Test Payment model."""
    
    def test_create_payment(self, db_session, test_user_data, test_professional_data):
        """Test creating a payment."""
        user = UserModel(**test_user_data, hashed_password="hashed")
        professional = ProfessionalModel(**test_professional_data, hashed_password="hashed")
        
        db_session.add(user)
        db_session.add(professional)
        db_session.commit()
        db_session.refresh(user)
        db_session.refresh(professional)
        
        payment = PaymentModel(
            user_id=user.id,
            professional_id=professional.id,
            amount_cents=50000,
            currency="USD",
            status="pending",
            payment_method="stripe",
            external_payment_id="pi_test_123"
        )
        
        db_session.add(payment)
        db_session.commit()
        db_session.refresh(payment)
        
        assert payment.id is not None
        assert payment.user_id == user.id
        assert payment.professional_id == professional.id
        assert payment.amount_cents == 50000
        assert payment.currency == "USD"
        assert payment.status == "pending"
        assert payment.payment_method == "stripe"
        assert payment.external_payment_id == "pi_test_123"
        assert payment.created_at is not None
        # updated_at is None initially, only set on updates
