"""
Comprehensive unit tests for AuthService.
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.auth_service import AuthService
from app.models.user import User
from app.models.professional import Professional
from app.schemas.user import UserCreate
from app.schemas.professional import ProfessionalCreate


class TestAuthServiceComprehensiveUnit:
    """Comprehensive unit tests for AuthService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def auth_service(self, mock_db):
        """AuthService instance with mocked database."""
        return AuthService(mock_db)

    @pytest.fixture
    def sample_user(self):
        """Sample user for testing."""
        user = Mock(spec=User)
        user.id = "test-user-1"
        user.email = "user@example.com"
        user.full_name = "Test User"
        user.phone = "+1234567890"
        user.hashed_password = "hashed_password"
        user.is_active = True
        user.is_verified = True
        return user

    @pytest.fixture
    def sample_professional(self):
        """Sample professional for testing."""
        professional = Mock(spec=Professional)
        professional.id = "test-professional-1"
        professional.email = "professional@example.com"
        professional.full_name = "Test Professional"
        professional.phone_country_code = "+1"
        professional.phone_number = "234567890"
        professional.hashed_password = "hashed_password"
        professional.is_active = True
        professional.is_verified = True
        return professional

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_user_success(self, mock_verify_password, auth_service, mock_db, sample_user):
        """Test authenticating a user successfully."""
        # Arrange
        email = "user@example.com"
        password = "password123"
        mock_verify_password.return_value = True

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_user(email, password)

        # Assert
        assert result == sample_user
        mock_verify_password.assert_called_once_with(password, sample_user.hashed_password)

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_user_not_found(self, mock_verify_password, auth_service, mock_db):
        """Test authenticating a user that doesn't exist."""
        # Arrange
        email = "nonexistent@example.com"
        password = "password123"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_user(email, password)

        # Assert
        assert result is None
        mock_verify_password.assert_not_called()

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_user_wrong_password(self, mock_verify_password, auth_service, mock_db, sample_user):
        """Test authenticating a user with wrong password."""
        # Arrange
        email = "user@example.com"
        password = "wrongpassword"
        mock_verify_password.return_value = False

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_user(email, password)

        # Assert
        assert result is None
        mock_verify_password.assert_called_once_with(password, sample_user.hashed_password)

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_professional_success(self, mock_verify_password, auth_service, mock_db, sample_professional):
        """Test authenticating a professional successfully."""
        # Arrange
        email = "professional@example.com"
        password = "password123"
        mock_verify_password.return_value = True

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_professional(email, password)

        # Assert
        assert result == sample_professional
        mock_verify_password.assert_called_once_with(password, sample_professional.hashed_password)

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_professional_not_found(self, mock_verify_password, auth_service, mock_db):
        """Test authenticating a professional that doesn't exist."""
        # Arrange
        email = "nonexistent@example.com"
        password = "password123"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_professional(email, password)

        # Assert
        assert result is None
        mock_verify_password.assert_not_called()

    @patch("app.services.auth_service.verify_password")
    def test_authenticate_professional_wrong_password(
        self, mock_verify_password, auth_service, mock_db, sample_professional
    ):
        """Test authenticating a professional with wrong password."""
        # Arrange
        email = "professional@example.com"
        password = "wrongpassword"
        mock_verify_password.return_value = False

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.authenticate_professional(email, password)

        # Assert
        assert result is None
        mock_verify_password.assert_called_once_with(password, sample_professional.hashed_password)

    @patch("app.services.auth_service.get_password_hash")
    def test_create_user_success(self, mock_get_password_hash, auth_service, mock_db):
        """Test creating a user successfully."""
        # Arrange
        user_data = UserCreate(
            email="newuser@example.com",
            full_name="New User",
            password="password123",
            phone="+1234567890",
            date_of_birth="1990-01-01",
            emergency_contact="Emergency Contact",
            emergency_phone="+1234567890",
        )
        mock_get_password_hash.return_value = "hashed_password"

        # Mock the query for checking existing user
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing user
        mock_db.query.return_value = mock_query

        # Mock database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the User constructor
        with patch("app.services.auth_service.User") as mock_user_class:
            mock_user = Mock(spec=User)
            mock_user_class.return_value = mock_user

            # Act
            result = auth_service.create_user(user_data)

            # Assert
            assert result == mock_user
            mock_get_password_hash.assert_called_once_with(user_data.password)
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_create_user_duplicate_email(self, auth_service, mock_db, sample_user):
        """Test creating a user with duplicate email."""
        # Arrange
        user_data = UserCreate(
            email="user@example.com", full_name="New User", password="password123"  # Same email as existing user
        )

        # Mock the query for checking existing user
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user  # Existing user found
        mock_db.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(user_data)

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

    @patch("app.services.auth_service.get_password_hash")
    def test_create_professional_success(self, mock_get_password_hash, auth_service, mock_db):
        """Test creating a professional successfully."""
        # Arrange
        professional_data = ProfessionalCreate(
            email="newprofessional@example.com",
            full_name="New Professional",
            password="password123",
            phone_country_code="+1",
            phone_number="234567890",
            specialty_ids=["specialty-1", "specialty-2"],
            license_number="LIC123",
            years_experience=5,
            rate_cents=50000,
            currency="COP",
            bio="Professional bio",
            certifications=[
                {"name": "CBT", "document_url": "http://example.com/cbt.pdf"},
                {"name": "DBT", "document_url": "http://example.com/dbt.pdf"},
            ],
            languages=["English", "Spanish"],
            therapy_approaches_ids=["approach-1", "approach-2"],
            timezone="America/Bogota",
        )
        mock_get_password_hash.return_value = "hashed_password"

        # Mock the query for checking existing professional
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing professional
        mock_db.query.return_value = mock_query

        # Mock database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the Professional constructor
        with patch("app.services.auth_service.Professional") as mock_professional_class:
            mock_professional = Mock(spec=Professional)
            mock_professional_class.return_value = mock_professional

            # Act
            result = auth_service.create_professional(professional_data)

            # Assert
            assert result == mock_professional
            mock_get_password_hash.assert_called_once_with(professional_data.password)
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

    def test_create_professional_duplicate_email(self, auth_service, mock_db, sample_professional):
        """Test creating a professional with duplicate email."""
        # Arrange
        professional_data = ProfessionalCreate(
            email="professional@example.com",  # Same email as existing professional
            full_name="New Professional",
            password="password123",
        )

        # Mock the query for checking existing professional
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional  # Existing professional found
        mock_db.query.return_value = mock_query

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_professional(professional_data)

        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

    @patch("app.services.auth_service.uuid.UUID")
    def test_get_user_by_id_success(self, mock_uuid, auth_service, mock_db, sample_user):
        """Test getting a user by ID successfully."""
        # Arrange
        user_id = "test-user-1"
        mock_uuid.return_value = "test-user-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_user
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.get_user_by_id(user_id)

        # Assert
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)

    @patch("app.services.auth_service.uuid.UUID")
    def test_get_user_by_id_not_found(self, mock_uuid, auth_service, mock_db):
        """Test getting a user by ID that doesn't exist."""
        # Arrange
        user_id = "test-user-1"
        mock_uuid.return_value = "test-user-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.get_user_by_id(user_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_id_invalid_uuid(self, auth_service, mock_db):
        """Test getting a user by invalid UUID."""
        # Arrange
        user_id = "invalid-uuid"

        # Act
        result = auth_service.get_user_by_id(user_id)

        # Assert
        assert result is None
        mock_db.query.assert_not_called()

    @patch("app.services.auth_service.uuid.UUID")
    def test_get_professional_by_id_success(self, mock_uuid, auth_service, mock_db, sample_professional):
        """Test getting a professional by ID successfully."""
        # Arrange
        professional_id = "test-professional-1"
        mock_uuid.return_value = "test-professional-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.get_professional_by_id(professional_id)

        # Assert
        assert result == sample_professional
        mock_db.query.assert_called_once_with(Professional)

    @patch("app.services.auth_service.uuid.UUID")
    def test_get_professional_by_id_not_found(self, mock_uuid, auth_service, mock_db):
        """Test getting a professional by ID that doesn't exist."""
        # Arrange
        professional_id = "test-professional-1"
        mock_uuid.return_value = "test-professional-1"

        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Act
        result = auth_service.get_professional_by_id(professional_id)

        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_id_invalid_uuid(self, auth_service, mock_db):
        """Test getting a professional by invalid UUID."""
        # Arrange
        professional_id = "invalid-uuid"

        # Act
        result = auth_service.get_professional_by_id(professional_id)

        # Assert
        assert result is None
        mock_db.query.assert_not_called()

    @patch("app.services.auth_service.verify_token")
    def test_get_current_user_success(self, mock_verify_token, auth_service, mock_db, sample_user):
        """Test getting current user from token successfully."""
        # Arrange
        token = "valid-token"
        user_id = "test-user-1"
        mock_verify_token.return_value = user_id

        # Mock get_user_by_id
        auth_service.get_user_by_id = Mock(return_value=sample_user)

        # Act
        result = auth_service.get_current_user(token)

        # Assert
        assert result == sample_user
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_user_by_id.assert_called_once_with(user_id)

    @patch("app.services.auth_service.verify_token")
    def test_get_current_user_invalid_token(self, mock_verify_token, auth_service, mock_db):
        """Test getting current user with invalid token."""
        # Arrange
        token = "invalid-token"
        mock_verify_token.return_value = None

        # Mock get_user_by_id method
        auth_service.get_user_by_id = Mock()

        # Act
        result = auth_service.get_current_user(token)

        # Assert
        assert result is None
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_user_by_id.assert_not_called()

    @patch("app.services.auth_service.verify_token")
    def test_get_current_user_not_found(self, mock_verify_token, auth_service, mock_db):
        """Test getting current user when user doesn't exist."""
        # Arrange
        token = "valid-token"
        user_id = "test-user-1"
        mock_verify_token.return_value = user_id

        # Mock get_user_by_id to return None
        auth_service.get_user_by_id = Mock(return_value=None)

        # Act
        result = auth_service.get_current_user(token)

        # Assert
        assert result is None
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_user_by_id.assert_called_once_with(user_id)

    @patch("app.services.auth_service.verify_token")
    def test_get_current_professional_success(self, mock_verify_token, auth_service, mock_db, sample_professional):
        """Test getting current professional from token successfully."""
        # Arrange
        token = "valid-token"
        professional_id = "test-professional-1"
        mock_verify_token.return_value = professional_id

        # Mock get_professional_by_id
        auth_service.get_professional_by_id = Mock(return_value=sample_professional)

        # Act
        result = auth_service.get_current_professional(token)

        # Assert
        assert result == sample_professional
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_professional_by_id.assert_called_once_with(professional_id)

    @patch("app.services.auth_service.verify_token")
    def test_get_current_professional_invalid_token(self, mock_verify_token, auth_service, mock_db):
        """Test getting current professional with invalid token."""
        # Arrange
        token = "invalid-token"
        mock_verify_token.return_value = None

        # Mock get_professional_by_id method
        auth_service.get_professional_by_id = Mock()

        # Act
        result = auth_service.get_current_professional(token)

        # Assert
        assert result is None
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_professional_by_id.assert_not_called()

    @patch("app.services.auth_service.verify_token")
    def test_get_current_professional_not_found(self, mock_verify_token, auth_service, mock_db):
        """Test getting current professional when professional doesn't exist."""
        # Arrange
        token = "valid-token"
        professional_id = "test-professional-1"
        mock_verify_token.return_value = professional_id

        # Mock get_professional_by_id to return None
        auth_service.get_professional_by_id = Mock(return_value=None)

        # Act
        result = auth_service.get_current_professional(token)

        # Assert
        assert result is None
        mock_verify_token.assert_called_once_with(token)
        auth_service.get_professional_by_id.assert_called_once_with(professional_id)

    def test_auth_service_initialization(self, mock_db):
        """Test AuthService initialization."""
        # Act
        service = AuthService(mock_db)

        # Assert
        assert service.db == mock_db
