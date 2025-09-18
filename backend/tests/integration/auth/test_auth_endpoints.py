"""
Integration tests for authentication endpoints.
"""
import pytest
from fastapi.testclient import TestClient

# Test constants for passwords to avoid hardcoded credentials
TEST_PASSWORDS = {
    "VALID": "test-password-123",
    "INVALID": "wrong-test-password",
    "WEAK": "123",  # Too short for testing weak password validation
}


class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_user(self, client: TestClient):
        """Test user registration."""
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User",
            "phone": "+1234567890"
        }
        
        response = client.post("/api/v1/auth/register/user", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert data["phone"] == "+1234567890"
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data  # Password should not be returned
    
    def test_register_user_duplicate_email(self, client: TestClient):
        """Test user registration with duplicate email."""
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User"
        }
        
        # Register first user
        response1 = client.post("/api/v1/auth/register/user", json=user_data)
        assert response1.status_code == 201
        
        # Try to register second user with same email
        response2 = client.post("/api/v1/auth/register/user", json=user_data)
        assert response2.status_code == 400
        assert "email already registered" in response2.json()["detail"].lower()
    
    def test_register_user_invalid_email(self, client: TestClient):
        """Test user registration with invalid email."""
        user_data = {
            "email": "invalid-email",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 422
    
    def test_register_user_weak_password(self, client: TestClient):
        """Test user registration with weak password."""
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["WEAK"],  # Too short
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register/user", json=user_data)
        assert response.status_code == 422
    
    def test_login_user(self, client: TestClient):
        """Test user login."""
        # Register user first
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        # Login
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login/user", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"
    
    def test_login_user_wrong_password(self, client: TestClient):
        """Test user login with wrong password."""
        # Register user first
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        # Login with wrong password
        login_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["INVALID"]
        }
        
        response = client.post("/api/v1/auth/login/user", json=login_data)
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()
    
    def test_login_user_not_found(self, client: TestClient):
        """Test user login with non-existent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login/user", json=login_data)
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()
    
    def test_get_current_user(self, client: TestClient):
        """Test getting current user information."""
        # Register and login user
        user_data = {
            "email": "test@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "user"
        assert data["data"]["email"] == "test@example.com"
        assert data["data"]["full_name"] == "Test User"
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401
    
    def test_register_professional(self, client: TestClient):
        """Test professional registration."""
        professional_data = {
            "email": "professional@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test Professional",
            "specialty_ids": ["psychology"],
            "bio": "Test bio",
            "rate_cents": 50000
        }
        
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "professional@example.com"
        assert data["full_name"] == "Test Professional"
        assert data["specialty_ids"] == ["psychology"]
        assert data["bio"] == "Test bio"
        assert data["rate_cents"] == 50000
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data
    
    def test_login_professional(self, client: TestClient):
        """Test professional login."""
        # Register professional first
        professional_data = {
            "email": "professional@example.com",
            "password": TEST_PASSWORDS["VALID"],
            "full_name": "Test Professional",
            "specialty_ids": ["psychology"]
        }
        client.post("/api/v1/auth/register/professional", json=professional_data)
        
        # Login
        login_data = {
            "email": "professional@example.com",
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login/professional", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "professional" in data
        assert data["professional"]["email"] == "professional@example.com"
        assert data["professional"]["specialty_ids"] == ["psychology"]
