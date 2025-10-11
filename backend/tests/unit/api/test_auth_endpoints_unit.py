"""
Unit tests for authentication endpoints.
"""

from unittest.mock import patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import refresh_token
from app.schemas.auth import RefreshToken, Token

pytestmark = pytest.mark.unit


class TestAuthEndpointsUnit:
    """Unit tests for authentication endpoints."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        from unittest.mock import MagicMock

        return MagicMock(spec=Session)

    @pytest.fixture
    def sample_token_response(self):
        """Sample token response."""
        return {"access_token": "access_token_123", "refresh_token": "refresh_token_123", "token_type": "bearer"}

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.verify_token")
    async def test_refresh_token_success(
        self, mock_verify_token, mock_create_token, mock_db_session, sample_token_response
    ):
        """Test successful token refresh."""
        # Arrange
        mock_verify_token.return_value = "account-123"
        mock_create_token.return_value = Token(**sample_token_response)

        refresh_data = RefreshToken(refresh_token="refresh_token_123")

        # Act
        result = await refresh_token(refresh_data, mock_db_session)

        # Assert
        mock_verify_token.assert_called_once_with("refresh_token_123")
        mock_create_token.assert_called_once_with("account-123")
        assert result.access_token == "access_token_123"
        assert result.refresh_token == "refresh_token_123"
        assert result.token_type == "bearer"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.verify_token")
    async def test_refresh_token_invalid(self, mock_verify_token, mock_db_session):
        """Test token refresh with invalid refresh token."""
        # Arrange
        mock_verify_token.return_value = None

        refresh_data = RefreshToken(refresh_token="invalid_token")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await refresh_token(refresh_data, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Invalid refresh token"
