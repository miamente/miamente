"""
Unit tests for professionals admin endpoint.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.professional import Professional
from app.schemas.professional import ProfessionalWithCountResponse
from app.core.database import get_db
from app.utils.auth import get_current_admin_user


class TestProfessionalsAdminEndpointUnit:
    """Test professionals admin endpoint."""

    @pytest.fixture
    def sample_professional(self):
        """Create a sample professional for testing."""
        professional = Mock(spec=Professional)
        professional.id = "12345678-1234-1234-1234-123456789abc"
        professional.email = "test@example.com"
        professional.full_name = "Test Professional"
        professional.phone_country_code = "+57"
        professional.phone_number = "3001234567"
        professional.is_active = True
        professional.is_verified = True
        professional.profile_picture = None
        professional.created_at = "2024-01-01T00:00:00Z"
        professional.updated_at = "2024-01-01T00:00:00Z"
        professional.license_number = "12345"
        professional.years_experience = 5
        professional.rate_cents = 50000
        professional.currency = "COP"
        professional.bio = "Test bio"
        professional.timezone = "America/Bogota"
        professional.last_login = None
        return professional

    @pytest.fixture
    def mock_db_session(self):
        """Create a mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def mock_admin_user(self):
        """Create a mock admin user."""
        admin_user = Mock()
        admin_user.id = "admin-123"
        admin_user.email = "admin@example.com"
        admin_user.role = "admin"
        return admin_user

    @patch("app.api.v1.endpoints.professionals.ProfessionalService")
    def test_get_all_professionals_admin_success(
        self,
        mock_service_class,
        sample_professional,
        mock_db_session,
        mock_admin_user,
    ):
        """Test successful retrieval of all professionals for admin."""
        # Arrange
        mock_service = mock_service_class.return_value
        mock_service.get_professionals_admin.return_value = [sample_professional]
        mock_service.get_professionals_count.return_value = 1

        # Act
        with TestClient(app) as client:
            # Override the dependencies
            app.dependency_overrides[get_db] = lambda: mock_db_session
            app.dependency_overrides[get_current_admin_user] = lambda: mock_admin_user
            
            response = client.get("/api/v1/professionals/admin/all?page=1&page_size=10", headers={"host": "localhost"})
            
            # Clean up overrides
            app.dependency_overrides.clear()

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert data["total_pages"] == 1
        assert len(data["items"]) == 1
        
        professional_data = data["items"][0]
        assert professional_data["id"] == str(sample_professional.id)
        assert professional_data["email"] == sample_professional.email
        assert professional_data["full_name"] == sample_professional.full_name
        assert professional_data["is_active"] == sample_professional.is_active

    @patch("app.api.v1.endpoints.professionals.get_current_admin_user")
    @patch("app.api.v1.endpoints.professionals.get_db")
    @patch("app.api.v1.endpoints.professionals.ProfessionalService")
    def test_get_all_professionals_admin_with_search(
        self,
        mock_service_class,
        mock_get_db,
        mock_get_admin_user,
        sample_professional,
        mock_db_session,
        mock_admin_user,
    ):
        """Test retrieval of professionals with search filter."""
        # Arrange
        mock_get_db.return_value = mock_db_session
        mock_get_admin_user.return_value = mock_admin_user
        
        mock_service = mock_service_class.return_value
        mock_service.get_professionals_admin.return_value = [sample_professional]
        mock_service.get_professionals_count.return_value = 1

        # Act
        with TestClient(app) as client:
            # Override dependencies for this test
            app.dependency_overrides[get_db] = lambda: mock_db_session
            app.dependency_overrides[get_current_admin_user] = lambda: mock_admin_user
            
            response = client.get("/api/v1/professionals/admin/all?page=1&page_size=10&search=test", headers={"host": "localhost"})
            
            # Clean up overrides
            app.dependency_overrides.clear()

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        
        # Verify service was called with search parameter
        mock_service.get_professionals_admin.assert_called_once_with(skip=0, limit=10, search="test")
        mock_service.get_professionals_count.assert_called_once_with(search="test")

    @patch("app.api.v1.endpoints.professionals.get_current_admin_user")
    @patch("app.api.v1.endpoints.professionals.get_db")
    @patch("app.api.v1.endpoints.professionals.ProfessionalService")
    def test_get_all_professionals_admin_pagination(
        self,
        mock_service_class,
        mock_get_db,
        mock_get_admin_user,
        sample_professional,
        mock_db_session,
        mock_admin_user,
    ):
        """Test pagination parameters."""
        # Arrange
        mock_get_db.return_value = mock_db_session
        mock_get_admin_user.return_value = mock_admin_user
        
        mock_service = mock_service_class.return_value
        mock_service.get_professionals_admin.return_value = [sample_professional]
        mock_service.get_professionals_count.return_value = 25

        # Act
        with TestClient(app) as client:
            # Override dependencies for this test
            app.dependency_overrides[get_db] = lambda: mock_db_session
            app.dependency_overrides[get_current_admin_user] = lambda: mock_admin_user
            
            response = client.get("/api/v1/professionals/admin/all?page=2&page_size=10", headers={"host": "localhost"})
            
            # Clean up overrides
            app.dependency_overrides.clear()

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 25
        assert data["page"] == 2
        assert data["page_size"] == 10
        assert data["total_pages"] == 3  # 25 items, 10 per page = 3 pages
        
        # Verify service was called with correct skip value (page 2, size 10 = skip 10)
        mock_service.get_professionals_admin.assert_called_once_with(skip=10, limit=10, search=None)

    @patch("app.api.v1.endpoints.professionals.get_current_admin_user")
    @patch("app.api.v1.endpoints.professionals.get_db")
    @patch("app.api.v1.endpoints.professionals.ProfessionalService")
    def test_get_all_professionals_admin_pagination_and_search(
        self,
        mock_service_class,
        mock_get_db,
        mock_get_admin_user,
        sample_professional,
        mock_db_session,
        mock_admin_user,
    ):
        """Test combined pagination and search parameters."""
        # Arrange
        mock_get_db.return_value = mock_db_session
        mock_get_admin_user.return_value = mock_admin_user

        mock_service = mock_service_class.return_value
        mock_service.get_professionals_admin.return_value = [sample_professional]
        mock_service.get_professionals_count.return_value = 1

        # Act
        with TestClient(app) as client:
            app.dependency_overrides[get_db] = lambda: mock_db_session
            app.dependency_overrides[get_current_admin_user] = lambda: mock_admin_user

            response = client.get(
                "/api/v1/professionals/admin/all?page=2&page_size=10&search=ali",
                headers={"host": "localhost"},
            )

            app.dependency_overrides.clear()

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert data["page_size"] == 10
        assert data["total"] == 1
        assert len(data["items"]) == 1
        mock_service.get_professionals_admin.assert_called_once_with(skip=10, limit=10, search="ali")
        mock_service.get_professionals_count.assert_called_once_with(search="ali")

    @patch("app.api.v1.endpoints.professionals.get_current_admin_user")
    def test_get_all_professionals_admin_unauthorized(
        self,
        mock_get_admin_user,
    ):
        """Test that unauthorized users cannot access admin endpoint."""
        # Arrange
        from fastapi import HTTPException
        mock_get_admin_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")

        # Act
        with TestClient(app) as client:
            response = client.get("/api/v1/professionals/admin/all", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 401
