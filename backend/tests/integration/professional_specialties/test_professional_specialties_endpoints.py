"""
Integration tests for professional specialties endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.professional_specialty import ProfessionalSpecialty

# from app.schemas.professional_specialty import ProfessionalSpecialtyCreate, ProfessionalSpecialtyUpdate


class TestProfessionalSpecialtiesEndpoints:
    """Integration tests for professional specialties endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_professional_specialty(self):
        """Sample professional specialty for testing."""
        specialty = Mock(spec=ProfessionalSpecialty)
        specialty.id = "550e8400-e29b-41d4-a716-446655440003"
        specialty.professional_id = "550e8400-e29b-41d4-a716-446655440004"
        specialty.specialty_id = "550e8400-e29b-41d4-a716-446655440005"
        return specialty

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_get_professional_specialties_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
        """Test getting all specialties for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_specialties.return_value = [sample_professional_specialty]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-specialties/professional/{professional_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data[0]["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data[0]["specialty_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_get_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
        """Test getting a specific professional specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_specialty.return_value = sample_professional_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(f"/api/v1/professional-specialties/{specialty_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["specialty_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_get_professional_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test getting a professional specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "non-existent-id"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_specialty.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(f"/api/v1/professional-specialties/{specialty_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional specialty not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_create_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
        """Test creating a professional specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.create_professional_specialty.return_value = sample_professional_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.post(
                "/api/v1/professional-specialties/",
                json={
                    "professional_id": "550e8400-e29b-41d4-a716-446655440004",
                    "specialty_id": "550e8400-e29b-41d4-a716-446655440005",
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["specialty_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_update_professional_specialty_success(self, mock_get_db, client, mock_db, sample_professional_specialty):
        """Test updating a professional specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_specialty.return_value = sample_professional_specialty
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-specialties/{specialty_id}",
                json={"specialty_id": "550e8400-e29b-41d4-a716-446655440006"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["specialty_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_update_professional_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test updating a professional specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "non-existent-id"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_specialty.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-specialties/{specialty_id}",
                json={"specialty_id": "550e8400-e29b-41d4-a716-446655440006"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional specialty not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_delete_professional_specialty_success(self, mock_get_db, client, mock_db):
        """Test deleting a professional specialty successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_specialty.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(f"/api/v1/professional-specialties/{specialty_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Professional specialty deleted successfully"

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_delete_professional_specialty_not_found(self, mock_get_db, client, mock_db):
        """Test deleting a professional specialty that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        specialty_id = "non-existent-id"

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_specialty.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(f"/api/v1/professional-specialties/{specialty_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional specialty not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_specialties.get_db")
    def test_update_professional_specialties_success(self, mock_get_db, client, mock_db):
        """Test updating specialties for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"
        specialty_ids = ["550e8400-e29b-41d4-a716-446655440005", "550e8400-e29b-41d4-a716-446655440006"]

        # Mock the ProfessionalSpecialtyService
        with patch("app.api.v1.endpoints.professional_specialties.ProfessionalSpecialtyService") as mock_service_class:
            mock_service = Mock()
            mock_service.add_specialties_to_professional.return_value = specialty_ids
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-specialties/professional/{professional_id}/specialties",
                json=specialty_ids,
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Updated 2 specialties for professional"
