"""
Unit tests for AccountService.
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.role import Role
from app.models.user_profile import UserProfile
from app.schemas.account import AccountUpdate
from app.services.account_service import AccountService

pytestmark = pytest.mark.unit


class TestAccountServiceUnit:
    """Unit tests for AccountService."""

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        return MagicMock(spec=Session)

    @pytest.fixture
    def account_service(self, mock_db_session):
        """Create AccountService instance with mocked session."""
        return AccountService(mock_db_session)

    @pytest.fixture
    def sample_role_user(self):
        """Sample user role."""
        role = Role(id=uuid.UUID("11111111-1111-1111-1111-111111111111"), name="user", description="Usuario regular")
        return role

    @pytest.fixture
    def sample_role_professional(self):
        """Sample professional role."""
        role = Role(
            id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
            name="professional",
            description="Profesional de salud mental",
        )
        return role

    @pytest.fixture
    def sample_account(self, sample_role_user):
        """Sample account object."""
        account = Account(
            id=uuid.UUID("12345678-1234-5678-9012-123456789012"),
            role_id=sample_role_user.id,
            email="test@example.com",
            full_name="Test User",
            phone="+573001234567",
            hashed_password="hashed_password_123",
            is_active=True,
            is_verified=False,
        )
        account.role = sample_role_user
        account.user_profile = None
        account.professional_profile = None
        return account

    @pytest.fixture
    def sample_user_profile(self, sample_account):
        """Sample user profile."""
        profile = UserProfile(account_id=sample_account.id, date_of_birth=None)
        return profile

    # Tests for authenticate

    @pytest.mark.asyncio
    @patch("app.services.account_service.verify_password")
    async def test_authenticate_success(self, mock_verify_password, account_service, mock_db_session, sample_account):
        """Test successful authentication."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account
        mock_verify_password.return_value = True

        # Act
        result = account_service.authenticate("test@example.com", "correct_password")

        # Assert
        mock_verify_password.assert_called_once_with("correct_password", "hashed_password_123")
        assert result == sample_account
        assert mock_db_session.commit.called
        assert mock_db_session.refresh.called

    @pytest.mark.asyncio
    @patch("app.services.account_service.verify_password")
    async def test_authenticate_wrong_password(
        self, mock_verify_password, account_service, mock_db_session, sample_account
    ):
        """Test authentication with wrong password."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account
        mock_verify_password.return_value = False

        # Act
        result = account_service.authenticate("test@example.com", "wrong_password")

        # Assert
        assert result is None
        mock_db_session.commit.assert_not_called()

    @pytest.mark.asyncio
    async def test_authenticate_account_not_found(self, account_service, mock_db_session):
        """Test authentication when account doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.authenticate("nonexistent@example.com", "password")

        # Assert
        assert result is None

    # Tests for get_account_by_id

    def test_get_account_by_id_success(self, account_service, mock_db_session, sample_account):
        """Test getting account by ID successfully."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account

        # Act
        result = account_service.get_account_by_id(sample_account.id)

        # Assert
        assert result == sample_account

    def test_get_account_by_id_not_found(self, account_service, mock_db_session):
        """Test getting account by ID when not found."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.get_account_by_id(uuid.uuid4())

        # Assert
        assert result is None

    # Tests for get_account_by_email

    def test_get_account_by_email_success(self, account_service, mock_db_session, sample_account):
        """Test getting account by email successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_account

        # Act
        result = account_service.get_account_by_email("test@example.com")

        # Assert
        assert result == sample_account

    def test_get_account_by_email_not_found(self, account_service, mock_db_session):
        """Test getting account by email when not found."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.get_account_by_email("nonexistent@example.com")

        # Assert
        assert result is None

    # Tests for get_account_with_profile

    def test_get_account_with_profile_user(self, account_service, mock_db_session, sample_account, sample_user_profile):
        """Test getting account with user profile."""
        # Arrange
        sample_account.user_profile = sample_user_profile
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account

        # Act
        result = account_service.get_account_with_profile(sample_account.id)

        # Assert
        assert result is not None
        assert result["account"] == sample_account
        assert result["role"] == "user"
        # Profile is now a dict, not the model
        assert result["profile"] is not None
        assert result["profile"]["account_id"] == str(sample_user_profile.account_id)

    def test_get_account_with_profile_not_found(self, account_service, mock_db_session):
        """Test getting account with profile when account doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.get_account_with_profile(uuid.uuid4())

        # Assert
        assert result is None

    # Tests for create_user_account

    @patch("app.services.account_service.get_password_hash")
    def test_create_user_account_success(self, mock_hash_password, account_service, mock_db_session, sample_role_user):
        """Test creating a user account successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            None,  # get_account_by_email returns None (email doesn't exist)
            sample_role_user,  # get role by name returns user role
        ]
        mock_hash_password.return_value = "hashed_password"

        # Act
        account_service.create_user_account(
            email="newuser@example.com", password="password123", full_name="New User", phone="+573001234567"
        )

        # Assert
        mock_hash_password.assert_called_once_with("password123")
        assert mock_db_session.add.call_count == 2  # account + profile
        assert mock_db_session.commit.called
        assert mock_db_session.flush.called

    @patch("app.services.account_service.get_password_hash")
    def test_create_user_account_email_exists(
        self, mock_hash_password, account_service, mock_db_session, sample_account
    ):
        """Test creating a user account with existing email."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_account

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            account_service.create_user_account(email="test@example.com", password="password123", full_name="New User")

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

    @patch("app.services.account_service.get_password_hash")
    def test_create_user_account_role_not_found(self, mock_hash_password, account_service, mock_db_session):
        """Test creating a user account when user role doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            None,  # get_account_by_email returns None
            None,  # get role returns None (role doesn't exist!)
        ]

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            account_service.create_user_account(
                email="newuser@example.com", password="password123", full_name="New User"
            )

        assert exc_info.value.status_code == 500
        assert "role not found" in exc_info.value.detail.lower()

    # Tests for create_professional_account

    @patch("app.services.account_service.get_password_hash")
    def test_create_professional_account_success(
        self, mock_hash_password, account_service, mock_db_session, sample_role_professional
    ):
        """Test creating a professional account successfully."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.side_effect = [
            None,  # get_account_by_email returns None
            sample_role_professional,  # get role by name returns professional role
        ]
        mock_hash_password.return_value = "hashed_password"

        profile_data = {
            "license_number": "PSI-12345",
            "years_experience": 5,
            "short_description": "Psicólogo clínico",
        }

        # Act
        account_service.create_professional_account(
            email="pro@example.com",
            password="password123",
            full_name="Dr. Professional",
            rate_cents=150000,
            phone_country_code="+57",
            phone_number="3001234567",
            profile_data=profile_data,
        )

        # Assert
        mock_hash_password.assert_called_once_with("password123")
        assert mock_db_session.add.call_count == 2  # account + profile
        assert mock_db_session.commit.called
        assert mock_db_session.flush.called

    @patch("app.services.account_service.get_password_hash")
    def test_create_professional_account_email_exists(
        self, mock_hash_password, account_service, mock_db_session, sample_account
    ):
        """Test creating a professional account with existing email."""
        # Arrange
        mock_db_session.query.return_value.filter.return_value.first.return_value = sample_account

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            account_service.create_professional_account(
                email="test@example.com", password="password123", full_name="Dr. Professional", rate_cents=150000
            )

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

    # Tests for update_account

    def test_update_account_success(self, account_service, mock_db_session, sample_account):
        """Test updating an account successfully."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account
        account_update = AccountUpdate(full_name="Updated Name", phone="+573009999999")

        # Act
        result = account_service.update_account(sample_account.id, account_update)

        # Assert
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
        assert result is not None

    def test_update_account_not_found(self, account_service, mock_db_session):
        """Test updating an account that doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None
        account_update = AccountUpdate(full_name="Updated")

        # Act
        result = account_service.update_account(uuid.uuid4(), account_update)

        # Assert
        assert result is None
        mock_db_session.commit.assert_not_called()

    # Tests for activate/deactivate account

    def test_deactivate_account_success(self, account_service, mock_db_session, sample_account):
        """Test deactivating an account successfully."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account

        # Act
        result = account_service.deactivate_account(sample_account.id)

        # Assert
        assert result is True
        assert sample_account.is_active is False
        mock_db_session.commit.assert_called_once()

    def test_deactivate_account_not_found(self, account_service, mock_db_session):
        """Test deactivating an account that doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.deactivate_account(uuid.uuid4())

        # Assert
        assert result is False
        mock_db_session.commit.assert_not_called()

    def test_activate_account_success(self, account_service, mock_db_session, sample_account):
        """Test activating an account successfully."""
        # Arrange
        sample_account.is_active = False
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = sample_account

        # Act
        result = account_service.activate_account(sample_account.id)

        # Assert
        assert result is True
        assert sample_account.is_active is True
        mock_db_session.commit.assert_called_once()

    def test_activate_account_not_found(self, account_service, mock_db_session):
        """Test activating an account that doesn't exist."""
        # Arrange
        mock_db_session.query.return_value.options.return_value.filter.return_value.first.return_value = None

        # Act
        result = account_service.activate_account(uuid.uuid4())

        # Assert
        assert result is False
        mock_db_session.commit.assert_not_called()
