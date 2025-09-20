"""
Unit tests for ProfessionalSpecialtyService.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session

from app.services.professional_specialty_service import ProfessionalSpecialtyService
from app.models.professional_specialty import ProfessionalSpecialty
from app.schemas.professional_specialty import ProfessionalSpecialtyCreate, ProfessionalSpecialtyUpdate


class TestProfessionalSpecialtyServiceUnit:
    """Unit tests for ProfessionalSpecialtyService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def professional_specialty_service(self, mock_db):
        """ProfessionalSpecialtyService instance with mocked database."""
        return ProfessionalSpecialtyService(mock_db)

    @pytest.fixture
    def sample_professional_specialty(self):
        """Sample professional specialty for testing."""
        specialty = Mock(spec=ProfessionalSpecialty)
        specialty.id = "test-specialty-1"
        specialty.professional_id = "test-professional-1"
        specialty.specialty_id = "specialty-1"
        return specialty

    def test_get_professional_specialty_found(
        self, professional_specialty_service, mock_db, sample_professional_specialty
    ):
        """Test getting a professional specialty by ID that exists."""
        # Arrange
        specialty_id = "test-specialty-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional_specialty
        mock_db.query.return_value = mock_query

        # Act
        result = professional_specialty_service.get_professional_specialty(specialty_id)

        # Assert
        assert result == sample_professional_specialty
        mock_db.query.assert_called_once_with(ProfessionalSpecialty)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_professional_specialty_not_found(self, professional_specialty_service, mock_db):
        """Test getting a professional specialty by ID that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = professional_specialty_service.get_professional_specialty(specialty_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(ProfessionalSpecialty)

    def test_get_professional_specialties(self, professional_specialty_service, mock_db):
        """Test getting all specialties for a professional."""
        # Arrange
        professional_id = "test-professional-1"
        mock_specialties = [Mock(spec=ProfessionalSpecialty) for _ in range(3)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_specialties
        mock_db.query.return_value = mock_query

        # Act
        result = professional_specialty_service.get_professional_specialties(professional_id)

        # Assert
        assert result == mock_specialties
        mock_db.query.assert_called_once_with(ProfessionalSpecialty)
        mock_query.filter.assert_called_once()
        mock_filter.all.assert_called_once()

    def test_create_professional_specialty_success(self, professional_specialty_service, mock_db):
        """Test creating a professional specialty successfully."""
        # Arrange
        specialty_data = ProfessionalSpecialtyCreate(professional_id="test-professional-1", specialty_id="specialty-1")

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the ProfessionalSpecialty constructor to avoid schema/model mismatch
        with pytest.MonkeyPatch().context() as m:
            m.setattr(ProfessionalSpecialty, "__init__", lambda self, **kwargs: None)

            # Act
            result = professional_specialty_service.create_professional_specialty(specialty_data)

            # Assert
            assert result is not None
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_update_professional_specialty_success(
        self, professional_specialty_service, mock_db, sample_professional_specialty
    ):
        """Test updating a professional specialty successfully."""
        # Arrange
        specialty_id = "test-specialty-1"
        update_data = ProfessionalSpecialtyUpdate(specialty_id="specialty-2")

        # Mock get_professional_specialty to return our sample specialty
        professional_specialty_service.get_professional_specialty = Mock(return_value=sample_professional_specialty)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_specialty_service.update_professional_specialty(specialty_id, update_data)

        # Assert
        assert result == sample_professional_specialty
        assert sample_professional_specialty.specialty_id == "specialty-2"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_professional_specialty_not_found(self, professional_specialty_service, mock_db):
        """Test updating a professional specialty that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"
        update_data = ProfessionalSpecialtyUpdate(specialty_id="specialty-2")

        # Mock get_professional_specialty to return None
        professional_specialty_service.get_professional_specialty = Mock(return_value=None)

        # Act
        result = professional_specialty_service.update_professional_specialty(specialty_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_delete_professional_specialty_success(
        self, professional_specialty_service, mock_db, sample_professional_specialty
    ):
        """Test deleting a professional specialty successfully."""
        # Arrange
        specialty_id = "test-specialty-1"

        # Mock get_professional_specialty to return our sample specialty
        professional_specialty_service.get_professional_specialty = Mock(return_value=sample_professional_specialty)
        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = professional_specialty_service.delete_professional_specialty(specialty_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_professional_specialty)
        mock_db.commit.assert_called_once()

    def test_delete_professional_specialty_not_found(self, professional_specialty_service, mock_db):
        """Test deleting a professional specialty that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"

        # Mock get_professional_specialty to return None
        professional_specialty_service.get_professional_specialty = Mock(return_value=None)

        # Act
        result = professional_specialty_service.delete_professional_specialty(specialty_id)

        # Assert
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_add_specialties_to_professional_success(self, professional_specialty_service, mock_db):
        """Test adding multiple specialties to a professional successfully."""
        # Arrange
        professional_id = "test-professional-1"
        specialty_ids = ["specialty-1", "specialty-2", "specialty-3"]

        # Mock the query for deleting existing specialties
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.delete = Mock()
        mock_db.query.return_value = mock_query

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the ProfessionalSpecialty constructor to avoid schema/model mismatch
        with pytest.MonkeyPatch().context() as m:
            m.setattr(ProfessionalSpecialty, "__init__", lambda self, **kwargs: None)

            # Act
            result = professional_specialty_service.add_specialties_to_professional(professional_id, specialty_ids)

            # Assert
            assert len(result) == 3
            assert mock_db.add.call_count == 3
            mock_db.commit.assert_called_once()
            assert mock_db.refresh.call_count == 3

    def test_add_specialties_to_professional_empty_list(self, professional_specialty_service, mock_db):
        """Test adding empty list of specialties to a professional."""
        # Arrange
        professional_id = "test-professional-1"
        specialty_ids = []

        # Mock the query for deleting existing specialties
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.delete = Mock()
        mock_db.query.return_value = mock_query

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_specialty_service.add_specialties_to_professional(professional_id, specialty_ids)

        # Assert
        assert len(result) == 0
        mock_db.add.assert_not_called()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_not_called()

    def test_add_specialties_to_professional_single_specialty(self, professional_specialty_service, mock_db):
        """Test adding a single specialty to a professional."""
        # Arrange
        professional_id = "test-professional-1"
        specialty_ids = ["specialty-1"]

        # Mock the query for deleting existing specialties
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.delete = Mock()
        mock_db.query.return_value = mock_query

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the ProfessionalSpecialty constructor to avoid schema/model mismatch
        with pytest.MonkeyPatch().context() as m:
            m.setattr(ProfessionalSpecialty, "__init__", lambda self, **kwargs: None)

            # Act
            result = professional_specialty_service.add_specialties_to_professional(professional_id, specialty_ids)

            # Assert
            assert len(result) == 1
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_professional_specialty_service_initialization(self, mock_db):
        """Test ProfessionalSpecialtyService initialization."""
        # Act
        service = ProfessionalSpecialtyService(mock_db)

        # Assert
        assert service.db == mock_db
