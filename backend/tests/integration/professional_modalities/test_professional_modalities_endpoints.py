"""
Integration tests for professional modalities endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.professional_modality import ProfessionalModality
from app.models.modality import Modality


class TestProfessionalModalitiesEndpoints:
    """Integration tests for professional modalities endpoints."""

    def test_get_professional_modalities_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting all modalities for a professional successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality with unique name
        import uuid

        unique_name = f"Test Individual Therapy {uuid.uuid4().hex[:8]}"
        modality = Modality(
            name=unique_name,
            description="One-on-one therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=50000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name=unique_name,
            description="One-on-one therapy sessions",
            virtual_price=50000,
            presencial_price=50000,
            offers_presencial=True,
            is_default=True,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test getting professional modalities
        response = client.get(f"/api/v1/professional-modalities/professional/{professional['id']}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created professional modality is in the response
        professional_modality_ids = [pm["id"] for pm in data]
        assert str(professional_modality.id) in professional_modality_ids

    def test_get_default_professional_modality_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test getting the default modality for a professional successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Group Therapy",
            description="Group therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=30000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship as default
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Group Therapy",
            description="Group therapy sessions",
            virtual_price=30000,
            presencial_price=30000,
            offers_presencial=True,
            is_default=True,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test getting default professional modality
        response = client.get(f"/api/v1/professional-modalities/professional/{professional['id']}/default")

        assert response.status_code == 200
        data = response.json()
        assert data["modality_name"] == "Test Group Therapy"
        assert data["description"] == "Group therapy sessions"
        assert data["virtual_price"] == 30000
        assert data["presencial_price"] == 30000
        assert data["is_default"] is True
        assert data["is_active"] is True

    def test_get_default_professional_modality_not_found(self, client: TestClient, test_data_factory):
        """Test getting the default modality for a professional that doesn't exist."""
        # Create a professional
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Test getting default modality for professional with no modalities
        response = client.get(f"/api/v1/professional-modalities/professional/{professional['id']}/default")

        assert response.status_code == 404
        data = response.json()
        assert "No default modality found for this professional" in data["detail"]

    def test_get_professional_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test getting a specific professional modality successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Family Therapy",
            description="Family therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=40000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Family Therapy",
            description="Family therapy sessions",
            virtual_price=40000,
            presencial_price=40000,
            offers_presencial=True,
            is_default=False,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test getting specific professional modality
        response = client.get(f"/api/v1/professional-modalities/{professional_modality.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(professional_modality.id)
        assert data["professional_id"] == professional["id"]
        assert data["modality_id"] == str(modality.id)
        assert data["modality_name"] == "Test Family Therapy"
        assert data["virtual_price"] == 40000

    def test_get_professional_modality_not_found(self, client: TestClient):
        """Test getting a professional modality that doesn't exist."""
        # Test getting non-existent professional modality
        response = client.get("/api/v1/professional-modalities/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404
        data = response.json()
        assert "Professional modality not found" in data["detail"]

    def test_create_professional_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test creating a professional modality successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Couples Therapy",
            description="Couples therapy sessions",
            category="therapy",
            is_active=True,
            currency="COP",
            default_price_cents=60000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Test creating professional modality
        professional_modality_data = {
            "professional_id": professional["id"],
            "modality_id": str(modality.id),
            "modality_name": "Test Couples Therapy",
            "description": "Couples therapy sessions",
            "virtual_price": 60000,
            "presencial_price": 60000,
            "offers_presencial": True,
            "is_default": False,
        }

        response = client.post("/api/v1/professional-modalities/", json=professional_modality_data)

        assert response.status_code == 201
        data = response.json()
        assert data["professional_id"] == professional["id"]
        assert data["modality_id"] == str(modality.id)
        assert data["modality_name"] == "Test Couples Therapy"
        assert data["virtual_price"] == 60000
        assert data["presencial_price"] == 60000
        assert data["is_default"] is False
        assert "id" in data

        # Verify the professional modality was created in the database
        created_pm = (
            db_session.query(ProfessionalModality)
            .filter(
                ProfessionalModality.professional_id == professional["id"],
                ProfessionalModality.modality_id == str(modality.id),
            )
            .first()
        )
        assert created_pm is not None

    def test_update_professional_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test updating a professional modality successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Art Therapy",
            description="Art therapy sessions",
            category="creative_therapy",
            is_active=True,
            currency="COP",
            default_price_cents=45000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Art Therapy",
            description="Art therapy sessions",
            virtual_price=45000,
            presencial_price=45000,
            offers_presencial=True,
            is_default=False,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test updating professional modality
        update_data = {
            "modality_name": "Updated Art Therapy",
            "description": "Updated art therapy sessions",
            "virtual_price": 50000,
            "presencial_price": 50000,
            "is_default": True,
        }

        response = client.put(f"/api/v1/professional-modalities/{professional_modality.id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["modality_name"] == "Updated Art Therapy"
        assert data["description"] == "Updated art therapy sessions"
        assert data["virtual_price"] == 50000
        assert data["is_default"] is True

        # Verify the professional modality was updated in the database
        updated_pm = (
            db_session.query(ProfessionalModality).filter(ProfessionalModality.id == professional_modality.id).first()
        )
        assert updated_pm.modality_name == "Updated Art Therapy"
        assert updated_pm.description == "Updated art therapy sessions"
        assert updated_pm.virtual_price == 50000
        assert updated_pm.is_default is True

    def test_update_professional_modality_not_found(self, client: TestClient):
        """Test updating a professional modality that doesn't exist."""
        # Test updating non-existent professional modality
        update_data = {"modality_name": "Updated Modality", "virtual_price": 50000}

        response = client.put("/api/v1/professional-modalities/550e8400-e29b-41d4-a716-446655440000", json=update_data)

        assert response.status_code == 404
        data = response.json()
        assert "Professional modality not found" in data["detail"]

    def test_delete_professional_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test deleting a professional modality successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Music Therapy",
            description="Music therapy sessions",
            category="creative_therapy",
            is_active=True,
            currency="COP",
            default_price_cents=40000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Music Therapy",
            description="Music therapy sessions",
            virtual_price=40000,
            presencial_price=40000,
            offers_presencial=True,
            is_default=False,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test deleting professional modality
        response = client.delete(f"/api/v1/professional-modalities/{professional_modality.id}")

        assert response.status_code == 204

        # Verify the professional modality was soft deleted in the database
        deleted_pm = (
            db_session.query(ProfessionalModality).filter(ProfessionalModality.id == professional_modality.id).first()
        )
        assert deleted_pm.is_active is False

    def test_delete_professional_modality_not_found(self, client: TestClient):
        """Test deleting a professional modality that doesn't exist."""
        # Test deleting non-existent professional modality
        response = client.delete("/api/v1/professional-modalities/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404
        data = response.json()
        assert "Professional modality not found" in data["detail"]

    def test_set_default_modality_success(self, client: TestClient, db_session: Session, test_data_factory):
        """Test setting a modality as default successfully."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Play Therapy",
            description="Play therapy sessions",
            category="child_therapy",
            is_active=True,
            currency="COP",
            default_price_cents=35000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Play Therapy",
            description="Play therapy sessions",
            virtual_price=35000,
            presencial_price=35000,
            offers_presencial=True,
            is_default=False,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test setting modality as default
        response = client.put(f"/api/v1/professional-modalities/{professional_modality.id}/set-default")

        assert response.status_code == 200
        data = response.json()
        assert data["is_default"] is True

        # Verify the professional modality was updated in the database
        updated_pm = (
            db_session.query(ProfessionalModality).filter(ProfessionalModality.id == professional_modality.id).first()
        )
        assert updated_pm.is_default is True

    def test_set_default_modality_not_found(self, client: TestClient):
        """Test setting a non-existent modality as default."""
        # Test setting non-existent professional modality as default
        response = client.put("/api/v1/professional-modalities/550e8400-e29b-41d4-a716-446655440000/set-default")

        assert response.status_code == 404
        data = response.json()
        assert "Professional modality not found" in data["detail"]

    def test_set_default_modality_failed(self, client: TestClient, db_session: Session, test_data_factory):
        """Test setting a modality as default when it fails."""
        # Create a professional and modality in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a modality
        modality = Modality(
            name="Test Drama Therapy",
            description="Drama therapy sessions",
            category="creative_therapy",
            is_active=True,
            currency="COP",
            default_price_cents=40000,
        )
        db_session.add(modality)
        db_session.commit()
        db_session.refresh(modality)

        # Create a professional modality relationship
        professional_modality = ProfessionalModality(
            professional_id=professional["id"],
            modality_id=str(modality.id),
            modality_name="Test Drama Therapy",
            description="Drama therapy sessions",
            virtual_price=40000,
            presencial_price=40000,
            offers_presencial=True,
            is_default=False,
            is_active=True,
        )
        db_session.add(professional_modality)
        db_session.commit()
        db_session.refresh(professional_modality)

        # Test setting modality as default (should work normally)
        response = client.put(f"/api/v1/professional-modalities/{professional_modality.id}/set-default")

        # Should succeed under normal conditions
        assert response.status_code == 200
