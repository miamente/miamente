"""
Unit tests for users endpoints.
"""

import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.v1.endpoints.users import (
    get_users,
    get_current_user,
    get_user_by_id,
    update_current_user,
    delete_current_user,
    toggle_user_status,
    delete_user_admin,
)
from app.schemas.user import UserUpdate
from app.models.user import UserRole
from app.services.auth_service import AuthService
from app.services.user_service import UserService

pytestmark = pytest.mark.unit


class TestUsersEndpointsUnit:
    """Unit tests for users endpoints."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def mock_auth_service(self):
        """Mock auth service."""
        return MagicMock(spec=AuthService)

    @pytest.fixture
    def mock_user_service(self):
        """Mock user service."""
        return MagicMock(spec=UserService)

    @pytest.fixture
    def sample_user(self):
        """Sample user object."""
        user = MagicMock()
        user.id = uuid.UUID("12345678-1234-5678-9012-123456789012")
        user.email = "test@example.com"
        user.full_name = "Test User"
        user.phone = "+1234567890"
        user.emergency_contact = "Emergency Contact"
        user.emergency_phone = "+0987654321"
        user.profile_picture = "profile.jpg"
        user.is_active = True
        user.is_verified = False
        user.role = UserRole.USER
        user.created_at = datetime.now()
        user.updated_at = None
        return user

    @pytest.fixture
    def sample_admin_user(self):
        """Sample admin user object."""
        admin_user = MagicMock()
        admin_user.id = uuid.UUID("87654321-4321-8765-2109-876543210987")
        admin_user.email = "admin@example.com"
        admin_user.full_name = "Admin User"
        admin_user.phone = "+1234567890"
        admin_user.emergency_contact = "Emergency Contact"
        admin_user.emergency_phone = "+0987654321"
        admin_user.profile_picture = "admin.jpg"
        admin_user.is_active = True
        admin_user.is_verified = True
        admin_user.role = UserRole.ADMIN
        admin_user.created_at = datetime.now()
        admin_user.updated_at = None
        return admin_user

    @pytest.fixture
    def sample_user_update(self):
        """Sample user update data."""
        return UserUpdate(
            full_name="Updated User",
            phone="+9876543210",
            emergency_contact="Updated Emergency Contact",
            emergency_phone="+1234567890",
        )

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_get_users_success(self, mock_user_service_class, mock_db_session, sample_user, sample_admin_user):
        """Test successful get users (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_users.return_value = [sample_user, sample_admin_user]
        mock_admin_user = MagicMock()

        # Act
        result = await get_users(skip=0, limit=100, role=None, _admin_user=mock_admin_user, db=mock_db_session)

        # Assert
        mock_user_service_class.assert_called_once_with(mock_db_session)
        mock_user_service.get_users.assert_called_once_with(skip=0, limit=100)
        assert len(result) == 2
        assert result[0] == sample_user
        assert result[1] == sample_admin_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_get_users_with_role_filter(self, mock_user_service_class, mock_db_session, sample_user):
        """Test get users with role filter (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_users.return_value = [sample_user]
        mock_admin_user = MagicMock()

        # Act
        result = await get_users(skip=0, limit=100, role="user", _admin_user=mock_admin_user, db=mock_db_session)

        # Assert
        mock_user_service.get_users.assert_called_once_with(skip=0, limit=100)
        # The filtering happens in the endpoint logic
        assert len(result) == 1
        assert result[0] == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_get_current_user_success(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test successful get current user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user

        # Act
        result = await get_current_user("user-123", mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.get_user_by_id.assert_called_once_with("user-123")
        assert result == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_get_current_user_not_found(self, mock_auth_service_class, mock_db_session):
        """Test get current user when user not found."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_get_user_by_id_success(self, mock_user_service_class, mock_db_session, sample_user):
        """Test successful get user by ID (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = sample_user
        mock_admin_user = MagicMock()
        user_id = uuid.UUID("12345678-1234-5678-9012-123456789012")

        # Act
        result = await get_user_by_id(user_id, mock_admin_user, mock_db_session)

        # Assert
        mock_user_service_class.assert_called_once_with(mock_db_session)
        mock_user_service.get_user_by_id.assert_called_once_with(user_id)
        assert result == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_get_user_by_id_not_found(self, mock_user_service_class, mock_db_session):
        """Test get user by ID when user not found (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = None
        mock_admin_user = MagicMock()
        user_id = uuid.UUID("12345678-1234-5678-9012-123456789012")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_user_by_id(user_id, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_update_current_user_success(
        self, mock_auth_service_class, mock_db_session, sample_user, sample_user_update
    ):
        """Test successful update current user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user

        # Act
        result = await update_current_user(sample_user_update, "user-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("user-123")
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_user)
        assert result == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_update_current_user_not_found(self, mock_auth_service_class, mock_db_session, sample_user_update):
        """Test update current user when user not found."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_current_user(sample_user_update, "nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_update_current_user_database_error(
        self, mock_auth_service_class, mock_db_session, sample_user, sample_user_update
    ):
        """Test update current user with database error."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user
        mock_db_session.commit.side_effect = SQLAlchemyError("Database error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await update_current_user(sample_user_update, "user-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc_info.value.detail == "Failed to update user"
        mock_db_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_delete_current_user_success(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test successful delete current user (soft delete)."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user

        # Act
        result = await delete_current_user("user-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("user-123")
        mock_db_session.commit.assert_called_once()
        assert sample_user.is_active is False
        assert result is None

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_delete_current_user_not_found(self, mock_auth_service_class, mock_db_session):
        """Test delete current user when user not found."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_current_user("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.AuthService")
    async def test_delete_current_user_database_error(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test delete current user with database error."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user
        mock_db_session.commit.side_effect = SQLAlchemyError("Database error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_current_user("user-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc_info.value.detail == "Failed to delete user"
        mock_db_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_toggle_user_status_success(self, mock_user_service_class, mock_db_session, sample_user):
        """Test successful toggle user status (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = sample_user
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}

        # Act
        result = await toggle_user_status("user-123", status_data, mock_admin_user, mock_db_session)

        # Assert
        mock_user_service_class.assert_called_once_with(mock_db_session)
        mock_user_service.get_user_by_id.assert_called_once_with("user-123")
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once_with(sample_user)
        assert sample_user.is_active is False
        assert result == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_toggle_user_status_not_found(self, mock_user_service_class, mock_db_session):
        """Test toggle user status when user not found (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = None
        mock_admin_user = MagicMock()
        status_data = {"is_active": False}

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await toggle_user_status("nonexistent-123", status_data, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_toggle_user_status_database_error(self, mock_user_service_class, mock_db_session, sample_user):
        """Test toggle user status with database error (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = sample_user
        mock_admin_user = MagicMock()
        mock_db_session.commit.side_effect = SQLAlchemyError("Database error")
        status_data = {"is_active": False}

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await toggle_user_status("user-123", status_data, mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc_info.value.detail == "Failed to update user status"
        mock_db_session.rollback.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_delete_user_admin_success(self, mock_user_service_class, mock_db_session, sample_user):
        """Test successful delete user (admin only, soft delete)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = sample_user
        mock_admin_user = MagicMock()

        # Act
        result = await delete_user_admin("user-123", mock_admin_user, mock_db_session)

        # Assert
        mock_user_service_class.assert_called_once_with(mock_db_session)
        mock_user_service.get_user_by_id.assert_called_once_with("user-123")
        mock_db_session.commit.assert_called_once()
        assert sample_user.is_active is False
        assert result is None

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_delete_user_admin_not_found(self, mock_user_service_class, mock_db_session):
        """Test delete user when user not found (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = None
        mock_admin_user = MagicMock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_user_admin("nonexistent-123", mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.users.UserService")
    async def test_delete_user_admin_database_error(self, mock_user_service_class, mock_db_session, sample_user):
        """Test delete user with database error (admin only)."""
        # Arrange
        mock_user_service = mock_user_service_class.return_value
        mock_user_service.get_user_by_id.return_value = sample_user
        mock_admin_user = MagicMock()
        mock_db_session.commit.side_effect = SQLAlchemyError("Database error")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await delete_user_admin("user-123", mock_admin_user, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert exc_info.value.detail == "Failed to delete user"
        mock_db_session.rollback.assert_called_once()
