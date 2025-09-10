"""
Tests for professional profile endpoints.
"""
import pytest
from tests.conftest import ProfessionalModel


@pytest.fixture
def sample_professional(db_session) -> ProfessionalModel:
    """Create a sample professional for testing."""
    import json
    professional = ProfessionalModel(
        email="test@example.com",
        full_name="Dr. Test Professional",
        phone="+573001234567",
        hashed_password="hashed_password_for_test",
        specialty="Psicología Clínica",
        license_number="PS123456",
        years_experience=5,
        rate_cents=80000,
        currency="COP",
        bio="Psicóloga clínica con experiencia en terapia cognitivo-conductual.",
        certifications=json.dumps(["Terapia Cognitivo-Conductual", "EMDR"]),
        languages=json.dumps(["Español", "Inglés"]),
        therapy_approaches=json.dumps(["Cognitivo-Conductual", "Humanista"]),
        timezone="America/Bogota",
        emergency_contact="María Test",
        emergency_phone="+573001234568",
        is_active=True,
        is_verified=True,
        profile_picture="https://example.com/profile.jpg"
    )
    db_session.add(professional)
    db_session.commit()
    db_session.refresh(professional)
    return professional


class TestProfessionalProfile:
    """Test professional profile endpoints."""

    def test_get_professional_profile_success(self, client, db_session, sample_professional: ProfessionalModel):
        """Test successful retrieval of professional profile."""
        response = client.get(f"/api/v1/professionals/{sample_professional.id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(sample_professional.id)
        assert data["email"] == sample_professional.email
        assert data["full_name"] == sample_professional.full_name
        assert data["phone"] == sample_professional.phone
        assert data["specialty"] == sample_professional.specialty
        assert data["license_number"] == sample_professional.license_number
        assert data["years_experience"] == sample_professional.years_experience
        assert data["rate_cents"] == sample_professional.rate_cents
        assert data["currency"] == sample_professional.currency
        assert data["bio"] == sample_professional.bio
        # Note: JSON fields are parsed by the API
        assert data["certifications"] == ["Terapia Cognitivo-Conductual", "EMDR"]
        assert data["languages"] == ["Español", "Inglés"]
        assert data["therapy_approaches"] == ["Cognitivo-Conductual", "Humanista"]
        assert data["timezone"] == sample_professional.timezone
        assert data["emergency_contact"] == sample_professional.emergency_contact
        assert data["emergency_phone"] == sample_professional.emergency_phone
        assert data["is_active"] == sample_professional.is_active
        assert data["is_verified"] == sample_professional.is_verified
        assert data["profile_picture"] == sample_professional.profile_picture

    def test_get_professional_profile_not_found(self, client, db_session):
        """Test retrieval of non-existent professional profile."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/professionals/{fake_id}")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Professional not found"

    def test_get_professional_profile_invalid_id(self, client, db_session):
        """Test retrieval with invalid ID format."""
        invalid_id = "invalid-id"
        response = client.get(f"/api/v1/professionals/{invalid_id}")
        
        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Invalid ID format"

    def test_get_professional_profile_inactive(self, client, db_session, sample_professional: ProfessionalModel):
        """Test retrieval of inactive professional profile."""
        # Make professional inactive
        sample_professional.is_active = False
        db_session.commit()
        
        response = client.get(f"/api/v1/professionals/{sample_professional.id}")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Professional not found"

    def test_get_professional_availability_success(self, client, db_session, sample_professional: ProfessionalModel):
        """Test successful retrieval of professional availability."""
        response = client.get(f"/api/v1/professionals/{sample_professional.id}/availability")
        
        assert response.status_code == 200
        data = response.json()
        assert data == []  # Currently returns empty list

    def test_get_professional_availability_not_found(self, client, db_session):
        """Test availability retrieval for non-existent professional."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/professionals/{fake_id}/availability")
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Professional not found"

    def test_get_professional_availability_invalid_id(self, client, db_session):
        """Test availability retrieval with invalid ID format."""
        invalid_id = "invalid-id"
        response = client.get(f"/api/v1/professionals/{invalid_id}/availability")
        
        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Invalid professional ID format"
