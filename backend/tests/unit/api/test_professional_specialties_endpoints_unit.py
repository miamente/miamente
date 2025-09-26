"""
Unit tests for professional specialties endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.professional_specialties import (
    create_professional_specialty,
    delete_professional_specialty,
    get_professional_specialty,
    get_professional_specialties,
    update_professional_specialties,
    update_professional_specialty,
)
from app.schemas.professional_specialty import (
    ProfessionalSpecialtyCreate,
    ProfessionalSpecialtyUpdate,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def mock_db():
    """Mock database session."""
    return MagicMock(spec=Session)


@pytest.fixture
def sample_professional_specialty():
    """Sample professional specialty data."""
    specialty = MagicMock()
    specialty.id = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
    specialty.professional_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440001")
    specialty.specialty_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440002")
    specialty.is_active = True
    return specialty


@pytest.fixture
def sample_professional_specialty_create():
    """Sample professional specialty creation data."""
    return ProfessionalSpecialtyCreate(
        professional_id="550e8400-e29b-41d4-a716-446655440001",
        specialty_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440002"),
        is_active=True,
    )


@pytest.fixture
def sample_professional_specialty_update():
    """Sample professional specialty update data."""
    return ProfessionalSpecialtyUpdate(specialty_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"), is_active=False)


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestGetProfessionalSpecialties:
    """Test get_professional_specialties endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_specialties_success(
        self, mock_service_class, mock_db, sample_professional_specialty
    ):
        """Test successful retrieval of professional specialties."""
        mock_service = MagicMock()
        mock_service.get_professional_specialties.return_value = [sample_professional_specialty]
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_specialties(professional_id=professional_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_specialties.assert_called_once_with(professional_id)
        assert result == [sample_professional_specialty]

    @pytest.mark.asyncio
    async def test_get_professional_specialties_empty_list(self, mock_service_class, mock_db):
        """Test retrieval of professional specialties with empty result."""
        mock_service = MagicMock()
        mock_service.get_professional_specialties.return_value = []
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_specialties(professional_id=professional_id, db=mock_db)

        assert result == []


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestGetProfessionalSpecialty:
    """Test get_professional_specialty endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_specialty_success(self, mock_service_class, mock_db, sample_professional_specialty):
        """Test successful retrieval of a professional specialty."""
        mock_service = MagicMock()
        mock_service.get_professional_specialty.return_value = sample_professional_specialty
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"
        result = get_professional_specialty(specialty_id=specialty_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_specialty.assert_called_once_with(specialty_id)
        assert result == sample_professional_specialty

    @pytest.mark.asyncio
    async def test_get_professional_specialty_not_found(self, mock_service_class, mock_db):
        """Test professional specialty not found."""
        mock_service = MagicMock()
        mock_service.get_professional_specialty.return_value = None
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            get_professional_specialty(specialty_id=specialty_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional specialty not found"


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestCreateProfessionalSpecialty:
    """Test create_professional_specialty endpoint."""

    @pytest.mark.asyncio
    async def test_create_professional_specialty_success(
        self, mock_service_class, mock_db, sample_professional_specialty_create, sample_professional_specialty
    ):
        """Test successful creation of a professional specialty."""
        mock_service = MagicMock()
        mock_service.create_professional_specialty.return_value = sample_professional_specialty
        mock_service_class.return_value = mock_service

        result = create_professional_specialty(specialty=sample_professional_specialty_create, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.create_professional_specialty.assert_called_once_with(sample_professional_specialty_create)
        assert result == sample_professional_specialty


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestUpdateProfessionalSpecialty:
    """Test update_professional_specialty endpoint."""

    @pytest.mark.asyncio
    async def test_update_professional_specialty_success(
        self, mock_service_class, mock_db, sample_professional_specialty_update, sample_professional_specialty
    ):
        """Test successful update of a professional specialty."""
        mock_service = MagicMock()
        mock_service.update_professional_specialty.return_value = sample_professional_specialty
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"
        result = update_professional_specialty(
            specialty_id=specialty_id, specialty_update=sample_professional_specialty_update, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.update_professional_specialty.assert_called_once_with(
            specialty_id, sample_professional_specialty_update
        )
        assert result == sample_professional_specialty

    @pytest.mark.asyncio
    async def test_update_professional_specialty_not_found(
        self, mock_service_class, mock_db, sample_professional_specialty_update
    ):
        """Test professional specialty update not found."""
        mock_service = MagicMock()
        mock_service.update_professional_specialty.return_value = None
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            update_professional_specialty(
                specialty_id=specialty_id, specialty_update=sample_professional_specialty_update, db=mock_db
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional specialty not found"


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestDeleteProfessionalSpecialty:
    """Test delete_professional_specialty endpoint."""

    @pytest.mark.asyncio
    async def test_delete_professional_specialty_success(self, mock_service_class, mock_db):
        """Test successful deletion of a professional specialty."""
        mock_service = MagicMock()
        mock_service.delete_professional_specialty.return_value = True
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"
        result = delete_professional_specialty(specialty_id=specialty_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.delete_professional_specialty.assert_called_once_with(specialty_id)
        assert result == {"message": "Professional specialty deleted successfully"}

    @pytest.mark.asyncio
    async def test_delete_professional_specialty_not_found(self, mock_service_class, mock_db):
        """Test professional specialty deletion not found."""
        mock_service = MagicMock()
        mock_service.delete_professional_specialty.return_value = False
        mock_service_class.return_value = mock_service

        specialty_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            delete_professional_specialty(specialty_id=specialty_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional specialty not found"


@patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService")
class TestUpdateProfessionalSpecialties:
    """Test update_professional_specialties endpoint."""

    @pytest.mark.asyncio
    async def test_update_professional_specialties_success(self, mock_service_class, mock_db):
        """Test successful update of professional specialties."""
        mock_service = MagicMock()
        mock_specialties = [MagicMock(), MagicMock()]
        mock_service.add_specialties_to_professional.return_value = mock_specialties
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        specialty_ids = ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"]

        result = update_professional_specialties(
            professional_id=professional_id, specialty_ids=specialty_ids, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.add_specialties_to_professional.assert_called_once_with(professional_id, specialty_ids)
        assert result == {"message": "Updated 2 specialties for professional"}

    @pytest.mark.asyncio
    async def test_update_professional_specialties_empty_list(self, mock_service_class, mock_db):
        """Test update of professional specialties with empty list."""
        mock_service = MagicMock()
        mock_service.add_specialties_to_professional.return_value = []
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        specialty_ids = []

        result = update_professional_specialties(
            professional_id=professional_id, specialty_ids=specialty_ids, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.add_specialties_to_professional.assert_called_once_with(professional_id, specialty_ids)
        assert result == {"message": "Updated 0 specialties for professional"}
