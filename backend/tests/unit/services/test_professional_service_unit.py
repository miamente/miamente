"""
Unit tests for ProfessionalService.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.professional_service import ProfessionalService
from app.models.professional import Professional
from app.schemas.professional import ProfessionalUpdate


class TestProfessionalServiceUnit:
    """Unit tests for ProfessionalService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def professional_service(self, mock_db):
        """ProfessionalService instance with mocked database."""
        return ProfessionalService(mock_db)

    @pytest.fixture
    def sample_professional(self):
        """Sample professional for testing."""
        professional = Mock(spec=Professional)
        professional.id = "test-professional-1"
        professional.email = "test@example.com"
        professional.full_name = "Dr. Test Professional"
        professional.phone = "+1234567890"
        professional.phone_country_code = "+1"
        professional.phone_number = "234567890"
        professional.hashed_password = "hashed_password"
        professional.is_active = True
        professional.is_verified = True
        professional.profile_picture = "profile.jpg"
        professional.license_number = "LIC123"
        professional.years_experience = 5
        professional.rate_cents = 50000
        professional.custom_rate_cents = None
        professional.currency = "COP"
        professional.bio = "Test bio"
        professional.academic_experience = '{"degree": "PhD"}'
        professional.work_experience = '{"company": "Test Clinic"}'
        professional.certifications = '{"cert": "CBT"}'
        professional.languages = ["English", "Spanish"]
        professional.therapy_approaches_ids = ["approach-1", "approach-2"]
        professional.specialty_ids = ["specialty-1", "specialty-2"]
        professional.timezone = "America/Bogota"
        professional.working_hours = '{"monday": "9-17"}'
        professional.emergency_contact = "Emergency Contact"
        professional.emergency_phone = "+1234567890"
        return professional

    def test_get_professional_by_id_found(self, professional_service, mock_db, sample_professional):
        """Test getting a professional by ID that exists."""
        # Arrange
        professional_id = "test-professional-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professional_by_id(professional_id)

        # Assert
        assert result == sample_professional
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_professional_by_id_not_found(self, professional_service, mock_db):
        """Test getting a professional by ID that doesn't exist."""
        # Arrange
        professional_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professional_by_id(professional_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_email_found(self, professional_service, mock_db, sample_professional):
        """Test getting a professional by email that exists."""
        # Arrange
        email = "test@example.com"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professional_by_email(email)

        # Assert
        assert result == sample_professional
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_professional_by_email_not_found(self, professional_service, mock_db):
        """Test getting a professional by email that doesn't exist."""
        # Arrange
        email = "nonexistent@example.com"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professional_by_email(email)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professionals_with_pagination(self, professional_service, mock_db):
        """Test getting professionals with pagination."""
        # Arrange
        skip = 10
        limit = 5
        mock_professionals = [Mock(spec=Professional) for _ in range(3)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_professionals
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professionals(skip=skip, limit=limit)

        # Assert
        assert result == mock_professionals
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once()
        mock_filter.offset.assert_called_once_with(skip)
        mock_offset.limit.assert_called_once_with(limit)

    def test_get_professionals_default_pagination(self, professional_service, mock_db):
        """Test getting professionals with default pagination."""
        # Arrange
        mock_professionals = [Mock(spec=Professional) for _ in range(2)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_professionals
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professionals()

        # Assert
        assert result == mock_professionals
        mock_filter.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)

    def test_get_professionals_by_specialty(self, professional_service, mock_db):
        """Test getting professionals by specialty."""
        # Arrange
        specialty = "psychology"
        mock_professionals = [Mock(spec=Professional) for _ in range(2)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_professionals
        mock_db.query.return_value = mock_query

        # Act
        result = professional_service.get_professionals_by_specialty(specialty)

        # Assert
        assert result == mock_professionals
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once()

    def test_update_professional_success(self, professional_service, mock_db, sample_professional):
        """Test updating a professional successfully."""
        # Arrange
        professional_id = "test-professional-1"
        update_data = ProfessionalUpdate(
            full_name="Updated Name", bio="Updated bio", specialty_ids=["specialty-3", "specialty-4"]
        )

        # Mock the specialty service that was created in the constructor
        mock_specialty_service = Mock()
        professional_service.specialty_service = mock_specialty_service
        mock_specialty_service.add_specialties_to_professional = Mock()

        # Mock get_professional_by_id to return our sample professional
        professional_service.get_professional_by_id = Mock(return_value=sample_professional)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_service.update_professional(professional_id, update_data)

        # Assert
        assert result == sample_professional
        assert sample_professional.full_name == "Updated Name"
        assert sample_professional.bio == "Updated bio"
        mock_specialty_service.add_specialties_to_professional.assert_called_once_with(
            professional_id, ["specialty-3", "specialty-4"]
        )
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_professional_not_found(self, professional_service, mock_db):
        """Test updating a professional that doesn't exist."""
        # Arrange
        professional_id = "non-existent-id"
        update_data = ProfessionalUpdate(full_name="Updated Name")

        # Mock get_professional_by_id to return None
        professional_service.get_professional_by_id = Mock(return_value=None)

        # Act
        result = professional_service.update_professional(professional_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_professional_without_specialty_ids(self, professional_service, mock_db, sample_professional):
        """Test updating a professional without specialty_ids."""
        # Arrange
        professional_id = "test-professional-1"
        update_data = ProfessionalUpdate(full_name="Updated Name", bio="Updated bio")

        # Mock the specialty service that was created in the constructor
        mock_specialty_service = Mock()
        professional_service.specialty_service = mock_specialty_service

        # Mock get_professional_by_id to return our sample professional
        professional_service.get_professional_by_id = Mock(return_value=sample_professional)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_service.update_professional(professional_id, update_data)

        # Assert
        assert result == sample_professional
        assert sample_professional.full_name == "Updated Name"
        assert sample_professional.bio == "Updated bio"
        mock_specialty_service.add_specialties_to_professional.assert_not_called()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_professional_exception_handling(self, professional_service, mock_db, sample_professional):
        """Test update professional with exception handling."""
        # Arrange
        professional_id = "test-professional-1"
        update_data = ProfessionalUpdate(full_name="Updated Name", specialty_ids=["specialty-3"])

        # Mock the specialty service to raise an exception
        from sqlalchemy.exc import SQLAlchemyError

        mock_specialty_service = Mock()
        professional_service.specialty_service = mock_specialty_service
        mock_specialty_service.add_specialties_to_professional = Mock(side_effect=SQLAlchemyError("Database error"))

        # Mock get_professional_by_id to return our sample professional
        professional_service.get_professional_by_id = Mock(return_value=sample_professional)
        mock_db.rollback = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            professional_service.update_professional(professional_id, update_data)

        assert exc_info.value.status_code == 500
        assert "Failed to update professional" in str(exc_info.value.detail)
        mock_db.rollback.assert_called_once()

    def test_deactivate_professional_success(self, professional_service, mock_db, sample_professional):
        """Test deactivating a professional successfully."""
        # Arrange
        professional_id = "test-professional-1"

        # Mock get_professional_by_id to return our sample professional
        professional_service.get_professional_by_id = Mock(return_value=sample_professional)
        mock_db.commit = Mock()

        # Act
        result = professional_service.deactivate_professional(professional_id)

        # Assert
        assert result is True
        assert sample_professional.is_active is False
        mock_db.commit.assert_called_once()

    def test_deactivate_professional_not_found(self, professional_service, mock_db):
        """Test deactivating a professional that doesn't exist."""
        # Arrange
        professional_id = "non-existent-id"

        # Mock get_professional_by_id to return None
        professional_service.get_professional_by_id = Mock(return_value=None)

        # Act
        result = professional_service.deactivate_professional(professional_id)

        # Assert
        assert result is False
        mock_db.commit.assert_not_called()

    def test_deactivate_professional_exception_handling(self, professional_service, mock_db, sample_professional):
        """Test deactivate professional with exception handling."""
        # Arrange
        professional_id = "test-professional-1"

        # Mock get_professional_by_id to return our sample professional
        professional_service.get_professional_by_id = Mock(return_value=sample_professional)
        from sqlalchemy.exc import SQLAlchemyError

        mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
        mock_db.rollback = Mock()

        # Act
        result = professional_service.deactivate_professional(professional_id)

        # Assert
        assert result is False
        mock_db.rollback.assert_called_once()

    def test_professional_service_initialization(self, mock_db):
        """Test ProfessionalService initialization."""
        # Act
        service = ProfessionalService(mock_db)

        # Assert
        assert service.db == mock_db
        assert service.specialty_service is not None
        assert service.therapeutic_approach_service is not None
        assert service.modality_service is not None
