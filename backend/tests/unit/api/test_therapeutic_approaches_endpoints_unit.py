"""
Unit tests for therapeutic approaches endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.therapeutic_approaches import (
    create_therapeutic_approach,
    delete_therapeutic_approach,
    get_therapeutic_approach,
    get_therapeutic_approaches,
    get_therapeutic_approaches_by_category,
    update_therapeutic_approach,
)
from app.schemas.therapeutic_approach import (
    TherapeuticApproachCreate,
    TherapeuticApproachResponse,
    TherapeuticApproachUpdate,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def mock_db():
    """Mock database session."""
    return MagicMock(spec=Session)


@pytest.fixture
def sample_therapeutic_approach():
    """Sample therapeutic approach data."""
    approach = MagicMock()
    approach.id = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
    approach.name = "Cognitive Behavioral Therapy"
    approach.description = "A type of psychotherapy"
    approach.category = "Behavioral"
    return approach


@pytest.fixture
def sample_therapeutic_approach_create():
    """Sample therapeutic approach creation data."""
    return TherapeuticApproachCreate(
        name="Cognitive Behavioral Therapy", description="A type of psychotherapy", category="Behavioral"
    )


@pytest.fixture
def sample_therapeutic_approach_update():
    """Sample therapeutic approach update data."""
    return TherapeuticApproachUpdate(name="Updated CBT", description="Updated description", category="Updated Category")


@pytest.fixture
def sample_therapeutic_approach_response():
    """Sample therapeutic approach response data."""
    return TherapeuticApproachResponse(
        id=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
        name="Cognitive Behavioral Therapy",
        description="A type of psychotherapy",
        category="Behavioral",
    )


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestGetTherapeuticApproaches:
    """Test get_therapeutic_approaches endpoint."""

    @pytest.mark.asyncio
    async def test_get_therapeutic_approaches_success(self, mock_service_class, mock_db, sample_therapeutic_approach):
        """Test successful retrieval of therapeutic approaches."""
        mock_service = MagicMock()
        mock_service.get_therapeutic_approaches.return_value = [sample_therapeutic_approach]
        mock_service_class.return_value = mock_service

        result = get_therapeutic_approaches(skip=0, limit=10, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_therapeutic_approaches.assert_called_once_with(skip=0, limit=10)
        assert result == [sample_therapeutic_approach]

    @pytest.mark.asyncio
    async def test_get_therapeutic_approaches_empty_list(self, mock_service_class, mock_db):
        """Test retrieval of therapeutic approaches with empty result."""
        mock_service = MagicMock()
        mock_service.get_therapeutic_approaches.return_value = []
        mock_service_class.return_value = mock_service

        result = get_therapeutic_approaches(skip=0, limit=10, db=mock_db)

        assert result == []


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestGetTherapeuticApproachesByCategory:
    """Test get_therapeutic_approaches_by_category endpoint."""

    @pytest.mark.asyncio
    async def test_get_therapeutic_approaches_by_category_success(
        self, mock_service_class, mock_db, sample_therapeutic_approach
    ):
        """Test successful retrieval of therapeutic approaches by category."""
        mock_service = MagicMock()
        mock_service.get_therapeutic_approaches_by_category.return_value = [sample_therapeutic_approach]
        mock_service_class.return_value = mock_service

        result = get_therapeutic_approaches_by_category(category="Behavioral", db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_therapeutic_approaches_by_category.assert_called_once_with("Behavioral")
        assert result == [sample_therapeutic_approach]


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestGetTherapeuticApproach:
    """Test get_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_get_therapeutic_approach_success(self, mock_service_class, mock_db, sample_therapeutic_approach):
        """Test successful retrieval of a therapeutic approach."""
        mock_service = MagicMock()
        mock_service.get_therapeutic_approach.return_value = sample_therapeutic_approach
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = get_therapeutic_approach(approach_id=approach_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_therapeutic_approach.assert_called_once_with(approach_id)
        assert result == sample_therapeutic_approach

    @pytest.mark.asyncio
    async def test_get_therapeutic_approach_not_found(self, mock_service_class, mock_db):
        """Test therapeutic approach not found."""
        mock_service = MagicMock()
        mock_service.get_therapeutic_approach.return_value = None
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            get_therapeutic_approach(approach_id=approach_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Therapeutic approach not found"


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestCreateTherapeuticApproach:
    """Test create_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_create_therapeutic_approach_success(
        self, mock_service_class, mock_db, sample_therapeutic_approach_create, sample_therapeutic_approach
    ):
        """Test successful creation of a therapeutic approach."""
        mock_service = MagicMock()
        mock_service.create_therapeutic_approach.return_value = sample_therapeutic_approach
        mock_service_class.return_value = mock_service

        result = create_therapeutic_approach(approach=sample_therapeutic_approach_create, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.create_therapeutic_approach.assert_called_once_with(sample_therapeutic_approach_create)
        assert result == sample_therapeutic_approach


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestUpdateTherapeuticApproach:
    """Test update_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_update_therapeutic_approach_success(
        self, mock_service_class, mock_db, sample_therapeutic_approach_update, sample_therapeutic_approach
    ):
        """Test successful update of a therapeutic approach."""
        mock_service = MagicMock()
        mock_service.update_therapeutic_approach.return_value = sample_therapeutic_approach
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = update_therapeutic_approach(
            approach_id=approach_id, approach_update=sample_therapeutic_approach_update, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.update_therapeutic_approach.assert_called_once_with(
            approach_id, sample_therapeutic_approach_update
        )
        assert result == sample_therapeutic_approach

    @pytest.mark.asyncio
    async def test_update_therapeutic_approach_not_found(
        self, mock_service_class, mock_db, sample_therapeutic_approach_update
    ):
        """Test therapeutic approach update not found."""
        mock_service = MagicMock()
        mock_service.update_therapeutic_approach.return_value = None
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            update_therapeutic_approach(
                approach_id=approach_id, approach_update=sample_therapeutic_approach_update, db=mock_db
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Therapeutic approach not found"


@patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService")
class TestDeleteTherapeuticApproach:
    """Test delete_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_delete_therapeutic_approach_success(self, mock_service_class, mock_db):
        """Test successful deletion of a therapeutic approach."""
        mock_service = MagicMock()
        mock_service.delete_therapeutic_approach.return_value = True
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = delete_therapeutic_approach(approach_id=approach_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.delete_therapeutic_approach.assert_called_once_with(approach_id)
        assert result.status_code == status.HTTP_204_NO_CONTENT

    @pytest.mark.asyncio
    async def test_delete_therapeutic_approach_not_found(self, mock_service_class, mock_db):
        """Test therapeutic approach deletion not found."""
        mock_service = MagicMock()
        mock_service.delete_therapeutic_approach.return_value = False
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            delete_therapeutic_approach(approach_id=approach_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Therapeutic approach not found"
