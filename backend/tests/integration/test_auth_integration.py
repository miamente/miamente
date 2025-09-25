"""
Integration tests for authentication flow.

This test covers the complete authentication workflow including:
- User registration
- User login
- Token validation
- Protected endpoint access
- Token refresh
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User as UserModel
from app.core.security import verify_token

pytestmark = pytest.mark.integration


class TestAuthenticationIntegration:
    """Integration tests for the complete authentication flow."""

    def _register_user(self, client: TestClient, db_session: Session, test_data_factory):
        """Helper method to register a user and return user data and DB user."""
        user_data = test_data_factory["user"]("integration_user")

        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        registered_user = response.json()
        assert registered_user["email"] == user_data["email"]
        assert registered_user["full_name"] == user_data["full_name"]
        assert "id" in registered_user
        assert registered_user["is_active"] is True
        assert registered_user["is_verified"] is False

        # Verify user was actually created in the database
        db_user = db_session.query(UserModel).filter(UserModel.email == user_data["email"]).first()
        assert db_user is not None
        assert db_user.email == user_data["email"]
        assert db_user.full_name == user_data["full_name"]

        return user_data, registered_user, db_user

    def _login_user(self, client: TestClient, user_data):
        """Helper method to login user and return tokens."""
        login_data = {"email": user_data["email"], "password": user_data["password"]}

        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200

        login_response = response.json()
        assert "access_token" in login_response
        assert "refresh_token" in login_response
        assert login_response["token_type"] == "bearer"

        return login_response["access_token"], login_response["refresh_token"]

    def _test_protected_access(self, client: TestClient, access_token, expected_user_data):
        """Helper method to test protected endpoint access."""
        headers = {"Authorization": f"Bearer {access_token}"}
        response = client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200

        user_profile = response.json()
        assert user_profile["email"] == expected_user_data["email"]
        assert user_profile["full_name"] == expected_user_data["full_name"]
        return user_profile

    def _test_token_refresh(self, client: TestClient, refresh_token):
        """Helper method to test token refresh."""
        refresh_data = {"refresh_token": refresh_token}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        assert response.status_code == 200

        refresh_response = response.json()
        assert "access_token" in refresh_response
        assert "refresh_token" in refresh_response
        assert refresh_response["token_type"] == "bearer"
        return refresh_response["access_token"]

    def test_complete_user_auth_flow(self, client: TestClient, db_session: Session, test_data_factory):
        """Test the complete user authentication flow from registration to protected access."""
        # Step 1: Register a new user
        user_data, registered_user, db_user = self._register_user(client, db_session, test_data_factory)

        # Step 2: Login with the registered user
        access_token, refresh_token = self._login_user(client, user_data)

        # Step 3: Verify the token is valid
        token_user_id = verify_token(access_token)
        assert token_user_id is not None
        assert token_user_id == str(db_user.id)

        # Step 4: Access a protected endpoint
        user_profile = self._test_protected_access(client, access_token, user_data)
        assert user_profile["id"] == registered_user["id"]

        # Step 5: Test token refresh
        new_access_token = self._test_token_refresh(client, refresh_token)

        # Verify the new token works
        self._test_protected_access(client, new_access_token, user_data)

        # Step 6: Test invalid token handling
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=invalid_headers)
        assert response.status_code == 401

        # Step 7: Test missing token
        response = client.get("/api/v1/users/me")
        assert response.status_code == 401

    def test_user_registration_validation(self, client: TestClient, db_session: Session):
        """Test user registration with invalid data."""
        # db_session is available for potential future use
        _ = db_session

        # Test with invalid email
        invalid_user_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "full_name": "Test User",
            "phone": "+1234567890",
        }

        response = client.post("/api/v1/auth/register/user", json=invalid_user_data)
        assert response.status_code == 422  # Validation error

        # Test with missing required fields
        incomplete_user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            # missing full_name
        }

        response = client.post("/api/v1/auth/register/user", json=incomplete_user_data)
        assert response.status_code == 422

        # Test with duplicate email
        user_data = {
            "email": "duplicate@example.com",
            "password": "testpassword123",
            "full_name": "Test User 1",
            "phone": "+1234567890",
        }

        # Register first user
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Try to register with same email
        duplicate_user_data = {
            "email": "duplicate@example.com",
            "password": "testpassword123",
            "full_name": "Test User 2",
            "phone": "+1234567890",
        }

        response = client.post("/api/v1/auth/register/user", json=duplicate_user_data)
        assert response.status_code == 400  # Duplicate email error

    def test_login_validation(self, client: TestClient, test_data_factory):
        """Test login with various invalid scenarios."""

        # Create a test user first
        user_data = test_data_factory["user"]("login_test_user")
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        # Test login with wrong password
        wrong_password_data = {"email": user_data["email"], "password": "wrongpassword"}

        response = client.post("/api/v1/auth/login", json=wrong_password_data)
        assert response.status_code == 401

        # Test login with non-existent email
        non_existent_data = {"email": "nonexistent@example.com", "password": "testpassword123"}

        response = client.post("/api/v1/auth/login", json=non_existent_data)
        assert response.status_code == 401

        # Test login with invalid email format
        invalid_email_data = {"email": "invalid-email", "password": "testpassword123"}

        response = client.post("/api/v1/auth/login", json=invalid_email_data)
        assert response.status_code == 401  # Unauthorized (email not found)

    def test_token_refresh_validation(self, client: TestClient, test_data_factory):
        """Test token refresh with various scenarios."""

        # Create a test user and get tokens
        user_data = test_data_factory["user"]("refresh_test_user")
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 201

        login_data = {"email": user_data["email"], "password": user_data["password"]}
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200

        refresh_token = response.json()["refresh_token"]

        # Test valid refresh
        refresh_data = {"refresh_token": refresh_token}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        assert response.status_code == 200

        # Test invalid refresh token
        invalid_refresh_data = {"refresh_token": "invalid_refresh_token"}
        response = client.post("/api/v1/auth/refresh", json=invalid_refresh_data)
        assert response.status_code == 401

        # Test missing refresh token
        response = client.post("/api/v1/auth/refresh", json={})
        assert response.status_code == 422

    def test_professional_auth_flow(self, client: TestClient, db_session: Session, test_data_factory):
        """Test the complete professional authentication flow."""
        # db_session is available for potential future use
        _ = db_session

        # Step 1: Register a new professional
        professional_data = test_data_factory["professional"]("integration_professional")

        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201

        registered_professional = response.json()
        assert registered_professional["email"] == professional_data["email"]
        assert registered_professional["full_name"] == professional_data["full_name"]
        assert "id" in registered_professional

        # Step 2: Login as professional
        login_data = {"email": professional_data["email"], "password": professional_data["password"]}

        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200

        login_response = response.json()
        assert "access_token" in login_response
        assert "refresh_token" in login_response
        assert login_response["token_type"] == "bearer"

        # Step 3: Test token validation
        access_token = login_response["access_token"]
        token_user_id = verify_token(access_token)
        assert token_user_id is not None
        assert token_user_id == str(registered_professional["id"])

        # Step 4: Test token refresh for professional
        refresh_token = login_response["refresh_token"]
        refresh_data = {"refresh_token": refresh_token}
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        assert response.status_code == 200

        refresh_response = response.json()
        assert "access_token" in refresh_response
        assert "refresh_token" in refresh_response
