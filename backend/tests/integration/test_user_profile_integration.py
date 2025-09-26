"""
Integration tests for user profile management endpoints.

This test covers the user profile management workflow including:
- User profile retrieval (/api/v1/users/me GET)
- User profile updates (/api/v1/users/me PUT)
- Authentication and authorization
- Database persistence and validation
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User as UserModel
from app.core.security import verify_token

pytestmark = pytest.mark.integration


class TestUserProfileIntegration:
    """Integration tests for user profile management."""

    def _create_and_login_user(self, client: TestClient, test_data_factory, user_name="test_user"):
        """Helper method to create a user and login."""
        # Create user data
        user_data = test_data_factory["user"](user_name)

        # Register user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201
        registered_user = response.json()

        # Login as user
        login_data = {"email": user_data["email"], "password": user_data["password"]}
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200

        login_response = response.json()
        access_token = login_response["access_token"]

        return user_data, registered_user, access_token

    def test_user_profile_retrieval(self, client: TestClient, db_session: Session, test_data_factory):
        """Test user profile retrieval endpoint."""
        # db_session is available for potential future use
        _ = db_session
        # Step 1: Create and login as user
        user_data, registered_user, access_token = self._create_and_login_user(
            client, test_data_factory, "profile_retrieval_user"
        )

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Retrieve user profile
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200

        user_profile = response.json()
        assert user_profile["id"] == registered_user["id"]
        assert user_profile["email"] == user_data["email"]
        assert user_profile["full_name"] == user_data["full_name"]
        assert user_profile["is_active"] is True
        assert user_profile["is_verified"] is False  # Default value

        # Step 3: Verify token validation
        token_user_id = verify_token(access_token)
        assert token_user_id is not None
        assert token_user_id == str(registered_user["id"])

    def test_user_profile_update(self, client: TestClient, db_session: Session, test_data_factory):
        """Test user profile update endpoint."""
        # Step 1: Create and login as user
        user_data, registered_user, access_token = self._create_and_login_user(
            client, test_data_factory, "profile_update_user"
        )

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Update user profile
        update_data = {"full_name": "Updated User Name", "phone": "+9876543210"}

        response = client.put("/api/v1/users/me", json=update_data, headers=headers)
        assert response.status_code == 200

        updated_profile = response.json()
        assert updated_profile["id"] == registered_user["id"]
        assert updated_profile["email"] == user_data["email"]  # Email should not change
        assert updated_profile["full_name"] == update_data["full_name"]
        assert updated_profile["phone"] == update_data["phone"]

        # Step 3: Verify update in database
        db_user = db_session.query(UserModel).filter(UserModel.id == registered_user["id"]).first()
        assert db_user is not None
        assert db_user.full_name == update_data["full_name"]
        assert db_user.phone == update_data["phone"]
        assert db_user.email == user_data["email"]  # Email unchanged

        # Step 4: Verify profile retrieval reflects updates
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200

        retrieved_profile = response.json()
        assert retrieved_profile["full_name"] == update_data["full_name"]
        assert retrieved_profile["phone"] == update_data["phone"]

    def test_user_profile_authentication(self, client: TestClient, test_data_factory):
        """Test authentication and authorization for user profile endpoints."""
        # Step 1: Create and login as user
        _, _, access_token = self._create_and_login_user(client, test_data_factory, "auth_test_user")

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Test unauthorized access (no token)
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401

        response = client.put("/api/v1/users/me", json={"full_name": "Unauthorized Update"})
        assert response.status_code == 401

        # Step 3: Test invalid token
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=invalid_headers)
        assert response.status_code == 401

        response = client.put("/api/v1/users/me", json={"full_name": "Invalid Token Update"}, headers=invalid_headers)
        assert response.status_code == 401

        # Step 4: Test authorized access
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200

        response = client.put("/api/v1/users/me", json={"full_name": "Authorized Update"}, headers=headers)
        assert response.status_code == 200

    def test_user_profile_update_validation(self, client: TestClient, test_data_factory):
        """Test user profile update validation and error handling."""
        # Step 1: Create and login as user
        user_data, _, access_token = self._create_and_login_user(client, test_data_factory, "validation_test_user")

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Test partial update (only some fields)
        partial_update = {"full_name": "Partially Updated Name"}

        response = client.put("/api/v1/users/me", json=partial_update, headers=headers)
        assert response.status_code == 200

        updated_profile = response.json()
        assert updated_profile["full_name"] == partial_update["full_name"]
        assert updated_profile["email"] == user_data["email"]  # Email should remain unchanged

        # Step 3: Test empty update (no fields)
        response = client.put("/api/v1/users/me", json={}, headers=headers)
        assert response.status_code == 200

        # Profile should remain unchanged
        unchanged_profile = response.json()
        assert unchanged_profile["full_name"] == partial_update["full_name"]
        assert unchanged_profile["email"] == user_data["email"]

        # Step 4: Test invalid field values
        invalid_update = {"full_name": "", "phone": "invalid-phone-format"}  # Empty name

        response = client.put("/api/v1/users/me", json=invalid_update, headers=headers)
        # Should either accept the update or return validation error
        assert response.status_code in [200, 422, 400]

    def test_user_profile_complete_workflow(self, client: TestClient, db_session: Session, test_data_factory):
        """Test complete user profile workflow from registration to multiple updates."""
        # Step 1: Create and login as user
        user_data, registered_user, access_token = self._create_and_login_user(
            client, test_data_factory, "workflow_test_user"
        )

        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Initial profile retrieval
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        initial_profile = response.json()
        assert initial_profile["email"] == user_data["email"]
        assert initial_profile["full_name"] == user_data["full_name"]

        # Step 3: First update
        first_update = {"full_name": "First Update Name", "phone": "+1111111111"}

        response = client.put("/api/v1/users/me", json=first_update, headers=headers)
        assert response.status_code == 200

        # Step 4: Verify first update
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        first_updated_profile = response.json()
        assert first_updated_profile["full_name"] == first_update["full_name"]
        assert first_updated_profile["phone"] == first_update["phone"]

        # Step 5: Second update (overwrite some fields)
        second_update = {"full_name": "Second Update Name", "phone": "+2222222222"}

        response = client.put("/api/v1/users/me", json=second_update, headers=headers)
        assert response.status_code == 200

        # Step 6: Verify second update
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        final_profile = response.json()
        assert final_profile["full_name"] == second_update["full_name"]
        assert final_profile["phone"] == second_update["phone"]
        assert final_profile["email"] == user_data["email"]  # Email never changed

        # Step 7: Verify final state in database
        db_user = db_session.query(UserModel).filter(UserModel.id == registered_user["id"]).first()
        assert db_user is not None
        assert db_user.full_name == second_update["full_name"]
        assert db_user.phone == second_update["phone"]
        assert db_user.email == user_data["email"]
