"""
Extended unit tests for professional service.
"""

import pytest
import uuid
from unittest.mock import Mock, patch
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from app.services.professional_service import ProfessionalService
from app.models.professional import Professional
from app.schemas.professional import ProfessionalUpdate


class TestProfessionalServiceExtendedUnit:
    """Extended test cases for ProfessionalService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()

    @pytest.fixture
    def professional_service(self, mock_db):
        """Create ProfessionalService instance with mocked database."""
        return ProfessionalService(mock_db)

    @pytest.fixture
    def sample_professional(self):
        """Sample professional object."""
        professional = Mock(spec=Professional)
        professional.id = uuid.uuid4()
        professional.email = "professional@example.com"
        professional.full_name = "Test Professional"
        professional.phone_country_code = "+1"
        professional.phone_number = "1234567890"
        professional.is_active = True
        professional.specialty_ids = [str(uuid.uuid4())]
        return professional

    @pytest.fixture
    def sample_professional_update(self):
        """Sample professional update data."""
        return ProfessionalUpdate(
            full_name="Updated Professional Name",
            phone_country_code="+44",
            phone_number="9876543210",
            bio="Updated bio",
            rate_cents=15000,
            specialty_ids=[str(uuid.uuid4()), str(uuid.uuid4())],
        )

    def test_get_professional_by_id_success(self, professional_service, mock_db, sample_professional):
        """Test getting professional by ID successfully."""
        professional_id = str(sample_professional.id)

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        result = professional_service.get_professional_by_id(professional_id)

        assert result == sample_professional
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_id_not_found(self, professional_service, mock_db):
        """Test getting professional by ID when professional not found."""
        professional_id = str(uuid.uuid4())

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = professional_service.get_professional_by_id(professional_id)

        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_email_success(self, professional_service, mock_db, sample_professional):
        """Test getting professional by email successfully."""
        email = sample_professional.email

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        result = professional_service.get_professional_by_email(email)

        assert result == sample_professional
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_email_not_found(self, professional_service, mock_db):
        """Test getting professional by email when professional not found."""
        email = "nonexistent@example.com"

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = professional_service.get_professional_by_email(email)

        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professionals_with_pagination(self, professional_service, mock_db):
        """Test getting professionals with pagination."""
        professionals = [Mock(spec=Professional) for _ in range(3)]
        skip = 10
        limit = 5

        mock_query = Mock()
        mock_query.filter.return_value.offset.return_value.limit.return_value.all.return_value = professionals
        mock_db.query.return_value = mock_query

        result = professional_service.get_professionals(skip=skip, limit=limit)

        assert result == professionals
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once_with(Professional.is_active)
        mock_query.filter.return_value.offset.assert_called_once_with(skip)
        mock_query.filter.return_value.offset.return_value.limit.assert_called_once_with(limit)

    def test_get_professionals_default_pagination(self, professional_service, mock_db):
        """Test getting professionals with default pagination."""
        professionals = [Mock(spec=Professional) for _ in range(2)]

        mock_query = Mock()
        mock_query.filter.return_value.offset.return_value.limit.return_value.all.return_value = professionals
        mock_db.query.return_value = mock_query

        result = professional_service.get_professionals()

        assert result == professionals
        mock_db.query.assert_called_once_with(Professional)
        mock_query.filter.assert_called_once_with(Professional.is_active)
        mock_query.filter.return_value.offset.assert_called_once_with(0)
        mock_query.filter.return_value.offset.return_value.limit.assert_called_once_with(100)

    def test_get_professionals_empty_result(self, professional_service, mock_db):
        """Test getting professionals when no professionals exist."""
        mock_query = Mock()
        mock_query.filter.return_value.offset.return_value.limit.return_value.all.return_value = []
        mock_db.query.return_value = mock_query

        result = professional_service.get_professionals()

        assert result == []
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professionals_by_specialty(self, professional_service, mock_db):
        """Test getting professionals by specialty."""
        specialty = "Psychology"
        professionals = [Mock(spec=Professional) for _ in range(2)]

        # Create a mock that returns itself for chaining
        mock_filtered_query = Mock()
        mock_filtered_query.all.return_value = professionals

        mock_query = Mock()
        mock_query.filter.return_value = mock_filtered_query
        mock_db.query.return_value = mock_query

        result = professional_service.get_professionals_by_specialty(specialty)

        assert result == professionals
        mock_db.query.assert_called_once_with(Professional)
        # Verify that filter was called (the chaining happens internally)
        mock_query.filter.assert_called()

    def test_get_professionals_by_specialty_empty_result(self, professional_service, mock_db):
        """Test getting professionals by specialty when no professionals found."""
        specialty = "NonExistentSpecialty"

        mock_query = Mock()
        mock_query.filter.return_value.all.return_value = []
        mock_db.query.return_value = mock_query

        result = professional_service.get_professionals_by_specialty(specialty)

        assert result == []
        mock_db.query.assert_called_once_with(Professional)

    def test_update_professional_success(
        self, professional_service, mock_db, sample_professional, sample_professional_update
    ):
        """Test updating professional successfully."""
        professional_id = str(sample_professional.id)

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            with patch.object(
                professional_service.specialty_service, "add_specialties_to_professional"
            ) as mock_add_specialties:
                result = professional_service.update_professional(professional_id, sample_professional_update)

                assert result == sample_professional
                mock_add_specialties.assert_called_once_with(professional_id, sample_professional_update.specialty_ids)
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(sample_professional)

                # Verify that professional attributes were updated
                assert sample_professional.full_name == "Updated Professional Name"
                assert sample_professional.phone_country_code == "+44"
                assert sample_professional.phone_number == "9876543210"
                assert sample_professional.bio == "Updated bio"
                assert sample_professional.rate_cents == 15000

    def test_update_professional_not_found(self, professional_service, mock_db, sample_professional_update):
        """Test updating professional when professional not found."""
        professional_id = str(uuid.uuid4())

        with patch.object(professional_service, "get_professional_by_id", return_value=None):
            result = professional_service.update_professional(professional_id, sample_professional_update)

            assert result is None
            mock_db.commit.assert_not_called()
            mock_db.refresh.assert_not_called()

    def test_update_professional_without_specialty_ids(self, professional_service, mock_db, sample_professional):
        """Test updating professional without specialty_ids."""
        professional_id = str(sample_professional.id)
        update_without_specialties = ProfessionalUpdate(full_name="Updated Name", bio="Updated bio")

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            with patch.object(
                professional_service.specialty_service, "add_specialties_to_professional"
            ) as mock_add_specialties:
                result = professional_service.update_professional(professional_id, update_without_specialties)

                assert result == sample_professional
                mock_add_specialties.assert_not_called()
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(sample_professional)

    def test_update_professional_exception_handling(
        self, professional_service, mock_db, sample_professional, sample_professional_update
    ):
        """Test updating professional when database error occurs."""
        professional_id = str(sample_professional.id)

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            with patch.object(professional_service.specialty_service, "add_specialties_to_professional"):
                mock_db.commit.side_effect = SQLAlchemyError("Database error")

                with pytest.raises(HTTPException) as exc_info:
                    professional_service.update_professional(professional_id, sample_professional_update)

                assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
                assert exc_info.value.detail == "Failed to update professional"
                mock_db.rollback.assert_called_once()

    def test_deactivate_professional_success(self, professional_service, mock_db, sample_professional):
        """Test deactivating professional successfully."""
        professional_id = str(sample_professional.id)

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            result = professional_service.deactivate_professional(professional_id)

            assert result is True
            assert sample_professional.is_active is False
            mock_db.commit.assert_called_once()

    def test_deactivate_professional_not_found(self, professional_service, mock_db):
        """Test deactivating professional when professional not found."""
        professional_id = str(uuid.uuid4())

        with patch.object(professional_service, "get_professional_by_id", return_value=None):
            result = professional_service.deactivate_professional(professional_id)

            assert result is False
            mock_db.commit.assert_not_called()

    def test_deactivate_professional_exception_handling(self, professional_service, mock_db, sample_professional):
        """Test deactivating professional when database error occurs."""
        professional_id = str(sample_professional.id)

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            mock_db.commit.side_effect = SQLAlchemyError("Database error")

            result = professional_service.deactivate_professional(professional_id)

            assert result is False
            mock_db.rollback.assert_called_once()

    def test_deactivate_professional_already_inactive(self, professional_service, mock_db, sample_professional):
        """Test deactivating professional that is already inactive."""
        professional_id = str(sample_professional.id)
        sample_professional.is_active = False  # Already inactive

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            result = professional_service.deactivate_professional(professional_id)

            assert result is True
            assert sample_professional.is_active is False
            mock_db.commit.assert_called_once()

    def test_professional_service_initialization(self, mock_db):
        """Test ProfessionalService initialization."""
        professional_service = ProfessionalService(mock_db)
        assert professional_service.db == mock_db
        assert professional_service.specialty_service is not None
        assert professional_service.therapeutic_approach_service is not None
        assert professional_service.modality_service is not None

    def test_update_professional_with_empty_update_data(self, professional_service, mock_db, sample_professional):
        """Test updating professional with empty update data."""
        professional_id = str(sample_professional.id)
        empty_update = ProfessionalUpdate()

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            with patch.object(
                professional_service.specialty_service, "add_specialties_to_professional"
            ) as mock_add_specialties:
                result = professional_service.update_professional(professional_id, empty_update)

                assert result == sample_professional
                mock_add_specialties.assert_not_called()
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(sample_professional)

    def test_update_professional_with_none_specialty_ids(self, professional_service, mock_db, sample_professional):
        """Test updating professional with None specialty_ids."""
        professional_id = str(sample_professional.id)
        update_with_none_specialties = ProfessionalUpdate(full_name="Updated Name", specialty_ids=None)

        with patch.object(professional_service, "get_professional_by_id", return_value=sample_professional):
            with patch.object(
                professional_service.specialty_service, "add_specialties_to_professional"
            ) as mock_add_specialties:
                result = professional_service.update_professional(professional_id, update_with_none_specialties)

                assert result == sample_professional
                mock_add_specialties.assert_not_called()
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(sample_professional)
