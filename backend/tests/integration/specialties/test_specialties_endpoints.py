"""
Integration tests for specialties endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.specialty import Specialty

# from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate


class TestSpecialtiesEndpoints:
    """Integration tests for specialties endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_specialty(self):
        """Sample specialty for testing."""
        specialty = Mock(spec=Specialty)
        specialty.id = "550e8400-e29b-41d4-a716-446655440000"
        specialty.name = "Cognitive Behavioral Therapy"
        specialty.category = "therapy"
        return specialty

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_get_specialties_success(self, mock_get_db, client, mock_db, sample_specialty):
        """Test getting all specialties successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_specialties.return_value = [sample_specialty]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/specialties/", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Cognitive Behavioral Therapy"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_get_specialties_with_pagination(self, mock_get_db, client, mock_db, sample_specialty):
        """Test getting specialties with pagination."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_specialties.return_value = [sample_specialty]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/specialties/?skip=10&limit=5", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            mock_service.get_specialties.assert_called_once_with(skip=10, limit=5)

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_get_specialties_by_category_success(self, mock_get_db, client, mock_db, sample_specialty):
        """Test getting specialties by category successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_specialties_by_category.return_value = [sample_specialty]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/specialties/category/therapy", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Cognitive Behavioral Therapy"
            mock_service.get_specialties_by_category.assert_called_once_with("therapy")

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_get_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
        """Test getting a specific specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_specialty.return_value = sample_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                "/api/v1/specialties/550e8400-e29b-41d4-a716-446655440000", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440000"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_get_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test getting a specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_specialty.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/specialties/non-existent-id", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Specialty not found"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_create_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
        """Test creating a specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.create_specialty.return_value = sample_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.post(
                "/api/v1/specialties/",
                json={"name": "Family Therapy", "category": "therapy"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_update_specialty_success(self, mock_get_db, client, mock_db, sample_specialty):
        """Test updating a specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_specialty.return_value = sample_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                "/api/v1/specialties/test-specialty-1",
                json={"name": "Updated CBT", "category": "therapy"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_update_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test updating a specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_specialty.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                "/api/v1/specialties/non-existent-id", json={"name": "Updated CBT"}, headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Specialty not found"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_delete_specialty_success(self, mock_get_db, client, mock_db):
        """Test deleting a specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_specialty.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete("/api/v1/specialties/test-specialty-1", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Specialty deleted successfully"

    @patch("app.api.v1.endpoints.specialties.get_db")
    def test_delete_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test deleting a specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the SpecialtyService
        with patch("app.api.v1.endpoints.specialties.SpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_specialty.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete("/api/v1/specialties/non-existent-id", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Specialty not found"
