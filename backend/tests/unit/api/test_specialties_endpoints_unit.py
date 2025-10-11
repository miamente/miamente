"""
Unit tests for specialties endpoints.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, Response

from app.api.v1.endpoints.specialties import (
    create_specialty,
    delete_specialty,
    get_specialties,
    get_specialty,
    update_specialty,
)
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate

pytestmark = pytest.mark.unit


@pytest.fixture
def sample_specialty():
    """Sample specialty for testing."""
    specialty = MagicMock()
    specialty.id = str(uuid.uuid4())
    specialty.name = "Clinical Psychology"
    specialty.is_active = True
    return specialty


@pytest.fixture
def sample_specialty_create():
    """Sample SpecialtyCreate for testing."""
    return SpecialtyCreate(name="Neuropsychology")


@pytest.fixture
def sample_specialty_update():
    """Sample SpecialtyUpdate for testing."""
    return SpecialtyUpdate(name="Updated Neuropsychology")


@pytest.fixture
def mock_db_session():
    """Mock database session."""
    return MagicMock()


@pytest.fixture
def mock_specialty_service():
    """Mock SpecialtyService."""
    return MagicMock()


class TestGetSpecialties:
    """Test get_specialties endpoint."""

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialties_success(self, mock_service_class, sample_specialty, mock_db_session):
        """Test successful retrieval of all specialties."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialties.return_value = [sample_specialty]
        mock_service.get_specialty_professional_count.return_value = 5

        result = get_specialties(skip=0, limit=100, db=mock_db_session)

        assert len(result) == 1
        expected_specialty = {
            "id": sample_specialty.id,
            "name": sample_specialty.name,
            "is_active": sample_specialty.is_active,
            "professional_count": 5,
        }
        assert result[0] == expected_specialty
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.get_specialties.assert_called_once_with(skip=0, limit=100)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialties_with_pagination(self, mock_service_class, mock_db_session):
        """Test retrieval with pagination."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialties.return_value = []

        result = get_specialties(skip=10, limit=50, db=mock_db_session)

        assert len(result) == 0
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.get_specialties.assert_called_once_with(skip=10, limit=50)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialties_with_search_and_pagination(self, mock_service_class, mock_db_session, sample_specialty):
        """Test retrieval supports search (delegated to service) and pagination params."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        # Endpoint signature doesn't take search; service-level search verified in admin endpoints;
        # here we keep pagination behavior consistent
        mock_service.get_specialties.return_value = [sample_specialty]

        result = get_specialties(skip=20, limit=10, db=mock_db_session)

        assert len(result) == 1
        mock_service.get_specialties.assert_called_once_with(skip=20, limit=10)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialties_empty(self, mock_service_class, mock_db_session):
        """Test retrieval when no specialties exist."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialties.return_value = []

        result = get_specialties(db=mock_db_session)

        assert len(result) == 0
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.get_specialties.assert_called_once_with(skip=0, limit=100)


class TestGetSpecialty:
    """Test get_specialty endpoint."""

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialty_success(self, mock_service_class, sample_specialty, mock_db_session):
        """Test successful retrieval of a specific specialty."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialty.return_value = sample_specialty

        result = get_specialty(specialty_id, db=mock_db_session)

        assert result == sample_specialty
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.get_specialty.assert_called_once_with(specialty_id)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_get_specialty_not_found(self, mock_service_class, mock_db_session):
        """Test retrieval of non-existent specialty."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialty.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            get_specialty(specialty_id, db=mock_db_session)

        assert exc_info.value.status_code == 404
        assert "Specialty not found" in str(exc_info.value.detail)
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.get_specialty.assert_called_once_with(specialty_id)


class TestCreateSpecialty:
    """Test create_specialty endpoint."""

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_create_specialty_success(
        self, mock_service_class, sample_specialty_create, sample_specialty, mock_db_session
    ):
        """Test successful specialty creation."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.create_specialty.return_value = sample_specialty

        result = create_specialty(sample_specialty_create, db=mock_db_session)

        assert result == sample_specialty
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.create_specialty.assert_called_once_with(sample_specialty_create)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_create_specialty_service_error(self, mock_service_class, sample_specialty_create, mock_db_session):
        """Test specialty creation with service error."""
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.create_specialty.side_effect = Exception("Service error")

        with pytest.raises(Exception) as exc_info:
            create_specialty(sample_specialty_create, db=mock_db_session)

        assert "Service error" in str(exc_info.value)
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.create_specialty.assert_called_once_with(sample_specialty_create)


class TestUpdateSpecialty:
    """Test update_specialty endpoint."""

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_update_specialty_success(
        self, mock_service_class, sample_specialty_update, sample_specialty, mock_db_session
    ):
        """Test successful specialty update."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.update_specialty.return_value = sample_specialty

        result = update_specialty(specialty_id, sample_specialty_update, db=mock_db_session)

        assert result == sample_specialty
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.update_specialty.assert_called_once_with(specialty_id, sample_specialty_update)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_update_specialty_not_found(self, mock_service_class, sample_specialty_update, mock_db_session):
        """Test update of non-existent specialty."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.update_specialty.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            update_specialty(specialty_id, sample_specialty_update, db=mock_db_session)

        assert exc_info.value.status_code == 404
        assert "Specialty not found" in str(exc_info.value.detail)
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.update_specialty.assert_called_once_with(specialty_id, sample_specialty_update)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_update_specialty_partial_update(self, mock_service_class, sample_specialty, mock_db_session):
        """Test partial specialty update."""
        specialty_id = str(uuid.uuid4())
        partial_update = SpecialtyUpdate(name="Updated Name")

        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.update_specialty.return_value = sample_specialty

        result = update_specialty(specialty_id, partial_update, db=mock_db_session)

        assert result == sample_specialty
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.update_specialty.assert_called_once_with(specialty_id, partial_update)


class TestDeleteSpecialty:
    """Test delete_specialty endpoint."""

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_delete_specialty_success(self, mock_service_class, mock_db_session):
        """Test successful specialty deletion."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialty_professional_count.return_value = 0
        mock_service.delete_specialty.return_value = True

        result = delete_specialty(specialty_id, db=mock_db_session)

        assert isinstance(result, Response)
        assert result.status_code == 204
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.delete_specialty.assert_called_once_with(specialty_id)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_delete_specialty_not_found(self, mock_service_class, mock_db_session):
        """Test deletion of non-existent specialty."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialty_professional_count.return_value = 0
        mock_service.delete_specialty.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            delete_specialty(specialty_id, db=mock_db_session)

        assert exc_info.value.status_code == 404
        assert "Specialty not found" in str(exc_info.value.detail)
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.delete_specialty.assert_called_once_with(specialty_id)

    @patch("app.api.v1.endpoints.specialties.SpecialtyService")
    def test_delete_specialty_service_error(self, mock_service_class, mock_db_session):
        """Test deletion with service error."""
        specialty_id = str(uuid.uuid4())
        mock_service = MagicMock()
        mock_service_class.return_value = mock_service
        mock_service.get_specialty_professional_count.return_value = 0
        mock_service.delete_specialty.side_effect = Exception("Service error")

        with pytest.raises(Exception) as exc_info:
            delete_specialty(specialty_id, db=mock_db_session)

        assert "Service error" in str(exc_info.value)
        mock_service_class.assert_called_once_with(mock_db_session)
        mock_service.delete_specialty.assert_called_once_with(specialty_id)
