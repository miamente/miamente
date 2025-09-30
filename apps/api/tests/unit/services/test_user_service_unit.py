"""
Unit tests for user service - fully mocked, no database connection.
"""

# import pytest
from unittest.mock import MagicMock
from app.services.user_service import UserService

from app.schemas.user import UserUpdate
from app.models.user import User as UserModel


class TestUserServiceUnit:
    """Unit tests for UserService with mocked dependencies."""

    def test_get_user_by_id_found(self, db_session):
        """Test getting user by ID when user exists."""
        # Arrange
        user_service = UserService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        # Act
        result = user_service.get_user_by_id("user_id")

        # Assert
        assert result == mock_user
        db_session.query.assert_called_once_with(UserModel)

    def test_get_user_by_id_not_found(self, db_session):
        """Test getting user by ID when user doesn't exist."""
        # Arrange
        user_service = UserService(db_session)
        db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = user_service.get_user_by_id("nonexistent_id")

        # Assert
        assert result is None
        db_session.query.assert_called_once_with(UserModel)

    def test_get_user_by_email_found(self, db_session):
        """Test getting user by email when user exists."""
        # Arrange
        user_service = UserService(db_session)
        mock_user = MagicMock()
        mock_user.email = "test@example.com"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        # Act
        result = user_service.get_user_by_email("test@example.com")

        # Assert
        assert result == mock_user
        db_session.query.assert_called_once_with(UserModel)

    def test_get_user_by_email_not_found(self, db_session):
        """Test getting user by email when user doesn't exist."""
        # Arrange
        user_service = UserService(db_session)
        db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = user_service.get_user_by_email("nonexistent@example.com")

        # Assert
        assert result is None
        db_session.query.assert_called_once_with(UserModel)

    def test_get_users_with_pagination(self, db_session):
        """Test getting users with pagination."""
        # Arrange
        user_service = UserService(db_session)
        mock_users = [MagicMock(), MagicMock(), MagicMock()]

        db_session.query.return_value.offset.return_value.limit.return_value.all.return_value = mock_users

        # Act
        result = user_service.get_users(skip=10, limit=5)

        # Assert
        assert result == mock_users
        db_session.query.assert_called_once_with(UserModel)
        db_session.query.return_value.offset.assert_called_once_with(10)
        db_session.query.return_value.offset.return_value.limit.assert_called_once_with(5)

    def test_get_users_default_pagination(self, db_session):
        """Test getting users with default pagination."""
        # Arrange
        user_service = UserService(db_session)
        mock_users = [MagicMock()]

        db_session.query.return_value.offset.return_value.limit.return_value.all.return_value = mock_users

        # Act
        result = user_service.get_users()

        # Assert
        assert result == mock_users
        db_session.query.return_value.offset.assert_called_once_with(0)
        db_session.query.return_value.offset.return_value.limit.assert_called_once_with(100)

    def test_update_user_success(self, db_session):
        """Test successful user update."""
        # Arrange
        user_service = UserService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"
        mock_user.full_name = "Old Name"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        update_data = UserUpdate(full_name="New Name")

        # Act
        result = user_service.update_user("user_id", update_data)

        # Assert
        assert result == mock_user
        assert mock_user.full_name == "New Name"
        db_session.commit.assert_called_once()
        db_session.refresh.assert_called_once_with(mock_user)

    def test_update_user_not_found(self, db_session):
        """Test updating user that doesn't exist."""
        # Arrange
        user_service = UserService(db_session)
        db_session.query.return_value.filter.return_value.first.return_value = None

        update_data = UserUpdate(full_name="New Name")

        # Act
        result = user_service.update_user("nonexistent_id", update_data)

        # Assert
        assert result is None
        db_session.commit.assert_not_called()
        db_session.refresh.assert_not_called()

    def test_update_user_partial_update(self, db_session):
        """Test partial user update with only some fields."""
        # Arrange
        user_service = UserService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"
        mock_user.full_name = "Old Name"
        mock_user.phone = "old_phone"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        update_data = UserUpdate(phone="new_phone")

        # Act
        result = user_service.update_user("user_id", update_data)

        # Assert
        assert result == mock_user
        assert mock_user.phone == "new_phone"
        assert mock_user.full_name == "Old Name"  # Should not change
        db_session.commit.assert_called_once()
        db_session.refresh.assert_called_once_with(mock_user)

    def test_deactivate_user_success(self, db_session):
        """Test successful user deactivation."""
        # Arrange
        user_service = UserService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"
        mock_user.is_active = True

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        # Act
        result = user_service.deactivate_user("user_id")

        # Assert
        assert result is True
        assert mock_user.is_active is False
        db_session.commit.assert_called_once()

    def test_deactivate_user_not_found(self, db_session):
        """Test deactivating user that doesn't exist."""
        # Arrange
        user_service = UserService(db_session)
        db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = user_service.deactivate_user("nonexistent_id")

        # Assert
        assert result is False
        db_session.commit.assert_not_called()
