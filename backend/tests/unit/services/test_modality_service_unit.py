"""
Unit tests for ModalityService.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session

from app.services.modality_service import ModalityService
from app.models.modality import Modality
from app.schemas.modality import ModalityCreate, ModalityUpdate


class TestModalityServiceUnit:
    """Unit tests for ModalityService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def modality_service(self, mock_db):
        """ModalityService instance with mocked database."""
        return ModalityService(mock_db)

    @pytest.fixture
    def sample_modality(self):
        """Sample modality for testing."""
        modality = Mock(spec=Modality)
        modality.id = "test-modality-1"
        modality.name = "Individual Therapy"
        modality.description = "One-on-one therapy sessions"
        modality.category = "therapy"
        modality.is_active = True
        return modality

    def test_get_modality_found(self, modality_service, mock_db, sample_modality):
        """Test getting a modality that exists."""
        # Arrange
        modality_id = "test-modality-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_modality
        mock_db.query.return_value = mock_query

        # Act
        result = modality_service.get_modality(modality_id)

        # Assert
        assert result == sample_modality
        mock_db.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_modality_not_found(self, modality_service, mock_db):
        """Test getting a modality that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = modality_service.get_modality(modality_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(Modality)

    def test_get_modalities_with_pagination(self, modality_service, mock_db):
        """Test getting modalities with pagination."""
        # Arrange
        skip = 10
        limit = 5
        mock_modalities = [Mock(spec=Modality) for _ in range(3)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_modalities
        mock_db.query.return_value = mock_query

        # Act
        result = modality_service.get_modalities(skip=skip, limit=limit)

        # Assert
        assert result == mock_modalities
        mock_db.query.assert_called_once_with(Modality)
        mock_query.offset.assert_called_once_with(skip)
        mock_offset.limit.assert_called_once_with(limit)

    def test_get_modalities_default_pagination(self, modality_service, mock_db):
        """Test getting modalities with default pagination."""
        # Arrange
        mock_modalities = [Mock(spec=Modality) for _ in range(2)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_modalities
        mock_db.query.return_value = mock_query

        # Act
        result = modality_service.get_modalities()

        # Assert
        assert result == mock_modalities
        mock_query.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)

    def test_get_modalities_by_category(self, modality_service, mock_db):
        """Test getting modalities by category."""
        # Arrange
        category = "therapy"
        mock_modalities = [Mock(spec=Modality) for _ in range(2)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_modalities
        mock_db.query.return_value = mock_query

        # Act
        result = modality_service.get_modalities_by_category(category)

        # Assert
        assert result == mock_modalities
        mock_db.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()

    def test_create_modality_success(self, modality_service, mock_db):
        """Test creating a modality successfully."""
        # Arrange
        modality_data = ModalityCreate(
            name="Group Therapy", description="Therapy sessions in groups", category="therapy", is_active=True
        )

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = modality_service.create_modality(modality_data)

        # Assert
        assert result is not None
        assert hasattr(result, "name")
        assert hasattr(result, "description")
        assert hasattr(result, "category")
        assert hasattr(result, "is_active")
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_modality_success(self, modality_service, mock_db, sample_modality):
        """Test updating a modality successfully."""
        # Arrange
        modality_id = "test-modality-1"
        update_data = ModalityUpdate(name="Updated Individual Therapy", description="Updated description")

        # Mock get_modality to return our sample modality
        modality_service.get_modality = Mock(return_value=sample_modality)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = modality_service.update_modality(modality_id, update_data)

        # Assert
        assert result == sample_modality
        assert sample_modality.name == "Updated Individual Therapy"
        assert sample_modality.description == "Updated description"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_modality_not_found(self, modality_service, mock_db):
        """Test updating a modality that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"
        update_data = ModalityUpdate(name="Updated Name")

        # Mock get_modality to return None
        modality_service.get_modality = Mock(return_value=None)

        # Act
        result = modality_service.update_modality(modality_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_modality_partial_update(self, modality_service, mock_db, sample_modality):
        """Test partial update of a modality."""
        # Arrange
        modality_id = "test-modality-1"
        update_data = ModalityUpdate(name="Only Name Updated")

        # Mock get_modality to return our sample modality
        modality_service.get_modality = Mock(return_value=sample_modality)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = modality_service.update_modality(modality_id, update_data)

        # Assert
        assert result == sample_modality
        assert sample_modality.name == "Only Name Updated"
        # Description should remain unchanged
        assert sample_modality.description == "One-on-one therapy sessions"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_delete_modality_success(self, modality_service, mock_db, sample_modality):
        """Test deleting a modality successfully."""
        # Arrange
        modality_id = "test-modality-1"

        # Mock get_modality to return our sample modality
        modality_service.get_modality = Mock(return_value=sample_modality)
        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = modality_service.delete_modality(modality_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_modality)
        mock_db.commit.assert_called_once()

    def test_delete_modality_not_found(self, modality_service, mock_db):
        """Test deleting a modality that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"

        # Mock get_modality to return None
        modality_service.get_modality = Mock(return_value=None)

        # Act
        result = modality_service.delete_modality(modality_id)

        # Assert
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_modality_service_initialization(self, mock_db):
        """Test ModalityService initialization."""
        # Act
        service = ModalityService(mock_db)

        # Assert
        assert service.db == mock_db
