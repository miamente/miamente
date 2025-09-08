"""
Integration tests for professional endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestProfessionalEndpoints:
    """Test professional endpoints."""
    
    def test_get_professionals(self, client: TestClient):
        """Test getting all professionals."""
        # Register a professional first
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology",
            "bio": "Test bio",
            "rate_cents": 50000
        }
        client.post("/api/v1/auth/register/professional", json=professional_data)
        
        # Get all professionals
        response = client.get("/api/v1/professionals/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check if our professional is in the list
        professional = next((p for p in data if p["email"] == "professional@example.com"), None)
        assert professional is not None
        assert professional["full_name"] == "Test Professional"
        assert professional["specialty"] == "Psychology"
        assert professional["bio"] == "Test bio"
        assert professional["rate_cents"] == 50000
    
    def test_get_professional_by_id(self, client: TestClient):
        """Test getting professional by ID."""
        # Register a professional first
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        register_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        professional_id = register_response.json()["id"]
        
        # Get professional by ID
        response = client.get(f"/api/v1/professionals/{professional_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "professional@example.com"
        assert data["full_name"] == "Test Professional"
        assert data["specialty"] == "Psychology"
        assert data["id"] == professional_id
    
    def test_get_professional_by_id_not_found(self, client: TestClient):
        """Test getting non-existent professional by ID."""
        # Use a valid UUID that doesn't exist
        non_existent_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/professionals/{non_existent_uuid}")
        assert response.status_code == 404
    
    def test_update_professional(self, client: TestClient):
        """Test updating professional information."""
        # Register and login professional
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        client.post("/api/v1/auth/register/professional", json=professional_data)
        
        login_data = {
            "email": "professional@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/professional", json=login_data)
        token = login_response.json()["access_token"]
        
        # Update professional
        update_data = {
            "full_name": "Updated Professional",
            "bio": "Updated bio",
            "rate_cents": 75000
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/api/v1/professionals/me", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Professional"
        assert data["bio"] == "Updated bio"
        assert data["rate_cents"] == 75000
        assert data["email"] == "professional@example.com"  # Should remain unchanged
    
    def test_update_professional_no_auth(self, client: TestClient):
        """Test updating professional without authentication."""
        update_data = {
            "full_name": "Updated Professional"
        }
        response = client.put("/api/v1/professionals/me", json=update_data)
        assert response.status_code == 401
    
    def test_get_professional_availability(self, client: TestClient):
        """Test getting professional availability."""
        # Register a professional first
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        register_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        professional_id = register_response.json()["id"]
        
        # Get professional availability
        response = client.get(f"/api/v1/professionals/{professional_id}/availability")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_professional_appointments(self, client: TestClient):
        """Test getting professional appointments."""
        # Register and login professional
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        client.post("/api/v1/auth/register/professional", json=professional_data)
        
        login_data = {
            "email": "professional@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/professional", json=login_data)
        token = login_response.json()["access_token"]
        
        # Get professional appointments
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/professionals/me/appointments", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_professional_appointments_no_auth(self, client: TestClient):
        """Test getting professional appointments without authentication."""
        response = client.get("/api/v1/professionals/me/appointments")
        assert response.status_code == 401
