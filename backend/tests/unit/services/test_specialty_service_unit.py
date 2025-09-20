"""
Unit tests for SpecialtyService.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session

from app.services.specialty_service import SpecialtyService
from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate


class TestSpecialtyServiceUnit:
    """Unit tests for SpecialtyService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def specialty_service(self, mock_db):
        """SpecialtyService instance with mocked database."""
        return SpecialtyService(mock_db)

    @pytest.fixture
    def sample_specialty(self):
        """Sample specialty for testing."""
        specialty = Mock(spec=Specialty)
        specialty.id = "test-specialty-1"
        specialty.name = "Cognitive Behavioral Therapy"
        specialty.category = "therapy"
        return specialty

    def test_get_specialty_found(self, specialty_service, mock_db, sample_specialty):
        """Test getting a specialty that exists."""
        # Arrange
        specialty_id = "test-specialty-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_specialty
        mock_db.query.return_value = mock_query

        # Act
        result = specialty_service.get_specialty(specialty_id)

        # Assert
        assert result == sample_specialty
        mock_db.query.assert_called_once_with(Specialty)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_specialty_not_found(self, specialty_service, mock_db):
        """Test getting a specialty that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = specialty_service.get_specialty(specialty_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(Specialty)

    def test_get_specialties_with_pagination(self, specialty_service, mock_db):
        """Test getting specialties with pagination."""
        # Arrange
        skip = 10
        limit = 5
        mock_specialties = [Mock(spec=Specialty) for _ in range(3)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_specialties
        mock_db.query.return_value = mock_query

        # Act
        result = specialty_service.get_specialties(skip=skip, limit=limit)

        # Assert
        assert result == mock_specialties
        mock_db.query.assert_called_once_with(Specialty)
        mock_query.offset.assert_called_once_with(skip)
        mock_offset.limit.assert_called_once_with(limit)

    def test_get_specialties_default_pagination(self, specialty_service, mock_db):
        """Test getting specialties with default pagination."""
        # Arrange
        mock_specialties = [Mock(spec=Specialty) for _ in range(2)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_specialties
        mock_db.query.return_value = mock_query

        # Act
        result = specialty_service.get_specialties()

        # Assert
        assert result == mock_specialties
        mock_query.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)

    def test_get_specialties_by_category(self, specialty_service, mock_db):
        """Test getting specialties by category."""
        # Arrange
        category = "therapy"
        mock_specialties = [Mock(spec=Specialty) for _ in range(2)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_specialties
        mock_db.query.return_value = mock_query

        # Act
        result = specialty_service.get_specialties_by_category(category)

        # Assert
        assert result == mock_specialties
        mock_db.query.assert_called_once_with(Specialty)
        mock_query.filter.assert_called_once()

    def test_create_specialty_success(self, specialty_service, mock_db):
        """Test creating a specialty successfully."""
        # Arrange
        specialty_data = SpecialtyCreate(name="Family Therapy", category="therapy")

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = specialty_service.create_specialty(specialty_data)

        # Assert
        assert result is not None
        assert hasattr(result, "name")
        assert hasattr(result, "category")
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_specialty_success(self, specialty_service, mock_db, sample_specialty):
        """Test updating a specialty successfully."""
        # Arrange
        specialty_id = "test-specialty-1"
        update_data = SpecialtyUpdate(name="Updated CBT", category="therapy")

        # Mock get_specialty to return our sample specialty
        specialty_service.get_specialty = Mock(return_value=sample_specialty)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = specialty_service.update_specialty(specialty_id, update_data)

        # Assert
        assert result == sample_specialty
        assert sample_specialty.name == "Updated CBT"
        assert sample_specialty.category == "therapy"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_specialty_not_found(self, specialty_service, mock_db):
        """Test updating a specialty that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"
        update_data = SpecialtyUpdate(name="Updated Name")

        # Mock get_specialty to return None
        specialty_service.get_specialty = Mock(return_value=None)

        # Act
        result = specialty_service.update_specialty(specialty_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_specialty_partial_update(self, specialty_service, mock_db, sample_specialty):
        """Test partial update of a specialty."""
        # Arrange
        specialty_id = "test-specialty-1"
        update_data = SpecialtyUpdate(name="Only Name Updated")

        # Mock get_specialty to return our sample specialty
        specialty_service.get_specialty = Mock(return_value=sample_specialty)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = specialty_service.update_specialty(specialty_id, update_data)

        # Assert
        assert result == sample_specialty
        assert sample_specialty.name == "Only Name Updated"
        # Category should remain unchanged
        assert sample_specialty.category == "therapy"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_delete_specialty_success(self, specialty_service, mock_db, sample_specialty):
        """Test deleting a specialty successfully."""
        # Arrange
        specialty_id = "test-specialty-1"

        # Mock get_specialty to return our sample specialty
        specialty_service.get_specialty = Mock(return_value=sample_specialty)
        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = specialty_service.delete_specialty(specialty_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_specialty)
        mock_db.commit.assert_called_once()

    def test_delete_specialty_not_found(self, specialty_service, mock_db):
        """Test deleting a specialty that doesn't exist."""
        # Arrange
        specialty_id = "non-existent-id"

        # Mock get_specialty to return None
        specialty_service.get_specialty = Mock(return_value=None)

        # Act
        result = specialty_service.delete_specialty(specialty_id)

        # Assert
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_specialty_service_initialization(self, mock_db):
        """Test SpecialtyService initialization."""
        # Act
        service = SpecialtyService(mock_db)

        # Assert
        assert service.db == mock_db
