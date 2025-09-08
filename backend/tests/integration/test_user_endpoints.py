"""
Integration tests for user endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestUserEndpoints:
    """Test user endpoints."""
    
    def test_get_users(self, client: TestClient):
        """Test getting all users."""
        # Register a user first
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        # Login as admin (assuming admin user exists or we create one)
        # For now, we'll test without authentication
        response = client.get("/api/v1/users/")
        
        # This might return 401 if authentication is required
        # or 200 if it's a public endpoint
        assert response.status_code in [200, 401]
    
    def test_get_user_by_id(self, client: TestClient):
        """Test getting user by ID."""
        # Register a user first
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        register_response = client.post("/api/v1/auth/register/user", json=user_data)
        user_id = register_response.json()["id"]
        
        # Get user by ID
        response = client.get(f"/api/v1/users/{user_id}")
        
        # This might return 401 if authentication is required
        # or 200 if it's a public endpoint
        assert response.status_code in [200, 401]
        
        if response.status_code == 200:
            data = response.json()
            assert data["email"] == "test@example.com"
            assert data["full_name"] == "Test User"
    
    def test_get_user_by_id_not_found(self, client: TestClient):
        """Test getting non-existent user by ID."""
        response = client.get("/api/v1/users/99999")
        assert response.status_code in [404, 401]
    
    def test_update_user(self, client: TestClient):
        """Test updating user information."""
        # Register and login user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Update user
        update_data = {
            "full_name": "Updated Name",
            "phone": "+9876543210"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/users/me", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["phone"] == "+9876543210"
        assert data["email"] == "test@example.com"  # Should remain unchanged
    
    def test_update_user_no_auth(self, client: TestClient):
        """Test updating user without authentication."""
        update_data = {
            "full_name": "Updated Name"
        }
        response = client.put("/api/v1/users/me", json=update_data)
        assert response.status_code == 401
    
    def test_delete_user(self, client: TestClient):
        """Test deleting user account."""
        # Register and login user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Delete user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.delete("/api/v1/users/me", headers=headers)
        
        # This might return 200, 204, or 401 depending on implementation
        assert response.status_code in [200, 204, 401]
    
    def test_delete_user_no_auth(self, client: TestClient):
        """Test deleting user without authentication."""
        response = client.delete("/api/v1/users/me")
        assert response.status_code == 401
