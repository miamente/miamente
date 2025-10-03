"""
Unit tests for professionals endpoints.
"""

import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.professionals import (
    get_professionals,
    get_professional,
    get_current_professional,
    update_current_professional,
    toggle_professional_status,
    delete_professional_admin,
    _apply_professional_filters,
)
from app.schemas.professional import ProfessionalResponse, ProfessionalUpdate
from app.services.auth_service import AuthService

pytestmark = pytest.mark.unit


class TestProfessionalsEndpointsUnit:
    """Unit tests for professionals endpoints."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def mock_auth_service(self):
        """Mock auth service."""
        return MagicMock(spec=AuthService)

    @pytest.fixture
    def sample_professional(self):
        """Sample professional object."""
        professional = MagicMock()
        professional.id = uuid.UUID("87654321-4321-8765-2109-876543210987")
        professional.email = "professional@example.com"
        professional.full_name = "Test Professional"
        professional.phone_country_code = "+1"
        professional.phone_number = "1234567890"
        professional.license_number = "PSI-12345"
        professional.currency = "COP"
        professional.bio = "Test professional bio"
        professional.timezone = "America/Bogota"
        professional.profile_picture = "professional.jpg"
        professional.is_active = True
        professional.is_verified = False
        professional.created_at = datetime.now()
        professional.updated_at = None
        professional.years_experience = 5
        professional.rate_cents = 50000
        professional.specialty_ids = []
        professional.therapy_approaches_ids = []
        professional.academic_experience = []
        professional.work_experience = []
        professional.certifications = []
        professional.languages = []
        professional.professional_modalities = []
        return professional

    @pytest.fixture
    def sample_professional_update(self):
        """Sample professional update data."""
        return ProfessionalUpdate(
            full_name="Updated Professional",
            phone_country_code="+1",
            phone_number="9876543210",
            bio="Updated bio",
            years_experience=10,
            rate_cents=75000,
        )

    @pytest.fixture
    def sample_professional_response(self):
        """Sample professional response object."""
        return ProfessionalResponse(
            id=uuid.UUID("87654321-4321-8765-2109-876543210987"),
            email="professional@example.com",
            full_name="Test Professional",
            phone_country_code="+1",
            phone_number="1234567890",
            license_number="PSI-12345",
            currency="COP",
            bio="Test professional bio",
            timezone="America/Bogota",
            is_active=True,
            is_verified=False,
            profile_picture="professional.jpg",
            created_at=datetime.now(),
            updated_at=None,
            years_experience=5,
            rate_cents=50000,
            specialty_ids=[],
            modalities=[],
            academic_experience=[],
            work_experience=[],
            certifications=[],
            languages=[],
            therapy_approaches_ids=[],
        )

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    async def test_get_professionals_success(
        self, mock_parse_professional_data, mock_db_session, sample_professional, sample_professional_response
    ):
        """Test successful get professionals."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [sample_professional]
        mock_parse_professional_data.return_value = sample_professional_response

        # Act
        result = await get_professionals(
            skip=0, limit=100, specialty=None, min_rate_cents=None, max_rate_cents=None, db=mock_db_session
        )

        # Assert
        mock_db_session.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_query.offset.assert_called_once_with(0)
        mock_query.limit.assert_called_once_with(100)
        mock_query.all.assert_called_once()
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert len(result) == 1
        assert result[0] == sample_professional_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    async def test_get_professionals_with_filters(
        self, mock_parse_professional_data, mock_db_session, sample_professional, sample_professional_response
    ):
        """Test get professionals with rate filters."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [sample_professional]
        mock_parse_professional_data.return_value = sample_professional_response

        # Act
        result = await get_professionals(
            skip=0, limit=100, specialty=None, min_rate_cents=40000, max_rate_cents=60000, db=mock_db_session
        )

        # Assert
        mock_db_session.query.assert_called_once()
        # The query gets filtered multiple times: once for is_active, then for rate range
        assert mock_query.filter.call_count >= 3  # is_active + min_rate + max_rate
        assert len(result) == 1

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    async def test_get_professional_success(
        self, mock_parse_professional_data, mock_db_session, sample_professional, sample_professional_response
    ):
        """Test successful get professional by ID."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = sample_professional
        mock_parse_professional_data.return_value = sample_professional_response
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act
        result = await get_professional(professional_id, mock_db_session)

        # Assert
        mock_db_session.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_query.first.assert_called_once()
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert result == sample_professional_response

    @pytest.mark.asyncio
    async def test_get_professional_invalid_id_format(self, mock_db_session):
        """Test get professional with invalid ID format."""
        # Arrange
        invalid_id = "invalid-id"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_professional(invalid_id, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Invalid ID format"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    async def test_get_professional_not_found(self, mock_db_session):
        """Test get professional when professional not found."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_professional(professional_id, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_get_current_professional_success(
        self,
        mock_auth_service_class,
        mock_parse_professional_data,
        mock_db_session,
        sample_professional,
        sample_professional_response,
    ):
        """Test successful get current professional profile."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = sample_professional
        mock_parse_professional_data.return_value = sample_professional_response

        # Act
        result = await get_current_professional("prof-123", mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.get_professional_by_id.assert_called_once_with("prof-123")
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert result == sample_professional_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_get_current_professional_not_found(self, mock_auth_service_class, mock_db_session):
        """Test get current professional when professional not found."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_professional("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_get_current_professional_database_error(self, mock_auth_service_class, mock_db_session):
        """Test get current professional with database error."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.side_effect = Exception("Database error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_professional("prof-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Database error" in exc_info.value.detail

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_update_current_professional_success(
        self,
        mock_auth_service_class,
        mock_parse_professional_data,
        mock_db_session,
        sample_professional,
        sample_professional_update,
        sample_professional_response,
    ):
        """Test successful update current professional."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = sample_professional
        mock_parse_professional_data.return_value = sample_professional_response

        # Act
        result = await update_current_professional(sample_professional_update, "prof-123", mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.get_professional_by_id.assert_called_once_with("prof-123")
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_professional)
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert result == sample_professional_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_update_current_professional_not_found(
        self, mock_auth_service_class, mock_db_session, sample_professional_update
    ):
        """Test update current professional when professional not found."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_current_professional(sample_professional_update, "nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.AuthService")
    async def test_update_current_professional_database_error(
        self, mock_auth_service_class, mock_db_session, sample_professional, sample_professional_update
    ):
        """Test update current professional with database error."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = sample_professional
        mock_db_session.commit.side_effect = Exception("Database error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_current_professional(sample_professional_update, "prof-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error updating professional" in exc_info.value.detail
        mock_db_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    @patch("app.api.v1.endpoints.professionals.AuthService")
    @patch("app.api.v1.endpoints.professionals.uuid.uuid4")
    async def test_update_current_professional_with_temporary_modality_ids(
        self,
        mock_uuid4,
        mock_auth_service_class,
        mock_parse_professional_data,
        mock_db_session,
        sample_professional,
        sample_professional_response,
    ):
        """Test update current professional with temporary modality IDs from frontend."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_professional_by_id.return_value = sample_professional
        mock_parse_professional_data.return_value = sample_professional_response
        
        # Mock UUID generation for temporary IDs
        mock_uuid4.return_value = uuid.UUID("12345678-1234-1234-1234-123456789abc")
        
        # Mock database query for modalities deletion
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        
        # Create update data with temporary modality IDs
        update_data = ProfessionalUpdate(
            full_name="Updated Professional",
            modalities=[
                {
                    "id": "temp-1234567890",  # Temporary ID from frontend
                    "modalityId": "temp-1234567890",
                    "modalityName": "Virtual",
                    "virtualPrice": 50000,
                    "presencialPrice": 0,
                    "offersPresencial": False,
                    "description": "Virtual sessions",
                    "isDefault": True,
                }
            ]
        )

        # Act
        result = await update_current_professional(update_data, "prof-123", mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.get_professional_by_id.assert_called_once_with("prof-123")
        
        # Verify that temporary modality IDs are handled properly
        mock_uuid4.assert_called_once()  # Should generate new UUID for temp ID
        
        # Verify that modalities are deleted and new ones added
        mock_db_session.query.assert_called()
        mock_db_session.add.assert_called()  # Should add new modality
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_professional)
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert result == sample_professional_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.professionals.parse_professional_data")
    async def test_toggle_professional_status_success(
        self, mock_parse_professional_data, mock_db_session, sample_professional, sample_professional_response
    ):
        """Test successful toggle professional status (admin only)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = sample_professional
        mock_parse_professional_data.return_value = sample_professional_response
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act
        result = await toggle_professional_status(professional_id, status_data, mock_admin_user, mock_db_session)

        # Assert
        mock_db_session.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_query.first.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_professional)
        mock_parse_professional_data.assert_called_once_with(sample_professional)
        assert sample_professional.is_active is False
        assert result == sample_professional_response

    @pytest.mark.asyncio
    async def test_toggle_professional_status_invalid_id_format(self, mock_db_session):
        """Test toggle professional status with invalid ID format (admin only)."""
        # Arrange
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}
        invalid_id = "invalid-id"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await toggle_professional_status(invalid_id, status_data, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Invalid ID format"

    @pytest.mark.asyncio
    async def test_toggle_professional_status_not_found(self, mock_db_session):
        """Test toggle professional status when professional not found (admin only)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await toggle_professional_status(professional_id, status_data, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional not found"

    @pytest.mark.asyncio
    async def test_toggle_professional_status_database_error(self, mock_db_session, sample_professional):
        """Test toggle professional status with database error (admin only)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = sample_professional
        mock_db_session.commit.side_effect = Exception("Database error")
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await toggle_professional_status(professional_id, status_data, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error updating professional status" in exc_info.value.detail
        mock_db_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_professional_admin_success(self, mock_db_session, sample_professional):
        """Test successful delete professional (admin only, soft delete)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = sample_professional
        mock_admin_user = MagicMock()
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act
        result = await delete_professional_admin(professional_id, mock_admin_user, mock_db_session)

        # Assert
        mock_db_session.query.assert_called_once()
        mock_query.filter.assert_called_once()
        mock_query.first.assert_called_once()
        mock_db_session.commit.assert_called_once()
        assert sample_professional.is_active is False
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_professional_admin_invalid_id_format(self, mock_db_session):
        """Test delete professional with invalid ID format (admin only)."""
        # Arrange
        mock_admin_user = MagicMock()
        invalid_id = "invalid-id"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_professional_admin(invalid_id, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Invalid ID format"

    @pytest.mark.asyncio
    async def test_delete_professional_admin_not_found(self, mock_db_session):
        """Test delete professional when professional not found (admin only)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_admin_user = MagicMock()
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_professional_admin(professional_id, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Professional not found"

    @pytest.mark.asyncio
    async def test_delete_professional_admin_database_error(self, mock_db_session, sample_professional):
        """Test delete professional with database error (admin only)."""
        # Arrange
        mock_query = MagicMock()
        mock_db_session.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = sample_professional
        mock_db_session.commit.side_effect = Exception("Database error")
        mock_admin_user = MagicMock()
        professional_id = "87654321-4321-8765-2109-876543210987"

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_professional_admin(professional_id, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error deleting professional" in exc_info.value.detail
        mock_db_session.rollback.assert_called_once()

    def test_apply_professional_filters_no_filters(self):
        """Test apply professional filters with no filters."""
        # Arrange
        mock_query = MagicMock()

        # Act
        result = _apply_professional_filters(mock_query, None, None, None)

        # Assert
        assert result == mock_query
        mock_query.filter.assert_not_called()

    def test_apply_professional_filters_with_rate_range(self):
        """Test apply professional filters with rate range."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query  # Make filter return self for chaining

        # Act
        result = _apply_professional_filters(mock_query, None, 40000, 60000)

        # Assert
        assert result == mock_query
        # Should have 2 filter calls for min and max rate
        assert mock_query.filter.call_count == 2

    def test_apply_professional_filters_with_min_rate_only(self):
        """Test apply professional filters with min rate only."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query  # Make filter return self for chaining

        # Act
        result = _apply_professional_filters(mock_query, None, 40000, None)

        # Assert
        assert result == mock_query
        # Should have 1 filter call for min rate
        assert mock_query.filter.call_count == 1

    def test_apply_professional_filters_with_max_rate_only(self):
        """Test apply professional filters with max rate only."""
        # Arrange
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query  # Make filter return self for chaining

        # Act
        result = _apply_professional_filters(mock_query, None, None, 60000)

        # Assert
        assert result == mock_query
        # Should have 1 filter call for max rate
        assert mock_query.filter.call_count == 1
