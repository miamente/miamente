"""
Unit tests for auth service - fully mocked, no database connection.
"""

import pytest
import uuid
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.schemas.user import UserCreate
from app.models.user import User as UserModel


class TestAuthServiceUnit:
    """Unit tests for AuthService with mocked dependencies."""

    def test_authenticate_user_success(self, db_session):
        """Test successful user authentication."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        mock_user = MagicMock()
        mock_user.hashed_password = "hashed_password"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        with patch("app.services.auth_service.verify_password", return_value=True) as mock_verify:
            # Act
            result = auth_service.authenticate_user("test@example.com", "password123")

            # Assert
            assert result == mock_user
            mock_verify.assert_called_once_with("password123", "hashed_password")
            db_session.query.assert_called_once_with(UserModel)

    def test_authenticate_user_not_found(self, db_session):
        """Test authentication when user is not found."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = auth_service.authenticate_user("nonexistent@example.com", "password123")

        # Assert
        assert result is None
        db_session.query.assert_called_once_with(UserModel)

    def test_authenticate_user_wrong_password(self, db_session):
        """Test authentication with wrong password."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        mock_user = MagicMock()
        mock_user.hashed_password = "hashed_password"

        db_session.query.return_value.filter.return_value.first.return_value = mock_user

        with patch("app.services.auth_service.verify_password", return_value=False) as mock_verify:
            # Act
            result = auth_service.authenticate_user("test@example.com", "wrong_password")

            # Assert
            assert result is None
            mock_verify.assert_called_once_with("wrong_password", "hashed_password")

    def test_create_user_success(self, db_session, test_user_data):
        """Test successful user creation."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        user_create = UserCreate(**test_user_data)
        mock_user = MagicMock()
        mock_user.id = "user_id"

        db_session.query.return_value.filter.return_value.first.return_value = None  # No existing user
        db_session.add.return_value = None
        db_session.commit.return_value = None
        db_session.refresh.return_value = None

        with patch("app.services.auth_service.get_password_hash", return_value="hashed_password") as mock_hash:
            # Act
            result = auth_service.create_user(user_create)

            # Assert
            assert result is not None
            db_session.add.assert_called_once()
            db_session.commit.assert_called_once()
            db_session.refresh.assert_called_once()
            mock_hash.assert_called_once_with(test_user_data["password"])

    def test_create_user_duplicate_email(self, db_session, test_user_data):
        """Test user creation with duplicate email."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        user_create = UserCreate(**test_user_data)
        mock_existing_user = MagicMock()

        db_session.query.return_value.filter.return_value.first.return_value = mock_existing_user

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(user_create)

        assert exc_info.value.status_code == 400
        assert "Email already registered" in str(exc_info.value.detail)

    def test_get_user_by_id_found(self, db_session):
        """Test getting user by ID when user exists."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"
        test_uuid = uuid.uuid4()

        with patch("uuid.UUID", return_value=test_uuid) as mock_uuid:
            db_session.query.return_value.filter.return_value.first.return_value = mock_user

            # Act
            result = auth_service.get_user_by_id(str(test_uuid))

            # Assert
            assert result == mock_user
            db_session.query.assert_called_once_with(UserModel)
            mock_uuid.assert_called_once_with(str(test_uuid))

    def test_get_user_by_id_invalid_uuid(self, db_session):
        """Test getting user by ID with invalid UUID."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)

        with patch("uuid.UUID", side_effect=ValueError("Invalid UUID")):
            # Act
            result = auth_service.get_user_by_id("invalid_uuid")

            # Assert
            assert result is None
            db_session.query.assert_not_called()

    def test_get_current_user_valid_token(self, db_session):
        """Test getting current user with valid token."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)
        mock_user = MagicMock()
        mock_user.id = "user_id"
        test_uuid = uuid.uuid4()

        with (
            patch("app.services.auth_service.verify_token", return_value=str(test_uuid)) as mock_verify,
            patch("uuid.UUID", return_value=test_uuid) as mock_uuid,
        ):
            db_session.query.return_value.filter.return_value.first.return_value = mock_user

            # Act
            result = auth_service.get_current_user("valid_token")

            # Assert
            assert result == mock_user
            mock_verify.assert_called_once_with("valid_token")
            mock_uuid.assert_called_once_with(str(test_uuid))

    def test_get_current_user_invalid_token(self, db_session):
        """Test getting current user with invalid token."""
        # Arrange
        from app.services.auth_service import AuthService

        auth_service = AuthService(db_session)

        with patch("app.services.auth_service.verify_token", return_value=None) as mock_verify:
            # Act
            result = auth_service.get_current_user("invalid_token")

            # Assert
            assert result is None
            mock_verify.assert_called_once_with("invalid_token")
            db_session.query.assert_not_called()
