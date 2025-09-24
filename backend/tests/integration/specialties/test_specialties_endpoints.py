"""
Integration tests for specialties endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.specialty import Specialty


class TestSpecialtiesEndpoints:
    """Integration tests for specialties endpoints."""

    def test_get_specialties_success(self, client: TestClient, db_session: Session):
        """Test getting all specialties successfully."""
        # Create a specialty in the database
        specialty = Specialty(name="Test Cognitive Behavioral Therapy", category="therapy")
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Test getting all specialties
        response = client.get("/api/v1/specialties/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created specialty is in the response
        specialty_names = [s["name"] for s in data]
        assert "Test Cognitive Behavioral Therapy" in specialty_names

    def test_get_specialties_with_pagination(self, client: TestClient, db_session: Session):
        """Test getting specialties with pagination."""
        # Create a specialty in the database
        specialty = Specialty(name="Test Dialectical Behavior Therapy", category="therapy")
        db_session.add(specialty)
        db_session.commit()

        # Test with pagination
        response = client.get("/api/v1/specialties/?skip=0&limit=1")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 1

    def test_get_specialties_by_category_success(self, client: TestClient, db_session: Session):
        """Test getting specialties by category successfully."""
        # Create specialties in the database
        therapy_specialty = Specialty(name="Test Family Therapy", category="therapy")
        medical_specialty = Specialty(name="Test Psychiatry", category="medical")
        db_session.add(therapy_specialty)
        db_session.add(medical_specialty)
        db_session.commit()

        # Test getting specialties by category
        response = client.get("/api/v1/specialties/category/therapy")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # Verify all returned specialties have the correct category
        for specialty in data:
            assert specialty["category"] == "therapy"

    def test_get_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting a specific specialty successfully."""
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

        # Create a specialty in the database
        specialty = Specialty(name="Test Gestalt Therapy", category="therapy")
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Test getting specific specialty
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get(f"/api/v1/specialties/{specialty.id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Gestalt Therapy"
        assert data["id"] == str(specialty.id)
        assert data["category"] == "therapy"

    def test_get_specialty_not_found(self, client: TestClient, test_data_factory):
        """Test getting a specialty that doesn't exist."""
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

        # Test getting non-existent specialty
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/specialties/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Specialty not found" in data["detail"]

    def test_create_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a specialty successfully."""
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

        # Test creating specialty
        specialty_data = {"name": "Test Art Therapy", "category": "therapy"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/specialties/", json=specialty_data, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Art Therapy"
        assert data["category"] == "therapy"
        assert "id" in data

        # Verify the specialty was created in the database
        created_specialty = db_session.query(Specialty).filter(Specialty.name == "Test Art Therapy").first()
        assert created_specialty is not None
        assert created_specialty.category == "therapy"

    def test_update_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test updating a specialty successfully."""
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

        # Create a specialty in the database
        import uuid
        original_name = f"Test Music Therapy {uuid.uuid4().hex[:8]}"
        updated_name = f"Updated Music Therapy {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=original_name, category="therapy")
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Test updating specialty
        update_data = {"name": updated_name, "category": "creative_therapy"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(f"/api/v1/specialties/{specialty.id}", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_name
        assert data["category"] == "creative_therapy"

        # Verify the specialty was updated in the database
        db_session.commit()  # Ensure any pending changes are committed
        updated_specialty = db_session.query(Specialty).filter(Specialty.id == specialty.id).first()
        assert updated_specialty.name == updated_name
        assert updated_specialty.category == "creative_therapy"

    def test_update_specialty_not_found(self, client: TestClient, test_data_factory):
        """Test updating a specialty that doesn't exist."""
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

        # Test updating non-existent specialty
        update_data = {"name": "Updated Specialty", "category": "therapy"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(
            "/api/v1/specialties/550e8400-e29b-41d4-a716-446655440000", json=update_data, headers=headers
        )

        assert response.status_code == 404
        data = response.json()
        assert "Specialty not found" in data["detail"]

    def test_delete_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test deleting a specialty successfully."""
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

        # Create a specialty in the database
        specialty = Specialty(name="Test Play Therapy", category="therapy")
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Test deleting specialty
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete(f"/api/v1/specialties/{specialty.id}", headers=headers)

        assert response.status_code == 204

        # Verify the specialty was soft deleted in the database
        db_session.commit()  # Ensure any pending changes are committed
        deleted_specialty = db_session.query(Specialty).filter(Specialty.id == specialty.id).first()
        assert deleted_specialty.is_active is False

    def test_delete_specialty_not_found(self, client: TestClient, test_data_factory):
        """Test deleting a specialty that doesn't exist."""
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

        # Test deleting non-existent specialty
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete("/api/v1/specialties/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Specialty not found" in data["detail"]
