"""
Comprehensive unit tests for UserService.
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.user_service import UserService
from app.models.user import User
from app.schemas.user import UserUpdate


class TestUserServiceComprehensiveUnit:
    """Comprehensive unit tests for UserService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def user_service(self, mock_db):
        """UserService instance with mocked database."""
        return UserService(mock_db)

    @pytest.fixture
    def sample_user(self):
        """Sample user for testing."""
        user = Mock(spec=User)
        user.id = "test-user-1"
        user.email = "user@example.com"
        user.full_name = "Test User"
        user.phone = "+1234567890"
        user.is_active = True
        user.is_verified = True
        return user

    def test_get_user_by_id_success(self, user_service, mock_db, sample_user):
        """Test getting a user by ID successfully."""
        # Arrange
        user_id = "test-user-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_id(user_id)

        # Assert
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_id_not_found(self, user_service, mock_db):
        """Test getting a user by ID that doesn't exist."""
        # Arrange
        user_id = "test-user-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_id(user_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_email_success(self, user_service, mock_db, sample_user):
        """Test getting a user by email successfully."""
        # Arrange
        email = "user@example.com"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_email(email)

        # Assert
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_email_not_found(self, user_service, mock_db):
        """Test getting a user by email that doesn't exist."""
        # Arrange
        email = "nonexistent@example.com"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_user_by_email(email)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_get_users_with_pagination(self, user_service, mock_db):
        """Test getting users with pagination."""
        # Arrange
        skip = 10
        limit = 20
        mock_users = [Mock(spec=User) for _ in range(3)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_users
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_users(skip=skip, limit=limit)

        # Assert
        assert result == mock_users
        mock_db.query.assert_called_once_with(User)
        mock_query.offset.assert_called_once_with(skip)
        mock_offset.limit.assert_called_once_with(limit)

    def test_get_users_default_pagination(self, user_service, mock_db):
        """Test getting users with default pagination."""
        # Arrange
        mock_users = [Mock(spec=User) for _ in range(5)]

        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = mock_users
        mock_db.query.return_value = mock_query

        # Act
        result = user_service.get_users()

        # Assert
        assert result == mock_users
        mock_db.query.assert_called_once_with(User)
        mock_query.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)

    def test_update_user_success(self, user_service, mock_db, sample_user):
        """Test updating a user successfully."""
        # Arrange
        user_id = "test-user-1"
        update_data = UserUpdate(full_name="Updated Name", phone="+9876543210")

        # Mock get_user_by_id to return our sample user
        user_service.get_user_by_id = Mock(return_value=sample_user)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = user_service.update_user(user_id, update_data)

        # Assert
        assert result == sample_user
        assert sample_user.full_name == "Updated Name"
        assert sample_user.phone == "+9876543210"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(sample_user)

    def test_update_user_not_found(self, user_service, mock_db):
        """Test updating a user that doesn't exist."""
        # Arrange
        user_id = "non-existent-id"
        update_data = UserUpdate(full_name="Updated Name")

        # Mock get_user_by_id to return None
        user_service.get_user_by_id = Mock(return_value=None)

        # Act
        result = user_service.update_user(user_id, update_data)

        # Assert
        assert result is None
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_update_user_partial_update(self, user_service, mock_db, sample_user):
        """Test updating a user with partial data."""
        # Arrange
        user_id = "test-user-1"
        update_data = UserUpdate(full_name="Updated Name")  # Only update name

        # Mock get_user_by_id to return our sample user
        user_service.get_user_by_id = Mock(return_value=sample_user)
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Act
        result = user_service.update_user(user_id, update_data)

        # Assert
        assert result == sample_user
        assert sample_user.full_name == "Updated Name"
        # Phone should remain unchanged
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(sample_user)

    def test_update_user_exception_handling(self, user_service, mock_db, sample_user):
        """Test update user with exception handling."""
        # Arrange
        user_id = "test-user-1"
        update_data = UserUpdate(full_name="Updated Name")

        # Mock get_user_by_id to return our sample user
        user_service.get_user_by_id = Mock(return_value=sample_user)
        from sqlalchemy.exc import SQLAlchemyError
        mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
        mock_db.rollback = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            user_service.update_user(user_id, update_data)

        assert exc_info.value.status_code == 500
        assert exc_info.value.detail == "Failed to update user"
        mock_db.rollback.assert_called_once()

    def test_deactivate_user_success(self, user_service, mock_db, sample_user):
        """Test deactivating a user successfully."""
        # Arrange
        user_id = "test-user-1"

        # Mock get_user_by_id to return our sample user
        user_service.get_user_by_id = Mock(return_value=sample_user)
        mock_db.commit = Mock()

        # Act
        result = user_service.deactivate_user(user_id)

        # Assert
        assert result is True
        assert sample_user.is_active is False
        mock_db.commit.assert_called_once()

    def test_deactivate_user_not_found(self, user_service, mock_db):
        """Test deactivating a user that doesn't exist."""
        # Arrange
        user_id = "non-existent-id"

        # Mock get_user_by_id to return None
        user_service.get_user_by_id = Mock(return_value=None)

        # Act
        result = user_service.deactivate_user(user_id)

        # Assert
        assert result is False
        mock_db.commit.assert_not_called()

    def test_deactivate_user_exception_handling(self, user_service, mock_db, sample_user):
        """Test deactivate user with exception handling."""
        # Arrange
        user_id = "test-user-1"

        # Mock get_user_by_id to return our sample user
        user_service.get_user_by_id = Mock(return_value=sample_user)
        from sqlalchemy.exc import SQLAlchemyError
        mock_db.commit = Mock(side_effect=SQLAlchemyError("Database error"))
        mock_db.rollback = Mock()

        # Act
        result = user_service.deactivate_user(user_id)

        # Assert
        assert result is False
        mock_db.rollback.assert_called_once()

    def test_user_service_initialization(self, mock_db):
        """Test UserService initialization."""
        # Act
        service = UserService(mock_db)

        # Assert
        assert service.db == mock_db
