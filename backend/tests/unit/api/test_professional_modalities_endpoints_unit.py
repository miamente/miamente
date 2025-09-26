"""
Unit tests for professional modalities endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.professional_modalities import (
    create_professional_modality,
    delete_professional_modality,
    get_default_professional_modality,
    get_professional_modality,
    get_professional_modalities,
    set_default_modality,
    update_professional_modality,
)
from app.schemas.professional_modality import (
    ProfessionalModalityCreate,
    ProfessionalModalityUpdate,
)

pytestmark = pytest.mark.unit


@pytest.fixture
def mock_db():
    """Mock database session."""
    return MagicMock(spec=Session)


@pytest.fixture
def sample_professional_modality():
    """Sample professional modality data."""
    modality = MagicMock()
    modality.id = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
    modality.professional_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440001")
    modality.modality_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440002")
    modality.modality_name = "Individual Therapy"
    modality.description = "One-on-one therapy session"
    modality.virtual_price = 5000
    modality.presencial_price = 6000
    modality.offers_presencial = True
    modality.is_default = False
    modality.is_active = True
    return modality


@pytest.fixture
def sample_professional_modality_create():
    """Sample professional modality creation data."""
    return ProfessionalModalityCreate(
        professional_id="550e8400-e29b-41d4-a716-446655440001",
        modality_id=uuid.UUID("550e8400-e29b-41d4-a716-446655440002"),
        modality_name="Individual Therapy",
        description="One-on-one therapy session",
        virtual_price=5000,
        presencial_price=6000,
        offers_presencial=True,
        is_default=False,
        is_active=True,
    )


@pytest.fixture
def sample_professional_modality_update():
    """Sample professional modality update data."""
    return ProfessionalModalityUpdate(
        modality_name="Updated Individual Therapy",
        description="Updated description",
        virtual_price=5500,
        presencial_price=6500,
    )


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestGetProfessionalModalities:
    """Test get_professional_modalities endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_modalities_success(self, mock_service_class, mock_db, sample_professional_modality):
        """Test successful retrieval of professional modalities."""
        mock_service = MagicMock()
        mock_service.get_professional_modalities.return_value = [sample_professional_modality]
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_modalities(professional_id=professional_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_modalities.assert_called_once_with(professional_id)
        assert result == [sample_professional_modality]

    @pytest.mark.asyncio
    async def test_get_professional_modalities_empty_list(self, mock_service_class, mock_db):
        """Test retrieval of professional modalities with empty result."""
        mock_service = MagicMock()
        mock_service.get_professional_modalities.return_value = []
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_professional_modalities(professional_id=professional_id, db=mock_db)

        assert result == []


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestGetDefaultProfessionalModality:
    """Test get_default_professional_modality endpoint."""

    @pytest.mark.asyncio
    async def test_get_default_professional_modality_success(
        self, mock_service_class, mock_db, sample_professional_modality
    ):
        """Test successful retrieval of default professional modality."""
        mock_service = MagicMock()
        mock_service.get_default_professional_modality.return_value = sample_professional_modality
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"
        result = get_default_professional_modality(professional_id=professional_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_default_professional_modality.assert_called_once_with(professional_id)
        assert result == sample_professional_modality

    @pytest.mark.asyncio
    async def test_get_default_professional_modality_not_found(self, mock_service_class, mock_db):
        """Test default professional modality not found."""
        mock_service = MagicMock()
        mock_service.get_default_professional_modality.return_value = None
        mock_service_class.return_value = mock_service

        professional_id = "550e8400-e29b-41d4-a716-446655440001"

        with pytest.raises(HTTPException) as exc_info:
            get_default_professional_modality(professional_id=professional_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "No default modality found for this professional"


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestGetProfessionalModality:
    """Test get_professional_modality endpoint."""

    @pytest.mark.asyncio
    async def test_get_professional_modality_success(self, mock_service_class, mock_db, sample_professional_modality):
        """Test successful retrieval of a professional modality."""
        mock_service = MagicMock()
        mock_service.get_professional_modality.return_value = sample_professional_modality
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"
        result = get_professional_modality(modality_id=modality_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.get_professional_modality.assert_called_once_with(modality_id)
        assert result == sample_professional_modality

    @pytest.mark.asyncio
    async def test_get_professional_modality_not_found(self, mock_service_class, mock_db):
        """Test professional modality not found."""
        mock_service = MagicMock()
        mock_service.get_professional_modality.return_value = None
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            get_professional_modality(modality_id=modality_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional modality not found"


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestCreateProfessionalModality:
    """Test create_professional_modality endpoint."""

    @pytest.mark.asyncio
    async def test_create_professional_modality_success(
        self, mock_service_class, mock_db, sample_professional_modality_create, sample_professional_modality
    ):
        """Test successful creation of a professional modality."""
        mock_service = MagicMock()
        mock_service.create_professional_modality.return_value = sample_professional_modality
        mock_service_class.return_value = mock_service

        result = create_professional_modality(modality=sample_professional_modality_create, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.create_professional_modality.assert_called_once_with(sample_professional_modality_create)
        assert result == sample_professional_modality


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestUpdateProfessionalModality:
    """Test update_professional_modality endpoint."""

    @pytest.mark.asyncio
    async def test_update_professional_modality_success(
        self, mock_service_class, mock_db, sample_professional_modality_update, sample_professional_modality
    ):
        """Test successful update of a professional modality."""
        mock_service = MagicMock()
        mock_service.update_professional_modality.return_value = sample_professional_modality
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"
        result = update_professional_modality(
            modality_id=modality_id, modality_update=sample_professional_modality_update, db=mock_db
        )

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.update_professional_modality.assert_called_once_with(
            modality_id, sample_professional_modality_update
        )
        assert result == sample_professional_modality

    @pytest.mark.asyncio
    async def test_update_professional_modality_not_found(
        self, mock_service_class, mock_db, sample_professional_modality_update
    ):
        """Test professional modality update not found."""
        mock_service = MagicMock()
        mock_service.update_professional_modality.return_value = None
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            update_professional_modality(
                modality_id=modality_id, modality_update=sample_professional_modality_update, db=mock_db
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional modality not found"


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestDeleteProfessionalModality:
    """Test delete_professional_modality endpoint."""

    @pytest.mark.asyncio
    async def test_delete_professional_modality_success(self, mock_service_class, mock_db):
        """Test successful deletion of a professional modality."""
        mock_service = MagicMock()
        mock_service.delete_professional_modality.return_value = True
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"
        result = delete_professional_modality(modality_id=modality_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        mock_service.delete_professional_modality.assert_called_once_with(modality_id)
        assert result.status_code == status.HTTP_204_NO_CONTENT

    @pytest.mark.asyncio
    async def test_delete_professional_modality_not_found(self, mock_service_class, mock_db):
        """Test professional modality deletion not found."""
        mock_service = MagicMock()
        mock_service.delete_professional_modality.return_value = False
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            delete_professional_modality(modality_id=modality_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional modality not found"


@patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService")
class TestSetDefaultModality:
    """Test set_default_modality endpoint."""

    @pytest.mark.asyncio
    async def test_set_default_modality_success(self, mock_service_class, mock_db, sample_professional_modality):
        """Test successful setting of default modality."""
        mock_service = MagicMock()
        mock_service.get_professional_modality.return_value = sample_professional_modality
        mock_service.set_default_modality.return_value = True
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"
        result = set_default_modality(modality_id=modality_id, db=mock_db)

        mock_service_class.assert_called_once_with(mock_db)
        assert (
            mock_service.get_professional_modality.call_count == 2
        )  # Called twice - once for getting, once for returning
        mock_service.get_professional_modality.assert_any_call(modality_id)
        mock_service.set_default_modality.assert_called_once_with(
            sample_professional_modality.professional_id, modality_id
        )
        assert result == sample_professional_modality

    @pytest.mark.asyncio
    async def test_set_default_modality_not_found(self, mock_service_class, mock_db):
        """Test set default modality when modality not found."""
        mock_service = MagicMock()
        mock_service.get_professional_modality.return_value = None
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            set_default_modality(modality_id=modality_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional modality not found"

    @pytest.mark.asyncio
    async def test_set_default_modality_failure(self, mock_service_class, mock_db, sample_professional_modality):
        """Test set default modality when service fails."""
        mock_service = MagicMock()
        mock_service.get_professional_modality.return_value = sample_professional_modality
        mock_service.set_default_modality.return_value = False
        mock_service_class.return_value = mock_service

        modality_id = "550e8400-e29b-41d4-a716-446655440000"

        with pytest.raises(HTTPException) as exc_info:
            set_default_modality(modality_id=modality_id, db=mock_db)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Failed to set modality as default"
