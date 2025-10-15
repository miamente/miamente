from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.utils.auth import (
    get_current_user_id,
    get_current_admin_user,
    INVALID_AUTH_CREDENTIALS_MESSAGE,
)


class TestGetCurrentUserId:
    """Test cases for get_current_user_id function."""

    def test_get_current_user_id_success(self):
        """Test successful user ID retrieval with valid token."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "valid_token"
        expected_user_id = "user123"

        with patch("app.utils.auth.verify_token") as mock_verify_token:
            mock_verify_token.return_value = expected_user_id
            # Act
            result = get_current_user_id(mock_credentials)

            # Assert
            assert result == expected_user_id
            mock_verify_token.assert_called_once_with("valid_token")

    def test_get_current_user_id_no_credentials(self):
        """Test HTTPException when no credentials provided."""
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_current_user_id(None)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Not authenticated"
        assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}

    def test_get_current_user_id_invalid_token(self):
        """Test HTTPException when token is invalid."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "invalid_token"

        with patch("app.utils.auth.verify_token", return_value=None):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_user_id(mock_credentials)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == INVALID_AUTH_CREDENTIALS_MESSAGE
            assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}

    def test_get_current_user_id_empty_token(self):
        """Test HTTPException when token is empty."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = ""

        with patch("app.utils.auth.verify_token", return_value=None):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_user_id(mock_credentials)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == INVALID_AUTH_CREDENTIALS_MESSAGE


class TestGetCurrentAdminUser:
    """Test cases for get_current_admin_user function."""

    def test_get_current_admin_user_success(self):
        """Test successful admin account retrieval."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "valid_token"
        mock_db = Mock()
        mock_account = Mock()
        mock_account.role.name = "admin"
        expected_account_id = "admin123"

        with (
            patch("app.utils.auth.verify_token", return_value=expected_account_id),
            patch("app.utils.auth.AccountService") as mock_account_service_class,
            patch("app.utils.auth.uuid.UUID") as mock_uuid,
        ):
            mock_uuid.return_value = expected_account_id
            mock_account_service = Mock()
            mock_account_service.get_account_by_id.return_value = mock_account
            mock_account_service_class.return_value = mock_account_service

            # Act
            result = get_current_admin_user(mock_credentials, mock_db)

            # Assert
            assert result == mock_account
            mock_account_service_class.assert_called_once_with(mock_db)
            mock_account_service.get_account_by_id.assert_called_once()

    def test_get_current_admin_user_no_credentials(self):
        """Test HTTPException when no credentials provided."""
        # Arrange
        mock_db = Mock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_current_admin_user(None, mock_db)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Not authenticated"
        assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}

    def test_get_current_admin_user_invalid_token(self):
        """Test HTTPException when token is invalid."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "invalid_token"
        mock_db = Mock()

        with patch("app.utils.auth.verify_token", return_value=None):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_admin_user(mock_credentials, mock_db)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == INVALID_AUTH_CREDENTIALS_MESSAGE

    def test_get_current_admin_user_not_found(self):
        """Test HTTPException when account is not found."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "valid_token"
        mock_db = Mock()
        expected_account_id = "account123"

        with (
            patch("app.utils.auth.verify_token", return_value=expected_account_id),
            patch("app.utils.auth.AccountService") as mock_account_service_class,
            patch("app.utils.auth.uuid.UUID") as mock_uuid,
        ):
            mock_uuid.return_value = expected_account_id
            mock_account_service = Mock()
            mock_account_service.get_account_by_id.return_value = None
            mock_account_service_class.return_value = mock_account_service

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_admin_user(mock_credentials, mock_db)

            assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
            assert exc_info.value.detail == "Account not found"

    def test_get_current_admin_user_not_admin(self):
        """Test HTTPException when account is not admin."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "valid_token"
        mock_db = Mock()
        mock_account = Mock()
        mock_account.role.name = "user"  # Not admin
        expected_account_id = "account123"

        with (
            patch("app.utils.auth.verify_token", return_value=expected_account_id),
            patch("app.utils.auth.AccountService") as mock_account_service_class,
            patch("app.utils.auth.uuid.UUID") as mock_uuid,
        ):
            mock_uuid.return_value = expected_account_id
            mock_account_service = Mock()
            mock_account_service.get_account_by_id.return_value = mock_account
            mock_account_service_class.return_value = mock_account_service

            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_admin_user(mock_credentials, mock_db)

            assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
            assert exc_info.value.detail == "Admin access required"

    def test_get_current_admin_user_none_role(self):
        """Test HTTPException when account role is None."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = "valid_token"
        mock_db = Mock()
        mock_account = Mock()
        mock_account.role = None
        expected_account_id = "account123"

        with (
            patch("app.utils.auth.verify_token", return_value=expected_account_id),
            patch("app.utils.auth.AccountService") as mock_account_service_class,
            patch("app.utils.auth.uuid.UUID") as mock_uuid,
        ):
            mock_uuid.return_value = expected_account_id
            mock_account_service = Mock()
            mock_account_service.get_account_by_id.return_value = mock_account
            mock_account_service_class.return_value = mock_account_service

            # Act & Assert
            with pytest.raises(AttributeError):
                get_current_admin_user(mock_credentials, mock_db)

    def test_get_current_admin_user_empty_token(self):
        """Test HTTPException when token is empty."""
        # Arrange
        mock_credentials = Mock(spec=HTTPAuthorizationCredentials)
        mock_credentials.credentials = ""
        mock_db = Mock()

        with patch("app.utils.auth.verify_token", return_value=None):
            # Act & Assert
            with pytest.raises(HTTPException) as exc_info:
                get_current_admin_user(mock_credentials, mock_db)

            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
            assert exc_info.value.detail == INVALID_AUTH_CREDENTIALS_MESSAGE


class TestConstants:
    """Test cases for module constants."""

    def test_invalid_auth_credentials_message(self):
        """Test that the error message constant is properly defined."""
        assert INVALID_AUTH_CREDENTIALS_MESSAGE == "Invalid authentication credentials"
