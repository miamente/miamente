"""
Unit tests for unified accounts endpoints.
"""

import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.accounts import (
    unified_login,
    register_user,
    register_professional,
    get_current_account,
    ensure_default_roles,
)
from app.schemas.auth import UnifiedLogin
from app.models.account import Account
from app.models.role import Role

pytestmark = pytest.mark.unit


class TestAccountsEndpointsUnit:
    """Unit tests for unified accounts endpoints."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def mock_account_service(self):
        """Mock account service."""
        from app.services.account_service import AccountService

        return MagicMock(spec=AccountService)

    @pytest.fixture
    def mock_role_service(self):
        """Mock role service."""
        from app.services.role_service import RoleService

        return MagicMock(spec=RoleService)

    @pytest.fixture
    def sample_role(self):
        """Sample role object."""
        role = MagicMock(spec=Role)
        role.id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        role.name = "user"
        role.description = "Usuario regular"
        return role

    @pytest.fixture
    def sample_account(self, sample_role):
        """Sample account object."""
        account = MagicMock(spec=Account)
        account.id = uuid.UUID("12345678-1234-5678-9012-123456789012")
        account.role_id = sample_role.id
        account.email = "test@example.com"
        account.full_name = "Test User"
        account.phone = "+573001234567"
        account.phone_country_code = "+57"
        account.phone_number = "3001234567"
        account.is_active = True
        account.is_verified = False
        account.profile_picture = None
        account.last_login = datetime.now()
        account.created_at = datetime.now()
        account.updated_at = None
        account.role = sample_role
        return account

    @pytest.fixture
    def sample_user_profile(self, sample_account):
        """Sample user profile."""
        profile = MagicMock()
        profile.account_id = sample_account.id
        profile.date_of_birth = None
        profile.emergency_contact_name = None
        profile.emergency_phone_country_code = None
        profile.emergency_phone_number = None
        return profile

    @pytest.fixture
    def sample_professional_profile(self, sample_account):
        """Sample professional profile."""
        profile = MagicMock()
        profile.account_id = sample_account.id
        profile.license_number = "PSI-12345"
        profile.years_experience = 5
        profile.rate_cents = 150000
        profile.currency = "COP"
        profile.short_description = "Psicólogo clínico"
        profile.languages = ["Spanish", "English"]
        profile.timezone = "America/Bogota"
        return profile

    @pytest.fixture
    def sample_account_data(self, sample_account, sample_user_profile):
        """Sample account data with profile."""
        return {"account": sample_account, "role": sample_account.role.name, "profile": sample_user_profile}

    # Tests for /login endpoint

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.create_account_response_with_tokens")
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_unified_login_success(
        self, mock_account_service_class, mock_create_response, mock_db_session, sample_account
    ):
        """Test successful unified login."""
        # Arrange
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.authenticate.return_value = sample_account

        expected_response = MagicMock()
        mock_create_response.return_value = expected_response

        login_data = UnifiedLogin(email="test@example.com", password="password123")

        # Act
        result = await unified_login(login_data, mock_db_session)

        # Assert
        mock_account_service.authenticate.assert_called_once_with("test@example.com", "password123")
        mock_create_response.assert_called_once_with(mock_db_session, sample_account)
        assert result == expected_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_unified_login_invalid_credentials(self, mock_account_service_class, mock_db_session):
        """Test unified login with invalid credentials."""
        # Arrange
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.authenticate.return_value = None

        login_data = UnifiedLogin(email="test@example.com", password="wrongpassword")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await unified_login(login_data, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Incorrect email or password"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_unified_login_inactive_account(self, mock_account_service_class, mock_db_session, sample_account):
        """Test unified login with inactive account."""
        # Arrange
        sample_account.is_active = False
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.authenticate.return_value = sample_account

        login_data = UnifiedLogin(email="test@example.com", password="password123")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await unified_login(login_data, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Account is not active"

    # Tests for /register/user endpoint

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.create_account_response_with_tokens")
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_register_user_success(
        self, mock_account_service_class, mock_create_response, mock_db_session, sample_account
    ):
        """Test successful user registration."""
        # Arrange
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.create_user_account.return_value = sample_account

        expected_response = MagicMock()
        mock_create_response.return_value = expected_response

        # Act
        result = await register_user(
            email="newuser@example.com",
            password="password123",
            full_name="New User",
            phone="+573001234567",
            db=mock_db_session,
        )

        # Assert
        mock_account_service.create_user_account.assert_called_once_with(
            email="newuser@example.com", password="password123", full_name="New User", phone="+573001234567"
        )
        mock_create_response.assert_called_once_with(mock_db_session, sample_account)
        assert result == expected_response

    # Tests for /register/professional endpoint

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.create_account_response_with_tokens")
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_register_professional_success(
        self, mock_account_service_class, mock_create_response, mock_db_session, sample_account
    ):
        """Test successful professional registration."""
        # Arrange
        sample_account.role.name = "professional"
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.create_professional_account.return_value = sample_account

        expected_response = MagicMock()
        mock_create_response.return_value = expected_response

        # Act
        result = await register_professional(
            email="pro@example.com",
            password="password123",
            full_name="Dr. Professional",
            rate_cents=150000,
            phone_country_code="+57",
            phone_number="3001234567",
            license_number="PSI-12345",
            years_experience=5,
            short_description="Especialista en...",
            db=mock_db_session,
        )

        # Assert
        mock_account_service.create_professional_account.assert_called_once()
        call_args = mock_account_service.create_professional_account.call_args
        assert call_args.kwargs["email"] == "pro@example.com"
        assert call_args.kwargs["password"] == "password123"
        assert call_args.kwargs["full_name"] == "Dr. Professional"
        assert call_args.kwargs["rate_cents"] == 150000
        assert call_args.kwargs["phone_country_code"] == "+57"
        assert call_args.kwargs["phone_number"] == "3001234567"
        assert call_args.kwargs["profile_data"]["license_number"] == "PSI-12345"
        assert call_args.kwargs["profile_data"]["years_experience"] == 5
        assert call_args.kwargs["profile_data"]["short_description"] == "Especialista en..."

        mock_create_response.assert_called_once_with(mock_db_session, sample_account)
        assert result == expected_response

    # Tests for /me endpoint

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_current_account_success(self, mock_account_service_class, mock_db_session, sample_account_data):
        """Test getting current account information."""
        # Arrange
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.get_account_with_profile.return_value = sample_account_data

        # Act
        result = await get_current_account("account-123", mock_db_session)

        # Assert
        mock_account_service.get_account_with_profile.assert_called_once_with("account-123")
        assert result["role"] == sample_account_data["role"]
        assert result["account"] == sample_account_data["account"]
        assert result["profile"] == sample_account_data["profile"]

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_current_account_not_found(self, mock_account_service_class, mock_db_session):
        """Test getting current account when account doesn't exist."""
        # Arrange
        mock_account_service = mock_account_service_class.return_value
        mock_account_service.get_account_with_profile.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_account("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Account not found"

    # Tests for /ensure-roles endpoint

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.accounts.RoleService")
    async def test_ensure_default_roles(self, mock_role_service_class, mock_db_session):
        """Test ensuring default roles exist."""
        # Arrange
        mock_role_service = mock_role_service_class.return_value

        # Act
        result = await ensure_default_roles(mock_db_session)

        # Assert
        mock_role_service.ensure_default_roles.assert_called_once()
        assert result == {"message": "Default roles ensured"}
