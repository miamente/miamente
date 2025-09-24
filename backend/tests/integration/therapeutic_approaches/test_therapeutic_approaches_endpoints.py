"""
Integration tests for therapeutic approaches endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.therapeutic_approach import TherapeuticApproach


class TestTherapeuticApproachesEndpoints:
    """Integration tests for therapeutic approaches endpoints."""

    def test_get_therapeutic_approaches_success(self, client: TestClient, db_session: Session):
        """Test getting all therapeutic approaches successfully."""
        # Create a therapeutic approach in the database
        approach = TherapeuticApproach(
            name="Test Cognitive Behavioral Therapy",
            description="A type of psychotherapy that helps people change negative thought patterns",
            category="psychotherapy",
        )
        db_session.add(approach)
        db_session.commit()
        db_session.refresh(approach)

        # Test getting all therapeutic approaches
        response = client.get("/api/v1/therapeutic-approaches/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created approach is in the response
        approach_names = [a["name"] for a in data]
        assert "Test Cognitive Behavioral Therapy" in approach_names

    def test_get_therapeutic_approaches_with_pagination(self, client: TestClient, db_session: Session):
        """Test getting therapeutic approaches with pagination."""
        # Create a therapeutic approach in the database
        approach = TherapeuticApproach(
            name="Test Dialectical Behavior Therapy",
            description="A type of therapy that combines cognitive-behavioral techniques with mindfulness",
            category="psychotherapy",
        )
        db_session.add(approach)
        db_session.commit()

        # Test with pagination
        response = client.get("/api/v1/therapeutic-approaches/?skip=0&limit=1")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 1

    def test_get_therapeutic_approaches_by_category_success(self, client: TestClient, db_session: Session):
        """Test getting therapeutic approaches by category successfully."""
        # Create therapeutic approaches in the database
        psychotherapy_approach = TherapeuticApproach(
            name="Test Gestalt Therapy",
            description="A form of psychotherapy that focuses on the present moment",
            category="psychotherapy",
        )
        behavioral_approach = TherapeuticApproach(
            name="Test Applied Behavior Analysis",
            description="A scientific approach to understanding behavior",
            category="behavioral",
        )
        db_session.add(psychotherapy_approach)
        db_session.add(behavioral_approach)
        db_session.commit()

        # Test getting therapeutic approaches by category
        response = client.get("/api/v1/therapeutic-approaches/category/psychotherapy")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # Verify all returned approaches have the correct category
        for approach in data:
            assert approach["category"] == "psychotherapy"

    def test_get_therapeutic_approach_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting a specific therapeutic approach successfully."""
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

        # Create a therapeutic approach in the database
        approach = TherapeuticApproach(
            name="Test EMDR Therapy",
            description="Eye Movement Desensitization and Reprocessing therapy",
            category="trauma_therapy",
        )
        db_session.add(approach)
        db_session.commit()
        db_session.refresh(approach)

        # Test getting specific therapeutic approach
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get(f"/api/v1/therapeutic-approaches/{approach.id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test EMDR Therapy"
        assert data["id"] == str(approach.id)
        assert data["category"] == "trauma_therapy"

    def test_get_therapeutic_approach_not_found(self, client: TestClient, test_data_factory):
        """Test getting a therapeutic approach that doesn't exist."""
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

        # Test getting non-existent therapeutic approach
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Therapeutic approach not found" in data["detail"]

    def test_create_therapeutic_approach_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a therapeutic approach successfully."""
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

        # Test creating therapeutic approach
        approach_data = {
            "name": "Test Art Therapy",
            "description": "A form of psychotherapy that uses art as a medium for expression",
            "category": "creative_therapy",
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/therapeutic-approaches/", json=approach_data, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Art Therapy"
        assert data["description"] == "A form of psychotherapy that uses art as a medium for expression"
        assert data["category"] == "creative_therapy"
        assert "id" in data

        # Verify the therapeutic approach was created in the database
        created_approach = (
            db_session.query(TherapeuticApproach).filter(TherapeuticApproach.name == "Test Art Therapy").first()
        )
        assert created_approach is not None
        assert created_approach.category == "creative_therapy"

    def test_update_therapeutic_approach_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test updating a therapeutic approach successfully."""
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

        # Create a therapeutic approach in the database
        import uuid
        original_name = f"Test Music Therapy {uuid.uuid4().hex[:8]}"
        updated_name = f"Updated Music Therapy {uuid.uuid4().hex[:8]}"
        approach = TherapeuticApproach(
            name=original_name,
            description="A form of therapy that uses music to address physical and emotional needs",
            category="creative_therapy",
        )
        db_session.add(approach)
        db_session.commit()
        db_session.refresh(approach)

        # Test updating therapeutic approach
        update_data = {
            "name": updated_name,
            "description": "Updated description for music therapy",
            "category": "expressive_therapy",
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(f"/api/v1/therapeutic-approaches/{approach.id}", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_name
        assert data["description"] == "Updated description for music therapy"
        assert data["category"] == "expressive_therapy"

        # Verify the therapeutic approach was updated in the database
        db_session.commit()  # Ensure any pending changes are committed
        updated_approach = db_session.query(TherapeuticApproach).filter(TherapeuticApproach.id == approach.id).first()
        assert updated_approach.name == updated_name
        assert updated_approach.description == "Updated description for music therapy"
        assert updated_approach.category == "expressive_therapy"

    def test_update_therapeutic_approach_not_found(self, client: TestClient, test_data_factory):
        """Test updating a therapeutic approach that doesn't exist."""
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

        # Test updating non-existent therapeutic approach
        update_data = {"name": "Updated Approach", "description": "Updated description"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put(
            "/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000", json=update_data, headers=headers
        )

        assert response.status_code == 404
        data = response.json()
        assert "Therapeutic approach not found" in data["detail"]

    def test_delete_therapeutic_approach_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test deleting a therapeutic approach successfully."""
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

        # Create a therapeutic approach in the database
        approach = TherapeuticApproach(
            name="Test Play Therapy",
            description="A form of therapy that uses play to help children express themselves",
            category="child_therapy",
        )
        db_session.add(approach)
        db_session.commit()
        db_session.refresh(approach)

        # Test deleting therapeutic approach
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete(f"/api/v1/therapeutic-approaches/{approach.id}", headers=headers)

        assert response.status_code == 204

        # Verify the therapeutic approach was soft deleted in the database
        db_session.commit()  # Ensure any pending changes are committed
        deleted_approach = db_session.query(TherapeuticApproach).filter(TherapeuticApproach.id == approach.id).first()
        assert deleted_approach.is_active is False

    def test_delete_therapeutic_approach_not_found(self, client: TestClient, test_data_factory):
        """Test deleting a therapeutic approach that doesn't exist."""
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

        # Test deleting non-existent therapeutic approach
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete("/api/v1/therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Therapeutic approach not found" in data["detail"]
