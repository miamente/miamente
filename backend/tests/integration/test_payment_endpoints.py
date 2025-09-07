"""
Integration tests for payment endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestPaymentEndpoints:
    """Test payment endpoints."""
    
    def test_create_payment(self, client: TestClient):
        """Test creating a payment."""
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
        
        # Create payment
        payment_data = {
            "professional_id": professional_id,
            "amount_cents": 50000,
            "currency": "USD",
            "payment_method": "stripe"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/payments/", json=payment_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["user_id"] == user_id
        assert data["amount_cents"] == 50000
        assert data["currency"] == "USD"
        assert data["provider"] == "stripe"
        assert data["status"] == "pending"
        assert "id" in data
        assert "appointment_id" in data
        assert "created_at" in data
    
    def test_create_payment_no_auth(self, client: TestClient):
        """Test creating payment without authentication."""
        payment_data = {
            "professional_id": 1,
            "amount_cents": 50000,
            "currency": "USD",
            "payment_method": "stripe"
        }
        response = client.post("/api/v1/payments/", json=payment_data)
        assert response.status_code == 401
    
    def test_get_user_payments(self, client: TestClient):
        """Test getting user payments."""
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
        
        # Get user payments
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/payments/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_user_payments_no_auth(self, client: TestClient):
        """Test getting user payments without authentication."""
        response = client.get("/api/v1/payments/")
        assert response.status_code == 401
    
    def test_get_payment_by_id(self, client: TestClient):
        """Test getting payment by ID."""
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
        
        # Create payment
        payment_data = {
            "professional_id": professional_id,
            "amount_cents": 50000,
            "currency": "USD",
            "payment_method": "stripe"
        }
        headers = {"Authorization": f"Bearer {token}"}
        create_response = client.post("/api/v1/payments/", json=payment_data, headers=headers)
        payment_id = create_response.json()["id"]
        
        # Get payment by ID
        response = client.get(f"/api/v1/payments/{payment_id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == payment_id
        assert data["user_id"] == user_id
        assert data["amount_cents"] == 50000
        assert data["currency"] == "USD"
        assert data["provider"] == "stripe"
        assert data["status"] == "pending"
        assert "appointment_id" in data
    
    def test_get_payment_by_id_not_found(self, client: TestClient):
        """Test getting non-existent payment by ID."""
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
        # Use a valid UUID that doesn't exist
        non_existent_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/payments/{non_existent_uuid}", headers=headers)
        assert response.status_code == 404
    
    def test_update_payment_status(self, client: TestClient):
        """Test updating payment status."""
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
        
        # Create payment
        payment_data = {
            "professional_id": professional_id,
            "amount_cents": 50000,
            "currency": "USD",
            "payment_method": "stripe"
        }
        headers = {"Authorization": f"Bearer {token}"}
        create_response = client.post("/api/v1/payments/", json=payment_data, headers=headers)
        payment_id = create_response.json()["id"]
        
        # Update payment status
        update_data = {
            "status": "completed",
            "provider_payment_id": "pi_test_123"
        }
        response = client.patch(f"/api/v1/payments/{payment_id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["provider_payment_id"] == "pi_test_123"
        assert data["id"] == payment_id
    
    def test_update_payment_status_no_auth(self, client: TestClient):
        """Test updating payment status without authentication."""
        update_data = {
            "status": "completed"
        }
        response = client.patch("/api/v1/payments/1", json=update_data)
        assert response.status_code == 401
