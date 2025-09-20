"""
Integration tests for therapeutic approaches endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.therapeutic_approach import TherapeuticApproach

# from app.schemas.therapeutic_approach import TherapeuticApproachCreate, TherapeuticApproachUpdate


class TestTherapeuticApproachesEndpoints:
    """Integration tests for therapeutic approaches endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_therapeutic_approach(self):
        """Sample therapeutic approach for testing."""
        approach = Mock(spec=TherapeuticApproach)
        approach.id = "550e8400-e29b-41d4-a716-446655440001"
        approach.name = "Cognitive Behavioral Therapy"
        approach.description = "A type of psychotherapy that helps people change negative thought patterns"
        approach.category = "psychotherapy"
        return approach

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_get_therapeutic_approaches_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
        """Test getting all therapeutic approaches successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_therapeutic_approaches.return_value = [sample_therapeutic_approach]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/therapeutic-approaches/", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Cognitive Behavioral Therapy"
            assert data[0]["id"] == "550e8400-e29b-41d4-a716-446655440001"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_get_therapeutic_approaches_with_pagination(
        self, mock_get_db, client, mock_db, sample_therapeutic_approach
    ):
        """Test getting therapeutic approaches with pagination."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_therapeutic_approaches.return_value = [sample_therapeutic_approach]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/therapeutic-approaches/?skip=10&limit=5", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            mock_service.get_therapeutic_approaches.assert_called_once_with(skip=10, limit=5)

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_get_therapeutic_approaches_by_category_success(
        self, mock_get_db, client, mock_db, sample_therapeutic_approach
    ):
        """Test getting therapeutic approaches by category successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_therapeutic_approaches_by_category.return_value = [sample_therapeutic_approach]
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                "/api/v1/therapeutic-approaches/category/psychotherapy", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Cognitive Behavioral Therapy"
            assert data[0]["category"] == "psychotherapy"
            mock_service.get_therapeutic_approaches_by_category.assert_called_once_with("psychotherapy")

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_get_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
        """Test getting a specific therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_therapeutic_approach.return_value = sample_therapeutic_approach
            mock_service_class.return_value = mock_service

            # Act
            response = client.get(
                "/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440001", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"
            assert data["id"] == "550e8400-e29b-41d4-a716-446655440001"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_get_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test getting a therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.get_therapeutic_approach.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.get("/api/v1/therapeutic-approaches/non-existent-id", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Therapeutic approach not found"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_create_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
        """Test creating a therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.create_therapeutic_approach.return_value = sample_therapeutic_approach
            mock_service_class.return_value = mock_service

            # Act
            response = client.post(
                "/api/v1/therapeutic-approaches/",
                json={
                    "name": "Dialectical Behavior Therapy",
                    "description": "A type of cognitive behavioral therapy",
                    "category": "psychotherapy",
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_update_therapeutic_approach_success(self, mock_get_db, client, mock_db, sample_therapeutic_approach):
        """Test updating a therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_therapeutic_approach.return_value = sample_therapeutic_approach
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                "/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440001",
                json={"name": "Updated CBT", "description": "Updated description"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Cognitive Behavioral Therapy"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_update_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test updating a therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.update_therapeutic_approach.return_value = None
            mock_service_class.return_value = mock_service

            # Act
            response = client.put(
                "/api/v1/therapeutic-approaches/non-existent-id",
                json={"name": "Updated CBT"},
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Therapeutic approach not found"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_delete_therapeutic_approach_success(self, mock_get_db, client, mock_db):
        """Test deleting a therapeutic approach successfully."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_therapeutic_approach.return_value = True
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete(
                "/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440001", headers={"host": "localhost"}
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Therapeutic approach deleted successfully"

    @patch("app.api.v1.endpoints.therapeutic_approaches.get_db")
    def test_delete_therapeutic_approach_not_found(self, mock_get_db, client, mock_db):
        """Test deleting a therapeutic approach that doesn't exist."""
        # Arrange
        mock_get_db.return_value = mock_db

        # Mock the TherapeuticApproachService
        with patch("app.api.v1.endpoints.therapeutic_approaches.TherapeuticApproachService") as mock_service_class:
            mock_service = Mock()
            mock_service.delete_therapeutic_approach.return_value = False
            mock_service_class.return_value = mock_service

            # Act
            response = client.delete("/api/v1/therapeutic-approaches/non-existent-id", headers={"host": "localhost"})

            # Assert
            assert response.status_code == 404
            data = response.json()
            assert data["detail"] == "Therapeutic approach not found"
