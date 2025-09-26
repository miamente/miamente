"""
Unit tests for authentication endpoints.
"""

import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import (
    register_user,
    register_professional,
    login_user,
    login_professional,
    login_unified,
    simulate_email_verification,
    refresh_token,
    get_current_user_info,
)
from app.schemas.auth import (
    UserLogin,
    UnifiedLogin,
    RefreshToken,
    Token,
)
from app.schemas.professional import ProfessionalLogin, ProfessionalCreate, ProfessionalResponse
from app.schemas.user import UserCreate, UserResponse
from app.models.user import UserRole
from app.services.auth_service import AuthService

pytestmark = pytest.mark.unit


class TestAuthEndpointsUnit:
    """Unit tests for authentication endpoints."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def mock_auth_service(self):
        """Mock auth service."""
        return MagicMock(spec=AuthService)

    @pytest.fixture
    def sample_user_data(self):
        """Sample user creation data."""
        return UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
            phone="+1234567890",
            role=UserRole.USER,
        )

    @pytest.fixture
    def sample_professional_data(self):
        """Sample professional creation data."""
        return ProfessionalCreate(
            email="professional@example.com",
            password="testpassword123",
            full_name="Test Professional",
            phone_country_code="+1",
            phone_number="1234567890",
            license_number="PSI-12345",
            years_experience=5,
            bio="Test professional bio",
        )

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
        user.date_of_birth = "1990-01-01"
        user.preferences = '{"theme": "light"}'
        return user

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
        professional.working_hours = '{"monday": {"start": "09:00", "end": "17:00"}}'
        professional.years_experience = 5
        professional.rate_cents = 50000
        professional.languages = ["Spanish", "English"]
        professional.academic_experience = []
        professional.work_experience = []
        professional.certifications = []
        professional.therapy_approaches_ids = []
        professional.specialty_ids = []
        professional.modalities = []
        return professional

    @pytest.fixture
    def sample_token_response(self):
        """Sample token response."""
        return {"access_token": "access_token_123", "refresh_token": "refresh_token_123", "token_type": "bearer"}

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_register_user_success(self, mock_auth_service_class, mock_db_session, sample_user_data, sample_user):
        """Test successful user registration."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.create_user.return_value = sample_user

        # Act
        result = await register_user(sample_user_data, mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.create_user.assert_called_once_with(sample_user_data)
        assert result == sample_user

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_register_professional_success(
        self, mock_auth_service_class, mock_db_session, sample_professional_data, sample_professional
    ):
        """Test successful professional registration."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.create_professional.return_value = sample_professional

        # Act
        result = await register_professional(sample_professional_data, mock_db_session)

        # Assert
        mock_auth_service_class.assert_called_once_with(mock_db_session)
        mock_auth_service.create_professional.assert_called_once_with(sample_professional_data)
        assert result == sample_professional

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_user_success(
        self, mock_auth_service_class, mock_create_token, mock_db_session, sample_user, sample_token_response
    ):
        """Test successful user login."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_user.return_value = sample_user
        mock_create_token.return_value = sample_token_response

        user_login = UserLogin(email="test@example.com", password="testpassword123")

        # Act
        result = await login_user(user_login, mock_db_session)

        # Assert
        mock_auth_service.authenticate_user.assert_called_once_with("test@example.com", "testpassword123")
        mock_create_token.assert_called_once_with(str(sample_user.id))
        assert result.access_token == "access_token_123"
        assert result.refresh_token == "refresh_token_123"
        assert result.token_type == "bearer"
        # The result.user should be a UserResponse object, not the mock
        assert result.user.email == sample_user.email
        assert result.user.full_name == sample_user.full_name

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_user_invalid_credentials(self, mock_auth_service_class, mock_db_session):
        """Test user login with invalid credentials."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_user.return_value = None

        user_login = UserLogin(email="test@example.com", password="wrongpassword")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await login_user(user_login, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Incorrect email or password"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_user_inactive(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test user login with inactive user."""
        # Arrange
        sample_user.is_active = False
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_user.return_value = sample_user

        user_login = UserLogin(email="test@example.com", password="testpassword123")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await login_user(user_login, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Inactive user"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_professional_success(
        self, mock_auth_service_class, mock_create_token, mock_db_session, sample_professional, sample_token_response
    ):
        """Test successful professional login."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = sample_professional
        mock_create_token.return_value = sample_token_response

        professional_login = ProfessionalLogin(email="professional@example.com", password="testpassword123")

        # Act
        result = await login_professional(professional_login, mock_db_session)

        # Assert
        mock_auth_service.authenticate_professional.assert_called_once_with(
            "professional@example.com", "testpassword123"
        )
        mock_create_token.assert_called_once_with(str(sample_professional.id))
        assert result.access_token == "access_token_123"
        assert result.refresh_token == "refresh_token_123"
        assert result.token_type == "bearer"
        # The result.professional should be a ProfessionalResponse object, not the mock
        assert result.professional.email == sample_professional.email
        assert result.professional.full_name == sample_professional.full_name

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_professional_invalid_credentials(self, mock_auth_service_class, mock_db_session):
        """Test professional login with invalid credentials."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = None

        professional_login = ProfessionalLogin(email="professional@example.com", password="wrongpassword")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await login_professional(professional_login, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Incorrect email or password"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_professional_inactive(self, mock_auth_service_class, mock_db_session, sample_professional):
        """Test professional login with inactive professional."""
        # Arrange
        sample_professional.is_active = False
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = sample_professional

        professional_login = ProfessionalLogin(email="professional@example.com", password="testpassword123")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await login_professional(professional_login, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Inactive professional"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.parse_professional_data")
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_unified_professional_success(
        self,
        mock_auth_service_class,
        mock_create_token,
        mock_parse_professional,
        mock_db_session,
        sample_professional,
        sample_token_response,
    ):
        """Test successful unified login as professional."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = sample_professional
        mock_auth_service.authenticate_user.return_value = None
        mock_create_token.return_value = sample_token_response

        # Create a proper ProfessionalResponse object
        professional_response = ProfessionalResponse(
            id=sample_professional.id,
            email=sample_professional.email,
            full_name=sample_professional.full_name,
            phone_country_code=sample_professional.phone_country_code,
            phone_number=sample_professional.phone_number,
            license_number=sample_professional.license_number,
            years_experience=1,
            rate_cents=1,
            currency=sample_professional.currency,
            bio=sample_professional.bio,
            timezone=sample_professional.timezone,
            is_active=sample_professional.is_active,
            is_verified=sample_professional.is_verified,
            profile_picture=sample_professional.profile_picture,
            created_at=sample_professional.created_at,
            updated_at=sample_professional.updated_at,
        )
        mock_parse_professional.return_value = professional_response

        unified_login = UnifiedLogin(email="professional@example.com", password="testpassword123")

        # Act
        result = await login_unified(unified_login, mock_db_session)

        # Assert
        mock_auth_service.authenticate_professional.assert_called_once_with(
            "professional@example.com", "testpassword123"
        )
        mock_create_token.assert_called_once_with(str(sample_professional.id))
        mock_parse_professional.assert_called_once_with(sample_professional)
        assert result.access_token == "access_token_123"
        assert result.refresh_token == "refresh_token_123"
        assert result.token_type == "bearer"
        assert result.user_type == "professional"
        assert result.professional_data == professional_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.parse_user_data")
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_unified_user_success(
        self,
        mock_auth_service_class,
        mock_create_token,
        mock_parse_user,
        mock_db_session,
        sample_user,
        sample_token_response,
    ):
        """Test successful unified login as user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = None
        mock_auth_service.authenticate_user.return_value = sample_user
        mock_create_token.return_value = sample_token_response

        # Create a proper UserResponse object
        user_response = UserResponse(
            id=sample_user.id,
            email=sample_user.email,
            full_name=sample_user.full_name,
            phone=sample_user.phone,
            emergency_contact=sample_user.emergency_contact,
            emergency_phone=sample_user.emergency_phone,
            is_active=sample_user.is_active,
            is_verified=sample_user.is_verified,
            role=sample_user.role,
            profile_picture=sample_user.profile_picture,
            created_at=sample_user.created_at,
            updated_at=sample_user.updated_at,
        )
        mock_parse_user.return_value = user_response

        unified_login = UnifiedLogin(email="test@example.com", password="testpassword123")

        # Act
        result = await login_unified(unified_login, mock_db_session)

        # Assert
        mock_auth_service.authenticate_professional.assert_called_once_with("test@example.com", "testpassword123")
        mock_auth_service.authenticate_user.assert_called_once_with("test@example.com", "testpassword123")
        mock_create_token.assert_called_once_with(str(sample_user.id))
        mock_parse_user.assert_called_once_with(sample_user)
        assert result.access_token == "access_token_123"
        assert result.refresh_token == "refresh_token_123"
        assert result.token_type == "bearer"
        assert result.user_type == "user"
        assert result.user_data == user_response

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_login_unified_invalid_credentials(self, mock_auth_service_class, mock_db_session):
        """Test unified login with invalid credentials."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.authenticate_professional.return_value = None
        mock_auth_service.authenticate_user.return_value = None

        unified_login = UnifiedLogin(email="test@example.com", password="wrongpassword")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await login_unified(unified_login, mock_db_session)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Incorrect email or password"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_simulate_email_verification_user(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test email verification simulation for user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user
        mock_auth_service.get_professional_by_id.return_value = None

        # Act
        result = await simulate_email_verification("user-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("user-123")
        mock_db_session.commit.assert_called_once()
        assert sample_user.is_verified is True
        assert result["message"] == "User email verification simulated"
        assert result["user_type"] == "user"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_simulate_email_verification_professional(
        self, mock_auth_service_class, mock_db_session, sample_professional
    ):
        """Test email verification simulation for professional."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None
        mock_auth_service.get_professional_by_id.return_value = sample_professional

        # Act
        result = await simulate_email_verification("prof-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("prof-123")
        mock_auth_service.get_professional_by_id.assert_called_once_with("prof-123")
        mock_db_session.commit.assert_called_once()
        assert sample_professional.is_verified is True
        assert result["message"] == "Professional email verification simulated"
        assert result["user_type"] == "professional"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_simulate_email_verification_not_found(self, mock_auth_service_class, mock_db_session):
        """Test email verification simulation for non-existent user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None
        mock_auth_service.get_professional_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await simulate_email_verification("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.create_token_response")
    @patch("app.api.v1.endpoints.auth.verify_token")
    async def test_refresh_token_success(
        self, mock_verify_token, mock_create_token, mock_db_session, sample_token_response
    ):
        """Test successful token refresh."""
        # Arrange
        mock_verify_token.return_value = "user-123"
        mock_create_token.return_value = Token(**sample_token_response)

        refresh_data = RefreshToken(refresh_token="refresh_token_123")

        # Act
        result = await refresh_token(refresh_data, mock_db_session)

        # Assert
        mock_verify_token.assert_called_once_with("refresh_token_123")
        mock_create_token.assert_called_once_with("user-123")
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

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_get_current_user_info_user(self, mock_auth_service_class, mock_db_session, sample_user):
        """Test getting current user info for user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = sample_user
        mock_auth_service.get_professional_by_id.return_value = None

        # Act
        result = await get_current_user_info("user-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("user-123")
        assert result["type"] == "user"
        # Check that the data is properly parsed (contains expected fields)
        assert "id" in result["data"]
        assert "email" in result["data"]
        assert "full_name" in result["data"]
        assert result["data"]["email"] == "test@example.com"
        assert result["data"]["full_name"] == "Test User"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_get_current_user_info_professional(
        self, mock_auth_service_class, mock_db_session, sample_professional
    ):
        """Test getting current user info for professional."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None
        mock_auth_service.get_professional_by_id.return_value = sample_professional

        # Act
        result = await get_current_user_info("prof-123", mock_db_session)

        # Assert
        mock_auth_service.get_user_by_id.assert_called_once_with("prof-123")
        mock_auth_service.get_professional_by_id.assert_called_once_with("prof-123")
        assert result["type"] == "professional"
        # Check that the data is properly parsed (contains expected fields)
        assert "id" in result["data"]
        assert "email" in result["data"]
        assert "full_name" in result["data"]
        assert result["data"]["email"] == "professional@example.com"
        assert result["data"]["full_name"] == "Test Professional"

    @pytest.mark.asyncio
    @patch("app.api.v1.endpoints.auth.AuthService")
    async def test_get_current_user_info_not_found(self, mock_auth_service_class, mock_db_session):
        """Test getting current user info for non-existent user."""
        # Arrange
        mock_auth_service = mock_auth_service_class.return_value
        mock_auth_service.get_user_by_id.return_value = None
        mock_auth_service.get_professional_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_info("nonexistent-123", mock_db_session)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "User not found"
