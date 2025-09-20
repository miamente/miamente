"""
Integration tests for modalities endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from app.main import app
from app.models.modality import Modality

# from app.schemas.modality import ModalityCreate, ModalityUpdate


class TestModalitiesEndpoints:
    """Integration tests for modalities endpoints."""

    @pytest.fixture
    def client(self):
        """Test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    @pytest.fixture
    def sample_modality(self):
        """Sample modality for testing."""
        modality = Mock(spec=Modality)
        modality.id = "550e8400-e29b-41d4-a716-446655440000"
        modality.name = "Individual Therapy"
        modality.description = "One-on-one therapy sessions"
        modality.category = "therapy"
        modality.is_active = True
        modality.currency = "COP"
        modality.default_price_cents = 50000
        modality.created_at = "2025-01-01T00:00:00Z"
        modality.updated_at = None
        return modality

    def test_get_modalities_success(self, client, mock_db, sample_modality):
        """Test getting all modalities successfully."""
        # Arrange
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = [sample_modality]
        mock_db.query.return_value = mock_query

        # Override the dependency
        from app.core.database import get_db
        client.app.dependency_overrides[get_db] = lambda: mock_db

        # Act
        response = client.get("/api/v1/modalities/", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Individual Therapy"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_get_modality_success(self, client, mock_db, sample_modality):
        """Test getting a specific modality successfully."""
        # Arrange
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_modality
        mock_db.query.return_value = mock_query

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.get("/api/v1/modalities/test-modality-1", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Individual Therapy"
        assert data["id"] == "550e8400-e29b-41d4-a716-446655440000"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_get_modality_not_found(self, client, mock_db):
        """Test getting a modality that doesn't exist."""
        # Arrange
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_db.query.return_value = mock_query

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.get("/api/v1/modalities/non-existent-id", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Modality not found"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_create_modality_success(self, client, mock_db, sample_modality):
        """Test creating a modality successfully."""
        # Arrange
        # Mock the query for checking existing modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing modality
        mock_db.query.return_value = mock_query

        # Mock database operations
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Mock the Modality constructor
        with patch("app.api.v1.endpoints.modalities.Modality") as mock_modality_class:
            mock_modality_class.return_value = sample_modality

            # Act
            response = client.post(
                "/api/v1/modalities/",
                json={
                    "name": "Group Therapy",
                    "description": "Group therapy sessions",
                    "category": "therapy",
                    "is_active": True,
                },
                headers={"host": "localhost"},
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Individual Therapy"
            
            # Clean up
            client.app.dependency_overrides.clear()

    def test_create_modality_duplicate_name(self, client, mock_db, sample_modality):
        """Test creating a modality with duplicate name."""
        # Arrange
        # Mock the query for checking existing modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_modality  # Existing modality found
        mock_db.query.return_value = mock_query

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.post(
            "/api/v1/modalities/",
            json={
                "name": "Individual Therapy",  # Same name as existing
                "description": "Group therapy sessions",
                "category": "therapy",
                "is_active": True,
            },
            headers={"host": "localhost"},
        )

        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Modality with this name already exists"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_update_modality_success(self, client, mock_db, sample_modality):
        """Test updating a modality successfully."""
        # Arrange
        # Mock the query for finding the modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_modality
        mock_db.query.return_value = mock_query

        # Mock database operations
        mock_db.commit = Mock()
        mock_db.refresh = Mock()

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.put(
            "/api/v1/modalities/test-modality-1",
            json={"name": "Updated Individual Therapy", "description": "Updated description"},
            headers={"host": "localhost"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Individual Therapy"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_update_modality_not_found(self, client, mock_db):
        """Test updating a modality that doesn't exist."""
        # Arrange
        # Mock the query for finding the modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # Modality not found
        mock_db.query.return_value = mock_query

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.put(
            "/api/v1/modalities/non-existent-id",
            json={"name": "Updated Individual Therapy"},
            headers={"host": "localhost"},
        )

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Modality not found"
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_delete_modality_success(self, client, mock_db, sample_modality):
        """Test deleting a modality successfully."""
        # Arrange
        # Mock the query for finding the modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = sample_modality
        mock_db.query.return_value = mock_query

        # Mock database operations
        mock_db.commit = Mock()

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.delete("/api/v1/modalities/test-modality-1", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Modality deleted successfully"
        assert sample_modality.is_active is False
        
        # Clean up
        client.app.dependency_overrides.clear()

    def test_delete_modality_not_found(self, client, mock_db):
        """Test deleting a modality that doesn't exist."""
        # Arrange
        # Mock the query for finding the modality
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # Modality not found
        mock_db.query.return_value = mock_query

        # Override the dependencies
        from app.core.database import get_db
        from app.api.v1.endpoints.auth import get_current_user_id
        client.app.dependency_overrides[get_db] = lambda: mock_db
        client.app.dependency_overrides[get_current_user_id] = lambda: "test-user-id"

        # Act
        response = client.delete("/api/v1/modalities/non-existent-id", headers={"host": "localhost"})

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Modality not found"
        
        # Clean up
        client.app.dependency_overrides.clear()
