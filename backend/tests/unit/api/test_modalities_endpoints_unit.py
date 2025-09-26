"""
Unit tests for modalities endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, Response

from app.api.v1.endpoints.modalities import (
    create_modality,
    delete_modality,
    get_modality,
    get_modalities,
    update_modality,
)
from app.models.modality import Modality
from app.schemas.modality import ModalityCreate, ModalityUpdate

pytestmark = pytest.mark.unit


@pytest.fixture
def sample_modality():
    """Sample modality for testing."""
    modality = MagicMock(spec=Modality)
    modality.id = str(uuid.uuid4())
    modality.name = "Individual Therapy"
    modality.description = "One-on-one therapy sessions"
    modality.is_active = True
    return modality


@pytest.fixture
def sample_modality_create():
    """Sample ModalityCreate for testing."""
    return ModalityCreate(name="Group Therapy", description="Therapy sessions with multiple participants")


@pytest.fixture
def sample_modality_update():
    """Sample ModalityUpdate for testing."""
    return ModalityUpdate(
        name="Updated Group Therapy", description="Updated therapy sessions with multiple participants"
    )


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    return MagicMock()


class TestGetModalities:
    """Test get_modalities endpoint."""

    @pytest.mark.asyncio
    async def test_get_modalities_success(self, sample_modality, mock_db_session):
        """Test successful retrieval of all modalities."""
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.all.return_value = [sample_modality]

        result = await get_modalities(mock_db_session)

        assert len(result) == 1
        assert result[0] == sample_modality
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_modalities_empty(self, mock_db_session):
        """Test retrieval when no modalities exist."""
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.all.return_value = []

        result = await get_modalities(mock_db_session)

        assert len(result) == 0
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.all.assert_called_once()


class TestGetModality:
    """Test get_modality endpoint."""

    @pytest.mark.asyncio
    async def test_get_modality_success(self, sample_modality, mock_db_session):
        """Test successful retrieval of a specific modality."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = sample_modality

        result = await get_modality(modality_id, mock_db_session, "test-user-id")

        assert result == sample_modality
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_modality_not_found(self, mock_db_session):
        """Test retrieval of non-existent modality."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await get_modality(modality_id, mock_db_session, "test-user-id")

        assert exc_info.value.status_code == 404
        assert "Modality not found" in str(exc_info.value.detail)
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()


class TestCreateModality:
    """Test create_modality endpoint."""

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.modalities.Modality")
    async def test_create_modality_success(self, mock_modality_class, sample_modality_create, mock_db_session):
        """Test successful modality creation."""
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None  # No existing modality

        # Mock the Modality instance and database operations
        mock_modality_instance = MagicMock()
        mock_modality_class.return_value = mock_modality_instance

        result = await create_modality(sample_modality_create, mock_db_session, "test-user-id")

        assert result == mock_modality_instance
        mock_db_session.query.assert_called_once_with(mock_modality_class)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
        mock_modality_class.assert_called_once()
        mock_db_session.add.assert_called_once_with(mock_modality_instance)
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(mock_modality_instance)

    @pytest.mark.asyncio
    async def test_create_modality_duplicate_name(self, sample_modality_create, sample_modality, mock_db_session):
        """Test creation with duplicate name."""
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = sample_modality  # Existing modality

        with pytest.raises(HTTPException) as exc_info:
            await create_modality(sample_modality_create, mock_db_session, "test-user-id")

        assert exc_info.value.status_code == 400
        assert "Modality with this name already exists" in str(exc_info.value.detail)
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()


class TestUpdateModality:
    """Test update_modality endpoint."""

    @pytest.mark.asyncio
    async def test_update_modality_success(self, sample_modality, sample_modality_update, mock_db_session):
        """Test successful modality update."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = sample_modality

        result = await update_modality(modality_id, sample_modality_update, mock_db_session, "test-user-id")

        assert result == sample_modality
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_modality)

    @pytest.mark.asyncio
    async def test_update_modality_not_found(self, sample_modality_update, mock_db_session):
        """Test update of non-existent modality."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await update_modality(modality_id, sample_modality_update, mock_db_session, "test-user-id")

        assert exc_info.value.status_code == 404
        assert "Modality not found" in str(exc_info.value.detail)
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_modality_partial_update(self, sample_modality, mock_db_session):
        """Test partial modality update."""
        modality_id = str(uuid.uuid4())
        partial_update = ModalityUpdate(name="Updated Name")

        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = sample_modality

        result = await update_modality(modality_id, partial_update, mock_db_session, "test-user-id")

        assert result == sample_modality
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_modality)


class TestDeleteModality:
    """Test delete_modality endpoint."""

    @pytest.mark.asyncio
    async def test_delete_modality_success(self, sample_modality, mock_db_session):
        """Test successful modality deletion (soft delete)."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = sample_modality

        result = await delete_modality(modality_id, mock_db_session, "test-user-id")

        assert isinstance(result, Response)
        assert result.status_code == 204
        assert sample_modality.is_active is False
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
        mock_db_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_modality_not_found(self, mock_db_session):
        """Test deletion of non-existent modality."""
        modality_id = str(uuid.uuid4())
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value.first.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await delete_modality(modality_id, mock_db_session, "test-user-id")

        assert exc_info.value.status_code == 404
        assert "Modality not found" in str(exc_info.value.detail)
        mock_db_session.query.assert_called_once_with(Modality)
        mock_query.filter.assert_called_once()
        mock_query.filter.return_value.first.assert_called_once()
