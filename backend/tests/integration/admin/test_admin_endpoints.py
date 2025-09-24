"""
Integration tests for admin endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from datetime import datetime
from enum import Enum

from app.main import app
from app.models.user import User, UserRole
from app.models.professional import Professional


class TestAdminEndpoints:
    """Integration tests for admin endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_admin_user(self):
        """Sample admin user for testing."""
        user = Mock(spec=User)
        user.id = "550e8400-e29b-41d4-a716-446655440001"
        user.email = "admin@example.com"
        user.full_name = "Admin User"
        user.phone = "+1234567890"
        user.is_active = True
        user.is_verified = True
        user.role = UserRole.ADMIN
        user.profile_picture = None
        user.date_of_birth = datetime(1990, 1, 1)
        user.emergency_contact = "Emergency Contact"
        user.emergency_phone = "+1234567890"
        user.preferences = {}
        user.created_at = datetime(2024, 1, 1)
        user.updated_at = datetime(2024, 1, 1)
        user.last_login = None
        return user

    @pytest.fixture
    def sample_regular_user(self):
        """Sample regular user for testing."""
        user = Mock(spec=User)
        user.id = "550e8400-e29b-41d4-a716-446655440002"
        user.email = "user@example.com"
        user.full_name = "Regular User"
        user.phone = "+1234567890"
        user.is_active = True
        user.is_verified = True
        user.role = UserRole.USER
        user.profile_picture = None
        user.date_of_birth = datetime(1990, 1, 1)
        user.emergency_contact = "Emergency Contact"
        user.emergency_phone = "+1234567890"
        user.preferences = {}
        user.created_at = datetime(2024, 1, 1)
        user.updated_at = datetime(2024, 1, 1)
        user.last_login = None
        return user

    @pytest.fixture
    def sample_professional(self):
        """Sample professional for testing."""
        professional = Mock(spec=Professional)
        professional.id = "550e8400-e29b-41d4-a716-446655440003"
        professional.email = "professional@example.com"
        professional.full_name = "Professional User"
        professional.phone = "+1234567890"
        professional.is_active = True
        professional.is_verified = True
        professional.license_number = "PSI-12345"
        professional.years_experience = 5
        professional.created_at = datetime(2024, 1, 1)
        professional.updated_at = datetime(2024, 1, 1)
        return professional

    # Test get_users endpoint
    @patch("app.api.v1.endpoints.users.get_db")
    def test_get_users_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
        """Test getting all users with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_users.return_value = [sample_regular_user, sample_admin_user]

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.get("/api/v1/users/", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["email"] == "user@example.com"
            assert data[1]["email"] == "admin@example.com"

        # Clean up
        client.app.dependency_overrides.clear()

    @patch("app.api.v1.endpoints.users.get_db")
    def test_get_users_with_role_filter(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
        """Test getting users filtered by role."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_users.return_value = [sample_regular_user]

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.get("/api/v1/users/?role=user", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["email"] == "user@example.com"

        # Clean up
        client.app.dependency_overrides.clear()

    @patch("app.api.v1.endpoints.users.get_db")
    def test_get_users_unauthorized(self, mock_get_db, client, mock_db):
        """Test getting users without admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Act
        response = client.get("/api/v1/users/", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data["detail"]

        # Clean up
        client.app.dependency_overrides.clear()

    # Test get_user_by_id endpoint
    @patch("app.api.v1.endpoints.users.get_db")
    def test_get_user_by_id_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
        """Test getting user by ID with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_user_by_id.return_value = sample_regular_user

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.get("/api/v1/users/550e8400-e29b-41d4-a716-446655440002", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "user@example.com"
            assert data["full_name"] == "Regular User"

        # Clean up
        client.app.dependency_overrides.clear()

    @patch("app.api.v1.endpoints.users.get_db")
    def test_get_user_by_id_not_found(self, mock_get_db, client, mock_db, sample_admin_user):
        """Test getting user by ID when user doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_user_by_id.return_value = None

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.get("/api/v1/users/nonexistent-id", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "User not found"

        # Clean up
        client.app.dependency_overrides.clear()

    # Test toggle_user_status endpoint
    @patch("app.api.v1.endpoints.users.get_db")
    def test_toggle_user_status_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
        """Test toggling user status with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_user_by_id.return_value = sample_regular_user

        # Mock database operations
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.patch(
                "/api/v1/users/550e8400-e29b-41d4-a716-446655440002/status",
                json={"is_active": False},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "user@example.com"
            assert sample_regular_user.is_active is False
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

        # Clean up
        client.app.dependency_overrides.clear()

    # Test delete_user_admin endpoint
    @patch("app.api.v1.endpoints.users.get_db")
    def test_delete_user_admin_success(self, mock_get_db, client, mock_db, sample_admin_user, sample_regular_user):
        """Test deleting user with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock UserService
        mock_user_service = Mock()
        mock_user_service.get_user_by_id.return_value = sample_regular_user

        # Mock database operations
        mock_db.commit = Mock()

        with patch("app.api.v1.endpoints.users.UserService") as mock_service_class:
            mock_service_class.return_value = mock_user_service

            # Act
            response = client.delete(
                "/api/v1/users/550e8400-e29b-41d4-a716-446655440002", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 204
            assert sample_regular_user.is_active is False
            mock_db.commit.assert_called_once()

        # Clean up
        client.app.dependency_overrides.clear()

    # Test professional endpoints
    @patch("app.api.v1.endpoints.professionals.get_db")
    def test_toggle_professional_status_success(
        self, mock_get_db, client, mock_db, sample_admin_user, sample_professional
    ):
        """Test toggling professional status with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock database operations
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Mock the professional query
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        with patch("app.api.v1.endpoints.professionals.parse_professional_data") as mock_parse:
            mock_parse.return_value = {
                "id": str(sample_professional.id),
                "email": sample_professional.email,
                "full_name": sample_professional.full_name,
                "phone": sample_professional.phone,
                "is_active": False,
                "is_verified": sample_professional.is_verified,
                "license_number": sample_professional.license_number,
                "years_experience": sample_professional.years_experience,
                "created_at": sample_professional.created_at,
                "updated_at": sample_professional.updated_at,
                "specialty_ids": [],
                "modality_ids": [],
                "therapeutic_approach_ids": [],
            }

            # Act
            response = client.patch(
                "/api/v1/professionals/550e8400-e29b-41d4-a716-446655440003/status",
                json={"is_active": False},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "professional@example.com"
            assert sample_professional.is_active is False
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once()

        # Clean up
        client.app.dependency_overrides.clear()

    @patch("app.api.v1.endpoints.professionals.get_db")
    def test_delete_professional_admin_success(
        self, mock_get_db, client, mock_db, sample_admin_user, sample_professional
    ):
        """Test deleting professional with admin authentication."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock admin user for authentication
        from app.core.database import get_db
        from app.utils.auth import get_current_admin_user

        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_admin_user] = lambda: sample_admin_user

        # Mock database operations
        mock_db.commit = Mock()

        # Mock the professional query
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_professional
        mock_db.query.return_value = mock_query

        # Act
        response = client.delete(
            "/api/v1/professionals/550e8400-e29b-41d4-a716-446655440003", headers={"host": "localhost"}
        )

        # Assert
        assert response.status_code == 204
        assert sample_professional.is_active is False
        mock_db.commit.assert_called_once()

        # Clean up
        client.app.dependency_overrides.clear()
