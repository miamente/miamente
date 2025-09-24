"""
Integration tests for professional specialties endpoints.
"""

import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.professional_specialty import ProfessionalSpecialty
from app.models.specialty import Specialty


class TestProfessionalSpecialtiesEndpoints:
    """Test class for professional specialties endpoints."""

    def test_get_professional_specialties_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting professional specialties successfully."""
        # Create a professional and specialty in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a specialty with unique name
        unique_name = f"Test Specialty {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=unique_name)
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Create a professional specialty relationship
        professional_specialty = ProfessionalSpecialty(
            professional_id=professional["id"], specialty_id=str(specialty.id)
        )
        db_session.add(professional_specialty)
        db_session.commit()
        db_session.refresh(professional_specialty)

        # Test getting professional specialties
        response = client.get(f"/api/v1/professional-specialties/professional/{professional['id']}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created professional specialty is in the response
        professional_specialty_ids = [ps["id"] for ps in data]
        assert str(professional_specialty.id) in professional_specialty_ids

    def test_get_professional_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting a specific professional specialty successfully."""
        # Create a professional and specialty in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a specialty with unique name
        unique_name = f"Test Specialty {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=unique_name)
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Create a professional specialty relationship
        professional_specialty = ProfessionalSpecialty(
            professional_id=professional["id"], specialty_id=str(specialty.id)
        )
        db_session.add(professional_specialty)
        db_session.commit()
        db_session.refresh(professional_specialty)

        # Test getting specific professional specialty
        response = client.get(f"/api/v1/professional-specialties/{professional_specialty.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(professional_specialty.id)
        assert data["professional_id"] == professional["id"]
        assert data["specialty_id"] == str(specialty.id)

    def test_get_professional_specialty_not_found(self, client: TestClient):
        """Test getting a professional specialty that doesn't exist."""
        # Test getting non-existent professional specialty
        response = client.get("/api/v1/professional-specialties/550e8400-e29b-41d4-a716-446655440000")
        assert response.status_code == 404
        data = response.json()
        assert "Professional specialty not found" in data["detail"]

    def test_create_professional_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a professional specialty successfully."""
        # Create a professional and specialty in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a specialty with unique name
        unique_name = f"Test Specialty {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=unique_name)
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Test creating professional specialty
        professional_specialty_data = {"professional_id": professional["id"], "specialty_id": str(specialty.id)}

        response = client.post("/api/v1/professional-specialties/", json=professional_specialty_data)
        assert response.status_code == 201
        data = response.json()
        assert data["professional_id"] == professional["id"]
        assert data["specialty_id"] == str(specialty.id)

    def test_update_professional_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test updating a professional specialty successfully."""
        # Create a professional and specialty in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a specialty with unique name
        unique_name = f"Test Specialty {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=unique_name)
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Create a professional specialty relationship
        professional_specialty = ProfessionalSpecialty(
            professional_id=professional["id"], specialty_id=str(specialty.id)
        )
        db_session.add(professional_specialty)
        db_session.commit()
        db_session.refresh(professional_specialty)

        # Test updating professional specialty
        update_data = {"is_active": False}

        response = client.put(f"/api/v1/professional-specialties/{professional_specialty.id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(professional_specialty.id)
        assert data["is_active"] is False

    def test_update_professional_specialty_not_found(self, client: TestClient):
        """Test updating a professional specialty that doesn't exist."""
        # Test updating non-existent professional specialty
        update_data = {"is_active": False}

        response = client.put("/api/v1/professional-specialties/550e8400-e29b-41d4-a716-446655440000", json=update_data)
        assert response.status_code == 404
        data = response.json()
        assert "Professional specialty not found" in data["detail"]

    def test_delete_professional_specialty_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test deleting a professional specialty successfully."""
        # Create a professional and specialty in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a specialty with unique name
        unique_name = f"Test Specialty {uuid.uuid4().hex[:8]}"
        specialty = Specialty(name=unique_name)
        db_session.add(specialty)
        db_session.commit()
        db_session.refresh(specialty)

        # Create a professional specialty relationship
        professional_specialty = ProfessionalSpecialty(
            professional_id=professional["id"], specialty_id=str(specialty.id)
        )
        db_session.add(professional_specialty)
        db_session.commit()
        db_session.refresh(professional_specialty)

        # Test deleting professional specialty
        response = client.delete(f"/api/v1/professional-specialties/{professional_specialty.id}")
        assert response.status_code == 200
        data = response.json()
        assert "Professional specialty deleted successfully" in data["message"]

    def test_delete_professional_specialty_not_found(self, client: TestClient):
        """Test deleting a professional specialty that doesn't exist."""
        # Test deleting non-existent professional specialty
        response = client.delete("/api/v1/professional-specialties/550e8400-e29b-41d4-a716-446655440000")
        assert response.status_code == 404
        data = response.json()
        assert "Professional specialty not found" in data["detail"]
