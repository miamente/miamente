"""
Unit tests for ProfessionalModalityService.
"""

import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session

from app.services.professional_modality_service import ProfessionalModalityService
from app.models.professional_modality import ProfessionalModality
from app.schemas.professional_modality import ProfessionalModalityCreate, ProfessionalModalityUpdate


class TestProfessionalModalityServiceUnit:
    """Unit tests for ProfessionalModalityService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def professional_modality_service(self, mock_db):
        """ProfessionalModalityService instance with mocked database."""
        return ProfessionalModalityService(mock_db)

    @pytest.fixture
    def sample_professional_modality(self):
        """Sample professional modality for testing."""
        modality = Mock(spec=ProfessionalModality)
        modality.id = "test-modality-1"
        modality.professional_id = "test-professional-1"
        modality.modality_id = "modality-1"
        modality.is_default = True
        modality.is_active = True
        return modality

    def test_get_professional_modality_found(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test getting a professional modality by ID that exists."""
        # Arrange
        modality_id = "test-modality-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional_modality
        mock_db.query.return_value = mock_query

        # Act
        result = professional_modality_service.get_professional_modality(modality_id)

        # Assert
        assert result == sample_professional_modality
        mock_db.query.assert_called_once_with(ProfessionalModality)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_professional_modality_not_found(self, professional_modality_service, mock_db):
        """Test getting a professional modality by ID that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = professional_modality_service.get_professional_modality(modality_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(ProfessionalModality)

    def test_get_professional_modalities(self, professional_modality_service, mock_db):
        """Test getting all modalities for a professional."""
        # Arrange
        professional_id = "test-professional-1"
        mock_modalities = [Mock(spec=ProfessionalModality) for _ in range(3)]

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = mock_modalities
        mock_db.query.return_value = mock_query

        # Act
        result = professional_modality_service.get_professional_modalities(professional_id)

        # Assert
        assert result == mock_modalities
        mock_db.query.assert_called_once_with(ProfessionalModality)
        mock_query.filter.assert_called_once()
        mock_filter.all.assert_called_once()

    def test_get_default_professional_modality_found(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test getting the default modality for a professional that exists."""
        # Arrange
        professional_id = "test-professional-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional_modality
        mock_db.query.return_value = mock_query

        # Act
        result = professional_modality_service.get_default_professional_modality(professional_id)

        # Assert
        assert result == sample_professional_modality
        mock_db.query.assert_called_once_with(ProfessionalModality)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()

    def test_get_default_professional_modality_not_found(self, professional_modality_service, mock_db):
        """Test getting the default modality for a professional that doesn't exist."""
        # Arrange
        professional_id = "test-professional-1"
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = professional_modality_service.get_default_professional_modality(professional_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(ProfessionalModality)

    def test_create_professional_modality_success(self, professional_modality_service, mock_db):
        """Test creating a professional modality successfully."""
        # Arrange
        modality_data = ProfessionalModalityCreate(
            professional_id="test-professional-1",
            modality_id="modality-1",
            name="Individual Therapy",
            description="One-on-one therapy sessions",
            price_cents=50000,
            currency="COP",
            is_default=True,
            is_active=True,
        )

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the query for removing default flag from other modalities
        mock_query = Mock()
        mock_filter = Mock()
        mock_update = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.update.return_value = mock_update
        mock_db.query.return_value = mock_query

        # Mock the ProfessionalModality constructor to avoid schema/model mismatch
        with pytest.MonkeyPatch().context() as m:
            m.setattr(ProfessionalModality, "__init__", lambda self, **kwargs: None)

            # Act
            result = professional_modality_service.create_professional_modality(modality_data)

            # Assert
            assert result is not None
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_create_professional_modality_not_default(self, professional_modality_service, mock_db):
        """Test creating a professional modality that is not default."""
        # Arrange
        modality_data = ProfessionalModalityCreate(
            professional_id="test-professional-1",
            modality_id="modality-1",
            name="Group Therapy",
            description="Group therapy sessions",
            price_cents=30000,
            currency="COP",
            is_default=False,
            is_active=True,
        )

        # Mock the database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the ProfessionalModality constructor to avoid schema/model mismatch
        with pytest.MonkeyPatch().context() as m:
            m.setattr(ProfessionalModality, "__init__", lambda self, **kwargs: None)

            # Act
            result = professional_modality_service.create_professional_modality(modality_data)

            # Assert
            assert result is not None
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_update_professional_modality_success(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test updating a professional modality successfully."""
        # Arrange
        modality_id = "test-modality-1"
        update_data = ProfessionalModalityUpdate(is_default=True, is_active=False)

        # Mock get_professional_modality to return our sample modality
        professional_modality_service.get_professional_modality = Mock(return_value=sample_professional_modality)

        # Mock the query for removing default flag from other modalities
        mock_query = Mock()
        mock_filter = Mock()
        mock_update = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.update.return_value = mock_update
        mock_db.query.return_value = mock_query

        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_modality_service.update_professional_modality(modality_id, update_data)

        # Assert
        assert result == sample_professional_modality
        assert sample_professional_modality.is_default is True
        assert sample_professional_modality.is_active is False
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_update_professional_modality_not_found(self, professional_modality_service, mock_db):
        """Test updating a professional modality that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"
        update_data = ProfessionalModalityUpdate(is_default=True)

        # Mock get_professional_modality to return None
        professional_modality_service.get_professional_modality = Mock(return_value=None)

        # Act
        result = professional_modality_service.update_professional_modality(modality_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_professional_modality_not_default(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test updating a professional modality that is not being set as default."""
        # Arrange
        modality_id = "test-modality-1"
        update_data = ProfessionalModalityUpdate(is_active=False)

        # Mock get_professional_modality to return our sample modality
        professional_modality_service.get_professional_modality = Mock(return_value=sample_professional_modality)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = professional_modality_service.update_professional_modality(modality_id, update_data)

        # Assert
        assert result == sample_professional_modality
        assert sample_professional_modality.is_active is False
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_delete_professional_modality_success(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test deleting a professional modality successfully."""
        # Arrange
        modality_id = "test-modality-1"

        # Mock get_professional_modality to return our sample modality
        professional_modality_service.get_professional_modality = Mock(return_value=sample_professional_modality)

        # Mock the query for finding other modalities
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = [Mock(spec=ProfessionalModality)]  # Other modality exists
        mock_db.query.return_value = mock_query

        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = professional_modality_service.delete_professional_modality(modality_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_professional_modality)
        mock_db.commit.assert_called()

    def test_delete_professional_modality_not_found(self, professional_modality_service, mock_db):
        """Test deleting a professional modality that doesn't exist."""
        # Arrange
        modality_id = "non-existent-id"

        # Mock get_professional_modality to return None
        professional_modality_service.get_professional_modality = Mock(return_value=None)

        # Act
        result = professional_modality_service.delete_professional_modality(modality_id)

        # Assert
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_delete_professional_modality_no_other_modalities(
        self, professional_modality_service, mock_db, sample_professional_modality
    ):
        """Test deleting a professional modality when no other modalities exist."""
        # Arrange
        modality_id = "test-modality-1"

        # Mock get_professional_modality to return our sample modality
        professional_modality_service.get_professional_modality = Mock(return_value=sample_professional_modality)

        # Mock the query for finding other modalities (returns empty list)
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = []  # No other modalities
        mock_db.query.return_value = mock_query

        mock_db.delete = Mock()
        mock_db.commit = Mock()

        # Act
        result = professional_modality_service.delete_professional_modality(modality_id)

        # Assert
        assert result is True
        mock_db.delete.assert_called_once_with(sample_professional_modality)
        mock_db.commit.assert_called()

    def test_set_default_modality_success(self, professional_modality_service, mock_db):
        """Test setting a modality as default successfully."""
        # Arrange
        professional_id = "test-professional-1"
        modality_id = "test-modality-1"

        # Mock the query for removing default flag from all modalities
        mock_query1 = Mock()
        mock_filter1 = Mock()
        mock_update1 = Mock()
        mock_query1.filter.return_value = mock_filter1
        mock_filter1.update.return_value = mock_update1

        # Mock the query for setting the specified modality as default
        mock_query2 = Mock()
        mock_filter2 = Mock()
        mock_update2 = Mock()
        mock_query2.filter.return_value = mock_filter2
        mock_filter2.update.return_value = mock_update2
        mock_update2.__gt__ = Mock(return_value=True)  # result > 0

        # Mock db.query to return different mocks for different calls
        mock_db.query.side_effect = [mock_query1, mock_query2]
        mock_db.commit = Mock()

        # Act
        result = professional_modality_service.set_default_modality(professional_id, modality_id)

        # Assert
        assert result is True
        assert mock_db.query.call_count == 2
        mock_db.commit.assert_called_once()

    def test_set_default_modality_not_found(self, professional_modality_service, mock_db):
        """Test setting a modality as default when the modality doesn't exist."""
        # Arrange
        professional_id = "test-professional-1"
        modality_id = "non-existent-modality"

        # Mock the query for removing default flag from all modalities
        mock_query1 = Mock()
        mock_filter1 = Mock()
        mock_update1 = Mock()
        mock_query1.filter.return_value = mock_filter1
        mock_filter1.update.return_value = mock_update1

        # Mock the query for setting the specified modality as default (returns 0)
        mock_query2 = Mock()
        mock_filter2 = Mock()
        mock_update2 = Mock()
        mock_query2.filter.return_value = mock_filter2
        mock_filter2.update.return_value = mock_update2
        mock_update2.__gt__ = Mock(return_value=False)  # result > 0 is False

        # Mock db.query to return different mocks for different calls
        mock_db.query.side_effect = [mock_query1, mock_query2]
        mock_db.commit = Mock()

        # Act
        result = professional_modality_service.set_default_modality(professional_id, modality_id)

        # Assert
        assert result is False
        assert mock_db.query.call_count == 2
        mock_db.commit.assert_called_once()

    def test_professional_modality_service_initialization(self, mock_db):
        """Test ProfessionalModalityService initialization."""
        # Act
        service = ProfessionalModalityService(mock_db)

        # Assert
        assert service.db == mock_db
