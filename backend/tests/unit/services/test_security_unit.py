"""
Unit tests for security module.
"""

from datetime import timedelta
from unittest.mock import patch
import jwt

from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_password,
    get_password_hash,
    create_token_response,
)


class TestSecurityUnit:
    """Test security utilities."""

    def test_create_access_token_with_default_expiry(self):
        """Test creating access token with default expiry."""
        user_id = "test-user-123"

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"
            mock_settings.return_value.ACCESS_TOKEN_EXPIRE_MINUTES = 30

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-token"

                result = create_access_token(user_id)

                assert result == "mock-token"
                mock_encode.assert_called_once()

                # Verify the payload structure
                call_args = mock_encode.call_args
                payload = call_args[0][0]
                assert payload["sub"] == user_id
                assert "exp" in payload

    def test_create_access_token_with_custom_expiry(self):
        """Test creating access token with custom expiry."""
        user_id = "test-user-123"
        custom_expiry = timedelta(hours=2)

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-token"

                result = create_access_token(user_id, custom_expiry)

                assert result == "mock-token"
                mock_encode.assert_called_once()

    def test_create_refresh_token_with_default_expiry(self):
        """Test creating refresh token with default expiry."""
        user_id = "test-user-123"

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"
            mock_settings.return_value.REFRESH_TOKEN_EXPIRE_MINUTES = 60

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-refresh-token"

                result = create_refresh_token(user_id)

                assert result == "mock-refresh-token"
                mock_encode.assert_called_once()

                # Verify the payload structure includes refresh type
                call_args = mock_encode.call_args
                payload = call_args[0][0]
                assert payload["sub"] == user_id
                assert payload["type"] == "refresh"
                assert "exp" in payload

    def test_create_refresh_token_with_custom_expiry(self):
        """Test creating refresh token with custom expiry."""
        user_id = "test-user-123"
        custom_expiry = timedelta(days=7)

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-refresh-token"

                result = create_refresh_token(user_id, custom_expiry)

                assert result == "mock-refresh-token"
                mock_encode.assert_called_once()

    def test_verify_token_valid(self):
        """Test verifying a valid token."""
        user_id = "test-user-123"
        token = "valid-token"

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"

            with patch("app.core.security.jwt.decode") as mock_decode:
                mock_decode.return_value = {"sub": user_id}

                result = verify_token(token)

                assert result == user_id
                mock_decode.assert_called_once_with(token, "test-secret", algorithms=["HS256"])

    def test_verify_token_invalid(self):
        """Test verifying an invalid token."""
        token = "invalid-token"

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"

            with patch("app.core.security.jwt.decode") as mock_decode:
                mock_decode.side_effect = jwt.InvalidTokenError("Invalid token")

                result = verify_token(token)

                assert result is None

    def test_verify_token_missing_subject(self):
        """Test verifying a token without subject."""
        token = "token-without-sub"

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"

            with patch("app.core.security.jwt.decode") as mock_decode:
                mock_decode.return_value = {"exp": 1234567890}  # No 'sub' field

                result = verify_token(token)

                assert result is None

    def test_verify_password_valid(self):
        """Test verifying a valid password."""
        plain_password = "test-password"
        hashed_password = "hashed-password"

        with patch("app.core.security.ph") as mock_ph:
            mock_ph.verify.return_value = True

            result = verify_password(plain_password, hashed_password)

            assert result is True
            mock_ph.verify.assert_called_once_with(hashed_password, plain_password)

    def test_verify_password_invalid(self):
        """Test verifying an invalid password."""
        plain_password = "wrong-password"
        hashed_password = "hashed-password"

        with patch("app.core.security.ph") as mock_ph:
            from argon2.exceptions import VerificationError

            mock_ph.verify.side_effect = VerificationError("Invalid password")

            result = verify_password(plain_password, hashed_password)

            assert result is False

    def test_get_password_hash(self):
        """Test hashing a password."""
        password = "test-password"
        expected_hash = "hashed-password"

        with patch("app.core.security.ph") as mock_ph:
            mock_ph.hash.return_value = expected_hash

            result = get_password_hash(password)

            assert result == expected_hash
            mock_ph.hash.assert_called_once_with(password)

    def test_create_token_response(self):
        """Test creating a complete token response."""
        user_id = "test-user-123"

        with patch("app.core.security.create_access_token") as mock_access:
            with patch("app.core.security.create_refresh_token") as mock_refresh:
                mock_access.return_value = "access-token"
                mock_refresh.return_value = "refresh-token"

                result = create_token_response(user_id)

                expected = {
                    "access_token": "access-token",
                    "refresh_token": "refresh-token",
                    "token_type": "bearer",
                }

                assert result == expected
                mock_access.assert_called_once_with(subject=user_id)
                mock_refresh.assert_called_once_with(subject=user_id)

    def test_create_access_token_with_numeric_subject(self):
        """Test creating access token with numeric subject."""
        user_id = 12345

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"
            mock_settings.return_value.ACCESS_TOKEN_EXPIRE_MINUTES = 30

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-token"

                result = create_access_token(user_id)

                assert result == "mock-token"

                # Verify the payload structure
                call_args = mock_encode.call_args
                payload = call_args[0][0]
                assert payload["sub"] == "12345"  # Should be converted to string

    def test_create_refresh_token_with_numeric_subject(self):
        """Test creating refresh token with numeric subject."""
        user_id = 12345

        with patch("app.core.security.get_settings") as mock_settings:
            mock_settings.return_value.SECRET_KEY = "test-secret"
            mock_settings.return_value.ALGORITHM = "HS256"
            mock_settings.return_value.REFRESH_TOKEN_EXPIRE_MINUTES = 60

            with patch("app.core.security.jwt.encode") as mock_encode:
                mock_encode.return_value = "mock-refresh-token"

                result = create_refresh_token(user_id)

                assert result == "mock-refresh-token"

                # Verify the payload structure
                call_args = mock_encode.call_args
                payload = call_args[0][0]
                assert payload["sub"] == "12345"  # Should be converted to string
                assert payload["type"] == "refresh"
