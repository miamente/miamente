"""
Integration tests for professional modalities endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.professional_modality import ProfessionalModality

# from app.schemas.professional_modality import ProfessionalModalityCreate, ProfessionalModalityUpdate


class TestProfessionalModalitiesEndpoints:
    """Integration tests for professional modalities endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_professional_modality(self):
        """Sample professional modality for testing."""
        modality = Mock(spec=ProfessionalModality)
        modality.id = "550e8400-e29b-41d4-a716-446655440003"
        modality.professional_id = "550e8400-e29b-41d4-a716-446655440004"
        modality.modality_id = "550e8400-e29b-41d4-a716-446655440005"
        modality.name = "Individual Therapy"
        modality.description = "One-on-one therapy sessions"
        modality.price_cents = 50000
        modality.currency = "COP"
        modality.is_default = True
        modality.is_active = True
        return modality

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_get_professional_modalities_success(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test getting all modalities for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modalities.return_value = [sample_professional_modality]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-modalities/professional/{professional_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data[0]["name"] == "Individual Therapy"
            assert data[0]["description"] == "One-on-one therapy sessions"
            assert data[0]["price_cents"] == 50000
            assert data[0]["currency"] == "COP"
            assert data[0]["is_default"] is True
            assert data[0]["is_active"] is True

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_get_default_professional_modality_success(
        self, mock_get_db, client, mock_db, sample_professional_modality
    ):
        """Test getting the default modality for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_default_professional_modality.return_value = sample_professional_modality
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-modalities/professional/{professional_id}/default", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Individual Therapy"
            assert data["description"] == "One-on-one therapy sessions"
            assert data["price_cents"] == 50000
            assert data["currency"] == "COP"
            assert data["is_default"] is True
            assert data["is_active"] is True

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_get_default_professional_modality_not_found(self, mock_get_db, client, mock_db):
        """Test getting the default modality when none exists."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_default_professional_modality.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-modalities/professional/{professional_id}/default", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "No default modality found for this professional"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_get_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test getting a specific professional modality successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modality.return_value = sample_professional_modality
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(f"/api/v1/professional-modalities/{modality_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["name"] == "Individual Therapy"
            assert data["description"] == "One-on-one therapy sessions"
            assert data["price_cents"] == 50000
            assert data["currency"] == "COP"
            assert data["is_default"] is True
            assert data["is_active"] is True

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_get_professional_modality_not_found(self, mock_get_db, client, mock_db):
        """Test getting a professional modality that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "non-existent-id"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modality.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(f"/api/v1/professional-modalities/{modality_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Professional modality not found"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_create_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test creating a professional modality successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.create_professional_modality.return_value = sample_professional_modality
            mock_service_class.return_value = mock_service

            # Act
            response = client.post(
                "/api/v1/professional-modalities/",
                json={
                    "professional_id": "550e8400-e29b-41d4-a716-446655440004",
                    "modality_id": "550e8400-e29b-41d4-a716-446655440005",
                    "name": "Individual Therapy",
                    "description": "One-on-one therapy sessions",
                    "price_cents": 50000,
                    "currency": "COP",
                    "is_default": True,
                    "is_active": True,
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Individual Therapy"
            assert data["description"] == "One-on-one therapy sessions"
            assert data["price_cents"] == 50000
            assert data["currency"] == "COP"
            assert data["is_default"] is True
            assert data["is_active"] is True

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_update_professional_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test updating a professional modality successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_modality.return_value = sample_professional_modality
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-modalities/{modality_id}",
                json={
                    "name": "Updated Individual Therapy",
                    "description": "Updated one-on-one therapy sessions",
                    "price_cents": 55000,
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Individual Therapy"
            assert data["description"] == "One-on-one therapy sessions"
            assert data["price_cents"] == 50000
            assert data["currency"] == "COP"
            assert data["is_default"] is True
            assert data["is_active"] is True

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_update_professional_modality_not_found(self, mock_get_db, client, mock_db):
        """Test updating a professional modality that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "non-existent-id"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_modality.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-modalities/{modality_id}",
                json={"modality_name": "Updated Therapy"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Professional modality not found"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_delete_professional_modality_success(self, mock_get_db, client, mock_db):
        """Test deleting a professional modality successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_modality.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(f"/api/v1/professional-modalities/{modality_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Professional modality deleted successfully"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_delete_professional_modality_not_found(self, mock_get_db, client, mock_db):
        """Test deleting a professional modality that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "non-existent-id"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_modality.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(f"/api/v1/professional-modalities/{modality_id}", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Professional modality not found"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_set_default_modality_success(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test setting a modality as default successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modality.return_value = sample_professional_modality
            mock_service.set_default_modality.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-modalities/{modality_id}/set-default", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Modality set as default successfully"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_set_default_modality_not_found(self, mock_get_db, client, mock_db):
        """Test setting a modality as default when modality doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "non-existent-id"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modality.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-modalities/{modality_id}/set-default", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Professional modality not found"

    @patch("app.api.v1.endpoints.professional_modalities.get_db")
    def test_set_default_modality_failed(self, mock_get_db, client, mock_db, sample_professional_modality):
        """Test setting a modality as default when the operation fails."""
        # Arrange
        mock_get_db.return_value = mock_db
        modality_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalModalityService
        with patch("app.api.v1.endpoints.professional_modalities.ProfessionalModalityService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_modality.return_value = sample_professional_modality
            mock_service.set_default_modality.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-modalities/{modality_id}/set-default", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 400
            data = response.json()
            assert data["detail"] == "Failed to set modality as default"
