"""
Extended unit tests for auth service.
"""

import pytest
import uuid
from unittest.mock import Mock, patch
from fastapi import HTTPException, status

from app.services.auth_service import AuthService
from app.models.user import User
from app.models.professional import Professional
from app.schemas.user import UserCreate
from app.schemas.professional import ProfessionalCreate


class TestAuthServiceExtendedUnit:
    """Extended test cases for AuthService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()

    @pytest.fixture
    def auth_service(self, mock_db):
        """Create AuthService instance with mocked database."""
        return AuthService(mock_db)

    @pytest.fixture
    def sample_user_data(self):
        """Sample user creation data."""
        return UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
            phone="+1234567890",
            date_of_birth="1990-01-01",
            emergency_contact="Emergency Contact",
            emergency_phone="+1234567891",
            role="user",
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
            specialty_ids=[str(uuid.uuid4())],
            license_number="LIC123456",
            years_experience=5,
            rate_cents=10000,
            currency="USD",
            bio="Test bio",
            certifications=[
                {"name": "Cert1", "document_url": "http://example.com/cert1.pdf"},
                {"name": "Cert2", "document_url": "http://example.com/cert2.pdf"},
            ],
            languages=["English", "Spanish"],
            therapy_approaches_ids=[str(uuid.uuid4())],
            timezone="UTC",
        )

    def test_authenticate_user_success(self, auth_service, mock_db):
        """Test successful user authentication."""
        email = "test@example.com"
        password = "testpassword"
        hashed_password = "hashed_password"

        mock_user = Mock(spec=User)
        mock_user.hashed_password = hashed_password

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_user
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = True

            result = auth_service.authenticate_user(email, password)

            assert result == mock_user
            mock_db.query.assert_called_once_with(User)
            mock_verify.assert_called_once_with(password, hashed_password)

    def test_authenticate_user_not_found(self, auth_service, mock_db):
        """Test user authentication when user not found."""
        email = "nonexistent@example.com"
        password = "testpassword"

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = auth_service.authenticate_user(email, password)

        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_authenticate_user_wrong_password(self, auth_service, mock_db):
        """Test user authentication with wrong password."""
        email = "test@example.com"
        password = "wrongpassword"
        hashed_password = "hashed_password"

        mock_user = Mock(spec=User)
        mock_user.hashed_password = hashed_password

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_user
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = False

            result = auth_service.authenticate_user(email, password)

            assert result is None
            mock_verify.assert_called_once_with(password, hashed_password)

    def test_authenticate_professional_success(self, auth_service, mock_db):
        """Test successful professional authentication."""
        email = "professional@example.com"
        password = "testpassword"
        hashed_password = "hashed_password"

        mock_professional = Mock(spec=Professional)
        mock_professional.hashed_password = hashed_password

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_professional
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = True

            result = auth_service.authenticate_professional(email, password)

            assert result == mock_professional
            mock_db.query.assert_called_once_with(Professional)
            mock_verify.assert_called_once_with(password, hashed_password)

    def test_authenticate_professional_not_found(self, auth_service, mock_db):
        """Test professional authentication when professional not found."""
        email = "nonexistent@example.com"
        password = "testpassword"

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = auth_service.authenticate_professional(email, password)

        assert result is None
        mock_db.query.assert_called_once_with(Professional)

    def test_authenticate_professional_wrong_password(self, auth_service, mock_db):
        """Test professional authentication with wrong password."""
        email = "professional@example.com"
        password = "wrongpassword"
        hashed_password = "hashed_password"

        mock_professional = Mock(spec=Professional)
        mock_professional.hashed_password = hashed_password

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_professional
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.verify_password") as mock_verify:
            mock_verify.return_value = False

            result = auth_service.authenticate_professional(email, password)

            assert result is None
            mock_verify.assert_called_once_with(password, hashed_password)

    def test_create_user_success(self, auth_service, mock_db, sample_user_data):
        """Test successful user creation."""
        mock_user = Mock(spec=User)
        mock_user.id = uuid.uuid4()

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None  # No existing user
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.get_password_hash") as mock_hash:
            mock_hash.return_value = "hashed_password"

            with patch("app.services.auth_service.User") as mock_user_class:
                mock_user_class.return_value = mock_user

                result = auth_service.create_user(sample_user_data)

                assert result == mock_user
                mock_db.add.assert_called_once_with(mock_user)
                mock_db.commit.assert_called_once()
                mock_db.refresh.assert_called_once_with(mock_user)
                mock_hash.assert_called_once_with(sample_user_data.password)

    def test_create_user_duplicate_email(self, auth_service, mock_db, sample_user_data):
        """Test user creation with duplicate email."""
        existing_user = Mock(spec=User)

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = existing_user
        mock_db.query.return_value = mock_query

        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_user(sample_user_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Email already registered"

    def test_create_professional_success(self, auth_service, mock_db, sample_professional_data):
        """Test successful professional creation."""
        mock_professional = Mock(spec=Professional)
        mock_professional.id = uuid.uuid4()

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None  # No existing professional
        mock_db.query.return_value = mock_query

        with patch("app.services.auth_service.get_password_hash") as mock_hash:
            mock_hash.return_value = "hashed_password"

            with patch("app.services.auth_service.Professional") as mock_professional_class:
                mock_professional_class.return_value = mock_professional

                result = auth_service.create_professional(sample_professional_data)

                assert result == mock_professional
                # add is called for professional + each specialty
                assert mock_db.add.call_count >= 1
                mock_db.commit.assert_called()
                mock_db.refresh.assert_called_once_with(mock_professional)
                mock_hash.assert_called_once_with(sample_professional_data.password)

    def test_create_professional_duplicate_email(self, auth_service, mock_db, sample_professional_data):
        """Test professional creation with duplicate email."""
        existing_professional = Mock(spec=Professional)

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = existing_professional
        mock_db.query.return_value = mock_query

        with pytest.raises(HTTPException) as exc_info:
            auth_service.create_professional(sample_professional_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert exc_info.value.detail == "Email already registered"

    def test_get_user_by_id_success(self, auth_service, mock_db):
        """Test getting user by valid ID."""
        user_id = str(uuid.uuid4())
        mock_user = Mock(spec=User)

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_user
        mock_db.query.return_value = mock_query

        result = auth_service.get_user_by_id(user_id)

        assert result == mock_user
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_id_not_found(self, auth_service, mock_db):
        """Test getting user by ID when user not found."""
        user_id = str(uuid.uuid4())

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = auth_service.get_user_by_id(user_id)

        assert result is None

    def test_get_user_by_id_invalid_uuid(self, auth_service, mock_db):
        """Test getting user by invalid UUID."""
        invalid_id = "invalid-uuid"

        result = auth_service.get_user_by_id(invalid_id)

        assert result is None
        mock_db.query.assert_not_called()

    def test_get_professional_by_id_success(self, auth_service, mock_db):
        """Test getting professional by valid ID."""
        professional_id = str(uuid.uuid4())
        mock_professional = Mock(spec=Professional)

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = mock_professional
        mock_db.query.return_value = mock_query

        result = auth_service.get_professional_by_id(professional_id)

        assert result == mock_professional
        mock_db.query.assert_called_once_with(Professional)

    def test_get_professional_by_id_not_found(self, auth_service, mock_db):
        """Test getting professional by ID when professional not found."""
        professional_id = str(uuid.uuid4())

        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query

        result = auth_service.get_professional_by_id(professional_id)

        assert result is None

    def test_get_professional_by_id_invalid_uuid(self, auth_service, mock_db):
        """Test getting professional by invalid UUID."""
        invalid_id = "invalid-uuid"

        result = auth_service.get_professional_by_id(invalid_id)

        assert result is None
        mock_db.query.assert_not_called()

    def test_get_current_user_success(self, auth_service, mock_db):
        """Test getting current user with valid token."""
        token = "valid-token"
        user_id = str(uuid.uuid4())
        mock_user = Mock(spec=User)

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = user_id

            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = mock_user
            mock_db.query.return_value = mock_query

            result = auth_service.get_current_user(token)

            assert result == mock_user
            mock_verify.assert_called_once_with(token)

    def test_get_current_user_invalid_token(self, auth_service, mock_db):
        """Test getting current user with invalid token."""
        token = "invalid-token"

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = None

            result = auth_service.get_current_user(token)

            assert result is None
            mock_verify.assert_called_once_with(token)
            mock_db.query.assert_not_called()

    def test_get_current_user_not_found(self, auth_service, mock_db):
        """Test getting current user when user not found."""
        token = "valid-token"
        user_id = str(uuid.uuid4())

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = user_id

            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query

            result = auth_service.get_current_user(token)

            assert result is None

    def test_get_current_professional_success(self, auth_service, mock_db):
        """Test getting current professional with valid token."""
        token = "valid-token"
        professional_id = str(uuid.uuid4())
        mock_professional = Mock(spec=Professional)

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = professional_id

            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = mock_professional
            mock_db.query.return_value = mock_query

            result = auth_service.get_current_professional(token)

            assert result == mock_professional
            mock_verify.assert_called_once_with(token)

    def test_get_current_professional_invalid_token(self, auth_service, mock_db):
        """Test getting current professional with invalid token."""
        token = "invalid-token"

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = None

            result = auth_service.get_current_professional(token)

            assert result is None
            mock_verify.assert_called_once_with(token)
            mock_db.query.assert_not_called()

    def test_get_current_professional_not_found(self, auth_service, mock_db):
        """Test getting current professional when professional not found."""
        token = "valid-token"
        professional_id = str(uuid.uuid4())

        with patch("app.services.auth_service.verify_token") as mock_verify:
            mock_verify.return_value = professional_id

            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query

            result = auth_service.get_current_professional(token)

            assert result is None

    def test_auth_service_initialization(self, mock_db):
        """Test AuthService initialization."""
        auth_service = AuthService(mock_db)
        assert auth_service.db == mock_db
