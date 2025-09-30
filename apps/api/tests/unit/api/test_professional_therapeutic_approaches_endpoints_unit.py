"""
Unit tests for professional therapeutic approaches endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.professional_therapeutic_approaches import (
    create_professional_therapeutic_approach,
    delete_professional_therapeutic_approach,
    get_professional_therapeutic_approach,
    get_professional_therapeutic_approaches,
    update_professional_therapeutic_approaches,
    update_professional_therapeutic_approach,
)
from app.schemas.professional_therapeutic_approach import (
    ProfessionalTherapeuticApproachCreate,
    ProfessionalTherapeuticApproachUpdate,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def mock_db():
    """Mock database session."""
    return MagicMock(spec=Session)


@pytest.fixture
def sample_professional_therapeutic_approach():
    """Sample professional therapeutic approach data."""
    approach = MagicMock()
    approach.id = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
    approach.professional_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440001")
    approach.therapeutic_approach_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440002")
    return approach


@pytest.fixture
def sample_professional_therapeutic_approach_create():
    """Sample professional therapeutic approach creation data."""
    return ProfessionalTherapeuticApproachCreate(
        professional_id="550e8400-e29b-41d4-a716-446655440001",
        therapeutic_approach_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440002"),
    )


@pytest.fixture
def sample_professional_therapeutic_approach_update():
    """Sample professional therapeutic approach update data."""
    return ProfessionalTherapeuticApproachUpdate(
        therapeutic_approach_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003")
    )


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestGetProfessionalTherapeuticApproaches:
    """Test get_professional_therapeutic_approaches endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_therapeutic_approaches_success(
        self, mock_service_class, mock_db, sample_professional_therapeutic_approach
    ):
        """Test successful retrieval of professional therapeutic approaches."""
        mock_service = MagicMock()
        mock_service.get_professional_therapeutic_approaches.return_value = [sample_professional_therapeutic_approach]
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_therapeutic_approaches(professional_id=professional_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_therapeutic_approaches.assert_called_once_with(professional_id)
        assert result == [sample_professional_therapeutic_approach]

    @pytest.mark.asyncio
    async def test_get_professional_therapeutic_approaches_empty_list(self, mock_service_class, mock_db):
        """Test retrieval of professional therapeutic approaches with empty result."""
        mock_service = MagicMock()
        mock_service.get_professional_therapeutic_approaches.return_value = []
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_therapeutic_approaches(professional_id=professional_id, db=mock_db)

        assert result == []


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestGetProfessionalTherapeuticApproach:
    """Test get_professional_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_therapeutic_approach_success(
        self, mock_service_class, mock_db, sample_professional_therapeutic_approach
    ):
        """Test successful retrieval of a professional therapeutic approach."""
        mock_service = MagicMock()
        mock_service.get_professional_therapeutic_approach.return_value = sample_professional_therapeutic_approach
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = get_professional_therapeutic_approach(approach_id=approach_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_therapeutic_approach.assert_called_once_with(approach_id)
        assert result == sample_professional_therapeutic_approach

    @pytest.mark.asyncio
    async def test_get_professional_therapeutic_approach_not_found(self, mock_service_class, mock_db):
        """Test professional therapeutic approach not found."""
        mock_service = MagicMock()
        mock_service.get_professional_therapeutic_approach.return_value = None
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            get_professional_therapeutic_approach(approach_id=approach_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional therapeutic approach not found"


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestCreateProfessionalTherapeuticApproach:
    """Test create_professional_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_create_professional_therapeutic_approach_success(
        self,
        mock_service_class,
        mock_db,
        sample_professional_therapeutic_approach_create,
        sample_professional_therapeutic_approach,
    ):
        """Test successful creation of a professional therapeutic approach."""
        mock_service = MagicMock()
        mock_service.create_professional_therapeutic_approach.return_value = sample_professional_therapeutic_approach
        mock_service_class.return_value = mock_service

        result = create_professional_therapeutic_approach(
            approach=sample_professional_therapeutic_approach_create, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.create_professional_therapeutic_approach.assert_called_once_with(
            sample_professional_therapeutic_approach_create
        )
        assert result == sample_professional_therapeutic_approach


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestUpdateProfessionalTherapeuticApproach:
    """Test update_professional_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_update_professional_therapeutic_approach_success(
        self,
        mock_service_class,
        mock_db,
        sample_professional_therapeutic_approach_update,
        sample_professional_therapeutic_approach,
    ):
        """Test successful update of a professional therapeutic approach."""
        mock_service = MagicMock()
        mock_service.update_professional_therapeutic_approach.return_value = sample_professional_therapeutic_approach
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = update_professional_therapeutic_approach(
            approach_id=approach_id, approach_update=sample_professional_therapeutic_approach_update, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.update_professional_therapeutic_approach.assert_called_once_with(
            approach_id, sample_professional_therapeutic_approach_update
        )
        assert result == sample_professional_therapeutic_approach

    @pytest.mark.asyncio
    async def test_update_professional_therapeutic_approach_not_found(
        self, mock_service_class, mock_db, sample_professional_therapeutic_approach_update
    ):
        """Test professional therapeutic approach update not found."""
        mock_service = MagicMock()
        mock_service.update_professional_therapeutic_approach.return_value = None
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            update_professional_therapeutic_approach(
                approach_id=approach_id, approach_update=sample_professional_therapeutic_approach_update, db=mock_db
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional therapeutic approach not found"


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestDeleteProfessionalTherapeuticApproach:
    """Test delete_professional_therapeutic_approach endpoint."""

    @pytest.mark.asyncio
    async def test_delete_professional_therapeutic_approach_success(self, mock_service_class, mock_db):
        """Test successful deletion of a professional therapeutic approach."""
        mock_service = MagicMock()
        mock_service.delete_professional_therapeutic_approach.return_value = True
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"
        result = delete_professional_therapeutic_approach(approach_id=approach_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.delete_professional_therapeutic_approach.assert_called_once_with(approach_id)
        assert result.status_code == status.HTTP_204_NO_CONTENT

    @pytest.mark.asyncio
    async def test_delete_professional_therapeutic_approach_not_found(self, mock_service_class, mock_db):
        """Test professional therapeutic approach deletion not found."""
        mock_service = MagicMock()
        mock_service.delete_professional_therapeutic_approach.return_value = False
        mock_service_class.return_value = mock_service

        approach_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            delete_professional_therapeutic_approach(approach_id=approach_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional therapeutic approach not found"


@patch("app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService")
class TestUpdateProfessionalTherapeuticApproaches:
    """Test update_professional_therapeutic_approaches endpoint."""

    @pytest.mark.asyncio
    async def test_update_professional_therapeutic_approaches_success(self, mock_service_class, mock_db):
        """Test successful update of professional therapeutic approaches."""
        mock_service = MagicMock()
        mock_approaches = [MagicMock(), MagicMock()]
        mock_service.add_therapeutic_approaches_to_professional.return_value = mock_approaches
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        approach_ids = "550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003"

        result = update_professional_therapeutic_approaches(
            professional_id=professional_id, approach_ids=approach_ids, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        expected_approach_ids = ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"]
        mock_service.add_therapeutic_approaches_to_professional.assert_called_once_with(
            professional_id, expected_approach_ids
        )
        assert result == {"message": "Updated 2 therapeutic approaches for professional"}

    @pytest.mark.asyncio
    async def test_update_professional_therapeutic_approaches_empty_string(self, mock_service_class, mock_db):
        """Test update of professional therapeutic approaches with empty string."""
        mock_service = MagicMock()
        mock_service.add_therapeutic_approaches_to_professional.return_value = []
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        approach_ids = ""

        result = update_professional_therapeutic_approaches(
            professional_id=professional_id, approach_ids=approach_ids, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.add_therapeutic_approaches_to_professional.assert_called_once_with(professional_id, [])
        assert result == {"message": "Updated 0 therapeutic approaches for professional"}

    @pytest.mark.asyncio
    async def test_update_professional_therapeutic_approaches_with_spaces(self, mock_service_class, mock_db):
        """Test update of professional therapeutic approaches with spaces in IDs."""
        mock_service = MagicMock()
        mock_approaches = [MagicMock()]
        mock_service.add_therapeutic_approaches_to_professional.return_value = mock_approaches
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        approach_ids = " 550e8400-e29b-41d4-a716-446655440002 , 550e8400-e29b-41d4-a716-446655440003 "

        result = update_professional_therapeutic_approaches(
            professional_id=professional_id, approach_ids=approach_ids, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        expected_approach_ids = ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"]
        mock_service.add_therapeutic_approaches_to_professional.assert_called_once_with(
            professional_id, expected_approach_ids
        )
        assert result == {"message": "Updated 1 therapeutic approaches for professional"}
