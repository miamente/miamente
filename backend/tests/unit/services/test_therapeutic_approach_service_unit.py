"""
Unit tests for TherapeuticApproachService.
"""

import pytest
from unittest.mock import Mock, MagicMock
from sqlalchemy.orm import Session

from app.services.therapeutic_approach_service import TherapeuticApproachService
from app.models.therapeutic_approach import TherapeuticApproach
from app.schemas.therapeutic_approach import TherapeuticApproachCreate, TherapeuticApproachUpdate


class TestTherapeuticApproachServiceUnit:
    """Unit tests for TherapeuticApproachService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def therapeutic_approach_service(self, mock_db):
        """TherapeuticApproachService instance with mocked database."""
        return TherapeuticApproachService(mock_db)

    @pytest.fixture
    def sample_approach(self):
        """Sample therapeutic approach for testing."""
        approach = Mock(spec=TherapeuticApproach)
        approach.id = "test-approach-1"
        approach.name = "Cognitive Behavioral Therapy"
        approach.description = "A type of psychotherapy that focuses on changing negative thought patterns"
        approach.category = "cognitive"
        return approach

    def test_get_therapeutic_approach_found(self, therapeutic_approach_service, mock_db, sample_approach):
        """Test getting a therapeutic approach that exists."""
        # Arrange
        approach_id = "test-approach-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_approach
        mock_db.query.return_value = mock_query

        # Act
        result = therapeutic_approach_service.get_therapeutic_approach(approach_id)

        # Assert
        assert result == sample_approach
        mock_db.query.assert_called_once_with(TherapeuticApproach)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_therapeutic_approach_not_found(self, therapeutic_approach_service, mock_db):
        """Test getting a therapeutic approach that doesn't exist."""
        # Arrange
        approach_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = therapeutic_approach_service.get_therapeutic_approach(approach_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(TherapeuticApproach)

    def test_get_therapeutic_approaches_with_pagination(self, therapeutic_approach_service, mock_db):
        """Test getting therapeutic approaches with pagination."""
        # Arrange
        skip = 10
        limit = 5
        mock_approaches = [Mock(spec=TherapeuticApproach) for _ in range(3)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_approaches
        mock_db.query.return_value = mock_query

        # Act
        result = therapeutic_approach_service.get_therapeutic_approaches(skip=skip, limit=limit)

        # Assert
        assert result == mock_approaches
        mock_db.query.assert_called_once_with(TherapeuticApproach)
        mock_query.offset.assert_called_once_with(skip)
        mock_offset.limit.assert_called_once_with(limit)

    def test_get_therapeutic_approaches_default_pagination(self, therapeutic_approach_service, mock_db):
        """Test getting therapeutic approaches with default pagination."""
        # Arrange
        mock_approaches = [Mock(spec=TherapeuticApproach) for _ in range(2)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_approaches
        mock_db.query.return_value = mock_query

        # Act
        result = therapeutic_approach_service.get_therapeutic_approaches()

        # Assert
        assert result == mock_approaches
        mock_query.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)

    def test_get_therapeutic_approaches_by_category(self, therapeutic_approach_service, mock_db):
        """Test getting therapeutic approaches by category."""
        # Arrange
        category = "cognitive"
        mock_approaches = [Mock(spec=TherapeuticApproach) for _ in range(2)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_approaches
        mock_db.query.return_value = mock_query

        # Act
        result = therapeutic_approach_service.get_therapeutic_approaches_by_category(category)

        # Assert
        assert result == mock_approaches
        mock_db.query.assert_called_once_with(TherapeuticApproach)
        mock_query.filter.assert_called_once()

    def test_create_therapeutic_approach_success(self, therapeutic_approach_service, mock_db):
        """Test creating a therapeutic approach successfully."""
        # Arrange
        approach_data = TherapeuticApproachCreate(
            name="Dialectical Behavior Therapy",
            description="A type of cognitive behavioral therapy",
            category="cognitive",
        )

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = therapeutic_approach_service.create_therapeutic_approach(approach_data)

        # Assert
        assert result is not None
        assert hasattr(result, "name")
        assert hasattr(result, "description")
        assert hasattr(result, "category")
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_therapeutic_approach_success(self, therapeutic_approach_service, mock_db, sample_approach):
        """Test updating a therapeutic approach successfully."""
        # Arrange
        approach_id = "test-approach-1"
        update_data = TherapeuticApproachUpdate(
            name="Updated CBT", description="Updated description", category="cognitive"
        )

        # Mock get_therapeutic_approach to return our sample approach
        therapeutic_approach_service.get_therapeutic_approach = Mock(return_value=sample_approach)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = therapeutic_approach_service.update_therapeutic_approach(approach_id, update_data)

        # Assert
        assert result == sample_approach
        assert sample_approach.name == "Updated CBT"
        assert sample_approach.description == "Updated description"
        assert sample_approach.category == "cognitive"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_therapeutic_approach_not_found(self, therapeutic_approach_service, mock_db):
        """Test updating a therapeutic approach that doesn't exist."""
        # Arrange
        approach_id = "non-existent-id"
        update_data = TherapeuticApproachUpdate(name="Updated Name")

        # Mock get_therapeutic_approach to return None
        therapeutic_approach_service.get_therapeutic_approach = Mock(return_value=None)

        # Act
        result = therapeutic_approach_service.update_therapeutic_approach(approach_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_therapeutic_approach_partial_update(self, therapeutic_approach_service, mock_db, sample_approach):
        """Test partial update of a therapeutic approach."""
        # Arrange
        approach_id = "test-approach-1"
        update_data = TherapeuticApproachUpdate(name="Only Name Updated")

        # Mock get_therapeutic_approach to return our sample approach
        therapeutic_approach_service.get_therapeutic_approach = Mock(return_value=sample_approach)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = therapeutic_approach_service.update_therapeutic_approach(approach_id, update_data)

        # Assert
        assert result == sample_approach
        assert sample_approach.name == "Only Name Updated"
        # Description and category should remain unchanged
        assert (
            sample_approach.description == "A type of psychotherapy that focuses on changing negative thought patterns"
        )
        assert sample_approach.category == "cognitive"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_delete_therapeutic_approach_success(self, therapeutic_approach_service, mock_db, sample_approach):
        """Test deleting a therapeutic approach successfully."""
        # Arrange
        approach_id = "test-approach-1"

        # Mock get_therapeutic_approach to return our sample approach
        therapeutic_approach_service.get_therapeutic_approach = Mock(return_value=sample_approach)
        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = therapeutic_approach_service.delete_therapeutic_approach(approach_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_approach)
        mock_db.commit.assert_called_once()

    def test_delete_therapeutic_approach_not_found(self, therapeutic_approach_service, mock_db):
        """Test deleting a therapeutic approach that doesn't exist."""
        # Arrange
        approach_id = "non-existent-id"

        # Mock get_therapeutic_approach to return None
        therapeutic_approach_service.get_therapeutic_approach = Mock(return_value=None)

        # Act
        result = therapeutic_approach_service.delete_therapeutic_approach(approach_id)

        # Assert
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_therapeutic_approach_service_initialization(self, mock_db):
        """Test TherapeuticApproachService initialization."""
        # Act
        service = TherapeuticApproachService(mock_db)

        # Assert
        assert service.db == mock_db
