"""
Integration tests for modalities endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.modality import Modality


class TestModalitiesEndpoints:
    """Integration tests for modalities endpoints."""

    def test_get_modalities_success(self, client: TestClient, db_session: Session):
        """Test getting all modalities successfully."""
        # Create a modality in the database
        modality = Modality(
            name="Test Individual Therapy",
            description="One-on-one therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=50000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Test getting all modalities
        response = client.get("/api/v1/modalities/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created modality is in the response
        modality_names = [m["name"] for m in data]
        assert "Test Individual Therapy" in modality_names

    def test_get_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting a specific modality successfully."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a modality in the database
        modality = Modality(
            name="Test Group Therapy",
            description="Group therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=30000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Test getting specific modality
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get(f"/api/v1/modalities/{modality.id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Group Therapy"
        assert data["id"] == str(modality.id)

    def test_get_modality_not_found(self, client: TestClient, test_data_factory):
        """Test getting a modality that doesn't exist."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test getting non-existent modality
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/modalities/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Modality not found" in data["detail"]

    def test_create_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a modality successfully."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test creating modality
        import uuid
        unique_name = f"Test Family Therapy {uuid.uuid4().hex[:8]}"
        modality_data = {
            "name": unique_name,
            "description": "Family therapy sessions",
            "category": "therapy",
            "currency": "COP",
            "default_price_cents": 40000,
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/modalities/", json=modality_data, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == unique_name
        assert data["description"] == "Family therapy sessions"
        assert data["category"] == "therapy"
        assert data["currency"] == "COP"
        assert data["default_price_cents"] == 40000
        assert "id" in data

        # Verify the modality was created in the database
        created_modality = db_session.query(Modality).filter(Modality.name == unique_name).first()
        assert created_modality is not None
        assert created_modality.description == "Family therapy sessions"

    def test_create_modality_duplicate_name(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a modality with duplicate name."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a modality in the database first
        import uuid
        duplicate_name = f"Duplicate Therapy {uuid.uuid4().hex[:8]}"
        existing_modality = Modality(
            name=duplicate_name,
            description="Existing therapy",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=50000,
        )
        db_session.add(existing_modality)
        db_session.commit()

        # Test creating modality with duplicate name
        modality_data = {
            "name": duplicate_name,
            "description": "New therapy with same name",
            "category": "therapy",
            "currency": "COP",
            "default_price_cents": 40000,
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/modalities/", json=modality_data, headers=headers)

        assert response.status_code == 400
        data = response.json()
        assert "already exists" in data["detail"].lower()

    def test_update_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test updating a modality successfully."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a modality in the database
        import uuid
        original_name = f"Test Couples Therapy {uuid.uuid4().hex[:8]}"
        updated_name = f"Updated Couples Therapy {uuid.uuid4().hex[:8]}"
        modality = Modality(
            name=original_name,
            description="Couples therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=60000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Test updating modality
        update_data = {
            "name": updated_name,
            "description": "Updated couples therapy sessions",
            "default_price_cents": 70000,
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(f"/api/v1/modalities/{modality.id}", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_name
        assert data["description"] == "Updated couples therapy sessions"
        assert data["default_price_cents"] == 70000

        # Verify the modality was updated in the database
        updated_modality = db_session.query(Modality).filter(Modality.id == modality.id).first()
        assert updated_modality.name == updated_name
        assert updated_modality.description == "Updated couples therapy sessions"
        assert updated_modality.default_price_cents == 70000

    def test_update_modality_not_found(self, client: TestClient, test_data_factory):
        """Test updating a modality that doesn't exist."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test updating non-existent modality
        update_data = {"name": "Updated Therapy", "description": "Updated description"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(
            "/api/v1/modalities/550e8400-e29b-41d4-a716-446655440000", json=update_data, headers=headers
        )

        assert response.status_code == 404
        data = response.json()
        assert "Modality not found" in data["detail"]

    def test_delete_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test deleting a modality successfully."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Create a modality in the database
        import uuid
        unique_name = f"Test Art Therapy {uuid.uuid4().hex[:8]}"
        modality = Modality(
            name=unique_name,
            description="Art therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=45000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Test deleting modality
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete(f"/api/v1/modalities/{modality.id}", headers=headers)

        assert response.status_code == 204

        # Verify the modality was soft deleted in the database
        deleted_modality = db_session.query(Modality).filter(Modality.id == modality.id).first()
        assert deleted_modality.is_active is False

    def test_delete_modality_not_found(self, client: TestClient, test_data_factory):
        """Test deleting a modality that doesn't exist."""
        # Create a user for authentication
        user_data = test_data_factory["user"]("test_user")

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Login as user
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": user_data["email"], "password": user_data["password"]}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test deleting non-existent modality
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete("/api/v1/modalities/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Modality not found" in data["detail"]
