"""
Integration tests for professional therapeutic approaches endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach

# from app.schemas.professional_therapeutic_approach import (
#     ProfessionalTherapeuticApproachCreate,
#     ProfessionalTherapeuticApproachUpdate,
# )


class TestProfessionalTherapeuticApproachesEndpoints:
    """Integration tests for professional therapeutic approaches endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_professional_therapeutic_approach(self):
        """Sample professional therapeutic approach for testing."""
        approach = Mock(spec=ProfessionalTherapeuticApproach)
        approach.id = "550e8400-e29b-41d4-a716-446655440003"
        approach.professional_id = "550e8400-e29b-41d4-a716-446655440004"
        approach.therapeutic_approach_id = "550e8400-e29b-41d4-a716-446655440005"
        return approach

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_get_professional_therapeutic_approaches_success(
        self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
    ):
        """Test getting all therapeutic approaches for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_therapeutic_approaches.return_value = [
                sample_professional_therapeutic_approach
            ]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-therapeutic-approaches/professional/{professional_id}",
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data[0]["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data[0]["therapeutic_approach_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_get_professional_therapeutic_approach_success(
        self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
    ):
        """Test getting a specific professional therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_therapeutic_approach.return_value = sample_professional_therapeutic_approach
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["therapeutic_approach_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_get_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test getting a professional therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "non-existent-id"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.get_professional_therapeutic_approach.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional therapeutic approach not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_create_professional_therapeutic_approach_success(
        self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
    ):
        """Test creating a professional therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.create_professional_therapeutic_approach.return_value = (
                sample_professional_therapeutic_approach
            )
            mock_service_class.return_value = mock_service

            # Act
            response = client.post(
                "/api/v1/professional-therapeutic-approaches/",
                json={
                    "professional_id": "550e8400-e29b-41d4-a716-446655440004",
                    "therapeutic_approach_id": "550e8400-e29b-41d4-a716-446655440005",
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["therapeutic_approach_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_update_professional_therapeutic_approach_success(
        self, mock_get_db, client, mock_db, sample_professional_therapeutic_approach
    ):
        """Test updating a professional therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_therapeutic_approach.return_value = (
                sample_professional_therapeutic_approach
            )
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}",
                json={"therapeutic_approach_id": "550e8400-e29b-41d4-a716-446655440006"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440003"
            assert data["professional_id"] == "550e8400-e29b-41d4-a716-446655440004"
            assert data["therapeutic_approach_id"] == "550e8400-e29b-41d4-a716-446655440005"

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_update_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test updating a professional therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "non-existent-id"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.update_professional_therapeutic_approach.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}",
                json={"therapeutic_approach_id": "550e8400-e29b-41d4-a716-446655440006"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional therapeutic approach not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_delete_professional_therapeutic_approach_success(self, mock_get_db, client, mock_db):
        """Test deleting a professional therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "550e8400-e29b-41d4-a716-446655440003"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_therapeutic_approach.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Professional therapeutic approach deleted successfully"

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_delete_professional_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test deleting a professional therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db
        approach_id = "non-existent-id"

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.delete_professional_therapeutic_approach.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(
                f"/api/v1/professional-therapeutic-approaches/{approach_id}", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert "Professional therapeutic approach not found" in data["detail"]

    @patch("app.api.v1.endpoints.professional_therapeutic_approaches.get_db")
    def test_update_professional_therapeutic_approaches_success(self, mock_get_db, client, mock_db):
        """Test updating therapeutic approaches for a professional successfully."""
        # Arrange
        mock_get_db.return_value = mock_db
        professional_id = "550e8400-e29b-41d4-a716-446655440004"
        approach_ids = ["550e8400-e29b-41d4-a716-446655440005", "550e8400-e29b-41d4-a716-446655440006"]

        # Mock the ProfessionalTherapeuticApproachService
        with patch(
            "app.api.v1.endpoints.professional_therapeutic_approaches.ProfessionalTherapeuticApproachService"
        ) as mock_service_class:
            mock_service = Mock()
            mock_service.add_therapeutic_approaches_to_professional.return_value = approach_ids
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                f"/api/v1/professional-therapeutic-approaches/professional/{professional_id}/approaches",
                json=approach_ids,
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Updated 2 therapeutic approaches for professional"
