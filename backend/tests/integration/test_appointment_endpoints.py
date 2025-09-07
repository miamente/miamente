"""
Integration tests for appointment endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone


class TestAppointmentEndpoints:
    """Test appointment endpoints."""
    
    def test_create_appointment(self, client: TestClient):
        """Test creating an appointment."""
        # Register user and professional
        user_data = {
            "email": "user@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        user_response = client.post("/api/v1/auth/register/user", json=user_data)
        user_id = user_response.json()["id"]
        
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        professional_id = professional_response.json()["id"]
        
        # Login as user
        login_data = {
            "email": "user@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Create appointment
        appointment_data = {
            "professional_id": professional_id,
            "start_time": "2024-12-01T10:00:00Z",
            "end_time": "2024-12-01T11:00:00Z",
            "notes": "Test appointment"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/appointments/", json=appointment_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["professional_id"] == professional_id
        assert data["user_id"] == user_id
        assert data["status"] == "scheduled"
        assert data["notes"] == "Test appointment"
        assert "id" in data
        assert "created_at" in data
    
    def test_create_appointment_no_auth(self, client: TestClient):
        """Test creating appointment without authentication."""
        appointment_data = {
            "professional_id": 1,
            "start_time": "2024-12-01T10:00:00Z",
            "end_time": "2024-12-01T11:00:00Z"
        }
        response = client.post("/api/v1/appointments/", json=appointment_data)
        assert response.status_code == 401
    
    def test_get_user_appointments(self, client: TestClient):
        """Test getting user appointments."""
        # Register and login user
        user_data = {
            "email": "user@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        login_data = {
            "email": "user@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Get user appointments
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/appointments/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_user_appointments_no_auth(self, client: TestClient):
        """Test getting user appointments without authentication."""
        response = client.get("/api/v1/appointments/")
        assert response.status_code == 401
    
    def test_get_appointment_by_id(self, client: TestClient):
        """Test getting appointment by ID."""
        # Register user and professional
        user_data = {
            "email": "user@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        user_response = client.post("/api/v1/auth/register/user", json=user_data)
        user_id = user_response.json()["id"]
        
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        professional_id = professional_response.json()["id"]
        
        # Login as user
        login_data = {
            "email": "user@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Create appointment
        appointment_data = {
            "professional_id": professional_id,
            "start_time": "2024-12-01T10:00:00Z",
            "end_time": "2024-12-01T11:00:00Z"
        }
        headers = {"Authorization": f"Bearer {token}"}
        create_response = client.post("/api/v1/appointments/", json=appointment_data, headers=headers)
        appointment_id = create_response.json()["id"]
        
        # Get appointment by ID
        response = client.get(f"/api/v1/appointments/{appointment_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == appointment_id
        assert data["professional_id"] == professional_id
        assert data["user_id"] == user_id
    
    def test_get_appointment_by_id_not_found(self, client: TestClient):
        """Test getting non-existent appointment by ID."""
        # Register and login user
        user_data = {
            "email": "user@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        client.post("/api/v1/auth/register/user", json=user_data)
        
        login_data = {
            "email": "user@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/appointments/99999", headers=headers)
        assert response.status_code == 404
    
    def test_cancel_appointment(self, client: TestClient):
        """Test canceling an appointment."""
        # Register user and professional
        user_data = {
            "email": "user@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        user_response = client.post("/api/v1/auth/register/user", json=user_data)
        user_id = user_response.json()["id"]
        
        professional_data = {
            "email": "professional@example.com",
            "password": "testpassword123",
            "full_name": "Test Professional",
            "specialty": "Psychology"
        }
        professional_response = client.post("/api/v1/auth/register/professional", json=professional_data)
        professional_id = professional_response.json()["id"]
        
        # Login as user
        login_data = {
            "email": "user@example.com",
            "password": "testpassword123"
        }
        login_response = client.post("/api/v1/auth/login/user", json=login_data)
        token = login_response.json()["access_token"]
        
        # Create appointment
        appointment_data = {
            "professional_id": professional_id,
            "start_time": "2024-12-01T10:00:00Z",
            "end_time": "2024-12-01T11:00:00Z"
        }
        headers = {"Authorization": f"Bearer {token}"}
        create_response = client.post("/api/v1/appointments/", json=appointment_data, headers=headers)
        appointment_id = create_response.json()["id"]
        
        # Cancel appointment
        response = client.patch(f"/api/v1/appointments/{appointment_id}/cancel", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cancelled"
        assert data["id"] == appointment_id
    
    def test_cancel_appointment_no_auth(self, client: TestClient):
        """Test canceling appointment without authentication."""
        response = client.patch("/api/v1/appointments/1/cancel")
        assert response.status_code == 401
