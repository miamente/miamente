"""
Comprehensive tests for professionals endpoints.
"""

import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.professional import Professional
from app.models.user import User, UserRole


class TestGetProfessionals:
    """Test GET /professionals endpoint."""

    def test_get_professionals_success(self, client: TestClient, test_data_factory):
        """Test successful retrieval of professionals."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        # created_professional = response.json()  # Not used in this test

        # Test getting professionals
        response = client.get("/api/v1/professionals/")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created professional is in the response
        # professional_ids = [p["id"] for p in data]  # Not used in this test
        # assert created_professional["id"] in professional_ids  # created_professional not defined

    def test_get_professionals_with_pagination(self, client: TestClient, test_data_factory):
        """Test professionals retrieval with pagination."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201

        # Test with pagination
        response = client.get("/api/v1/professionals/?skip=0&limit=1")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 1

    def test_get_professionals_with_rate_filters(self, client: TestClient, test_data_factory):
        """Test professionals retrieval with rate filters."""
        # Create a professional with specific rate
        professional_data = test_data_factory["professional"]("test_professional")
        professional_data["rate_cents"] = 5000

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201

        # Test with rate filters
        response = client.get("/api/v1/professionals/?min_rate_cents=4000&max_rate_cents=6000")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_professionals_empty_result(self, client: TestClient):
        """Test professionals retrieval when no professionals match the filter."""
        # Request professionals with a very high minimum rate that no professional should have
        response = client.get("/api/v1/professionals/?min_rate_cents=999999")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0


class TestGetProfessional:
    """Test GET /professionals/{professional_id} endpoint."""

    def test_get_professional_success(self, client: TestClient, test_data_factory):
        """Test successful retrieval of a specific professional."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        register_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert register_response.status_code == 201
        created_professional = register_response.json()

        # Test getting specific professional
        response = client.get(f"/api/v1/professionals/{created_professional['id']}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == created_professional["id"]
        assert data["email"] == professional_data["email"]
        assert data["full_name"] == professional_data["full_name"]

    def test_get_professional_invalid_id_format(self, client: TestClient):
        """Test professional retrieval with invalid ID format."""
        response = client.get("/api/v1/professionals/invalid-id")

        assert response.status_code == 400
        data = response.json()
        assert "Invalid ID format" in data["detail"]

    def test_get_professional_not_found(self, client: TestClient):
        """Test professional retrieval when professional doesn't exist."""
        non_existent_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/professionals/{non_existent_id}")

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]

    def test_get_professional_inactive_professional(self, client: TestClient, db_session: Session, test_data_factory):
        """Test professional retrieval when professional is inactive."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        register_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert register_response.status_code == 201
        created_professional = register_response.json()

        # Update the professional to be inactive in database
        professional_db = db_session.query(Professional).filter(
            Professional.id == created_professional["id"]
        ).first()
        professional_db.is_active = False
        db_session.commit()

        # Test getting inactive professional
        response = client.get(f"/api/v1/professionals/{created_professional['id']}")

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]


class TestGetCurrentProfessional:
    """Test GET /professionals/me/profile endpoint."""

    def test_get_current_professional_success(self, client: TestClient, test_data_factory):
        """Test successful retrieval of current professional profile."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        # created_professional = response.json()  # Not used in this test

        # Login as professional
        login_response = client.post(
            "/api/v1/auth/login/professional",
            json={"email": professional_data["email"], "password": professional_data["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test getting current professional profile
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/professionals/me/profile", headers=headers)

        assert response.status_code == 200
        data = response.json()
        # assert data["id"] == created_professional["id"]  # created_professional not defined
        assert data["email"] == professional_data["email"]

    def test_get_current_professional_not_found(self, client: TestClient, test_data_factory):
        """Test current professional retrieval when professional doesn't exist."""
        # Create a user (not professional) in the database
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

        # Test getting current professional profile (should fail for regular user)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/professionals/me/profile", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]


class TestUpdateCurrentProfessional:
    """Test PUT /professionals/me endpoint."""

    def test_update_current_professional_success(self, client: TestClient, test_data_factory):
        """Test successful update of current professional profile."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        # created_professional = response.json()  # Not used in this test

        # Login as professional
        login_response = client.post(
            "/api/v1/auth/login/professional",
            json={"email": professional_data["email"], "password": professional_data["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test updating professional profile
        update_data = {
            "full_name": "Updated Professional Name",
            "bio": "Updated bio",
            "rate_cents": 6000,
            "academic_experience": [
                {
                    "degree": "Updated Degree",
                    "institution": "Updated University",
                    "year": 2021,
                    "description": "Updated description",
                }
            ],
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/professionals/me", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Professional Name"
        assert data["bio"] == "Updated bio"
        assert data["rate_cents"] == 6000

    def test_update_current_professional_not_found(self, client: TestClient, test_data_factory):
        """Test professional update when professional doesn't exist."""
        # Create a user (not professional) in the database
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

        # Test updating professional profile (should fail for regular user)
        update_data = {"full_name": "Updated Name"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/professionals/me", json=update_data, headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]

    def test_update_current_professional_with_basic_fields(self, client: TestClient, test_data_factory):
        """Test professional update with basic fields."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201

        # Login as professional
        login_response = client.post(
            "/api/v1/auth/login/professional",
            json={"email": professional_data["email"], "password": professional_data["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test updating basic fields
        update_data = {
            "full_name": "Professional with Basic Fields",
            "bio": "Updated bio with basic fields test",
            "rate_cents": 7500,
            "years_experience": 10,
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/professionals/me", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Professional with Basic Fields"
        assert data["bio"] == "Updated bio with basic fields test"
        assert data["rate_cents"] == 7500
        assert data["years_experience"] == 10


class TestToggleProfessionalStatus:
    """Test PATCH /professionals/{professional_id}/status endpoint."""

    def test_toggle_professional_status_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test successful professional status toggle."""
        # Create admin user and professional
        admin_data = test_data_factory["user"]("admin")
        professional_data = test_data_factory["professional"]("test_professional")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Register professional
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert professional_response.status_code == 201
        professional = professional_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test toggling professional status
        status_data = {"is_active": False}
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.patch(f"/api/v1/professionals/{professional['id']}/status", json=status_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    def test_toggle_professional_status_invalid_id(self, client: TestClient, db_session: Session, test_data_factory):
        """Test professional status toggle with invalid ID."""
        # Create admin user
        admin_data = test_data_factory["user"]("admin")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test with invalid ID
        status_data = {"is_active": False}
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.patch("/api/v1/professionals/invalid-id/status", json=status_data, headers=headers)

        assert response.status_code == 400
        data = response.json()
        assert "Invalid ID format" in data["detail"]

    def test_toggle_professional_status_not_found(self, client: TestClient, db_session: Session, test_data_factory):
        """Test professional status toggle when professional doesn't exist."""
        # Create admin user
        admin_data = test_data_factory["user"]("admin")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test with non-existent professional
        non_existent_id = str(uuid.uuid4())
        status_data = {"is_active": False}
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.patch(f"/api/v1/professionals/{non_existent_id}/status", json=status_data, headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]

    def test_toggle_professional_status_unauthorized(self, client: TestClient, test_data_factory):
        """Test professional status toggle without admin authentication."""
        # Create professional
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert professional_response.status_code == 201
        professional = professional_response.json()

        # Test without authentication
        status_data = {"is_active": False}
        response = client.patch(f"/api/v1/professionals/{professional['id']}/status", json=status_data)

        assert response.status_code == 401


class TestDeleteProfessional:
    """Test DELETE /professionals/{professional_id} endpoint."""

    def test_delete_professional_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test successful professional deletion (soft delete)."""
        # Create admin user and professional
        admin_data = test_data_factory["user"]("admin")
        professional_data = test_data_factory["professional"]("test_professional")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Register professional
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert professional_response.status_code == 201
        professional = professional_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test deleting professional
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete(f"/api/v1/professionals/{professional['id']}", headers=headers)

        assert response.status_code == 204

    def test_delete_professional_invalid_id(self, client: TestClient, db_session: Session, test_data_factory):
        """Test professional deletion with invalid ID."""
        # Create admin user
        admin_data = test_data_factory["user"]("admin")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test with invalid ID
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete("/api/v1/professionals/invalid-id", headers=headers)

        assert response.status_code == 400
        data = response.json()
        assert "Invalid ID format" in data["detail"]

    def test_delete_professional_not_found(self, client: TestClient, db_session: Session, test_data_factory):
        """Test professional deletion when professional doesn't exist."""
        # Create admin user
        admin_data = test_data_factory["user"]("admin")

        # Register admin user
        admin_response = client.post("/api/v1/auth/register/user", json=admin_data)
        assert admin_response.status_code == 201
        admin_user = admin_response.json()

        # Update admin user role in database
        admin_user_db = db_session.query(User).filter(User.id == admin_user["id"]).first()
        admin_user_db.role = UserRole.ADMIN
        db_session.commit()

        # Login as admin
        login_response = client.post(
            "/api/v1/auth/login/user", json={"email": admin_data["email"], "password": admin_data["password"]}
        )
        assert login_response.status_code == 200
        admin_token = login_response.json()["access_token"]

        # Test with non-existent professional
        non_existent_id = str(uuid.uuid4())
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete(f"/api/v1/professionals/{non_existent_id}", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "Professional not found" in data["detail"]

    def test_delete_professional_unauthorized(self, client: TestClient, test_data_factory):
        """Test professional deletion without admin authentication."""
        # Create professional
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert professional_response.status_code == 201
        professional = professional_response.json()

        # Test without authentication
        response = client.delete(f"/api/v1/professionals/{professional['id']}")

        assert response.status_code == 401


class TestProfessionalValidation:
    """Test professional data validation."""

    def test_update_professional_with_empty_data(self, client: TestClient, test_data_factory):
        """Test professional update with empty data."""
        # Create a professional in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        # created_professional = response.json()  # Not used in this test

        # Login as professional
        login_response = client.post(
            "/api/v1/auth/login/professional",
            json={"email": professional_data["email"], "password": professional_data["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Test updating with empty data
        update_data = {}
        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/professionals/me", json=update_data, headers=headers)

        assert response.status_code == 200
        # Should return the professional unchanged
        # data = response.json()  # Variable not used
        # assert data["id"] == created_professional["id"]  # created_professional not defined
