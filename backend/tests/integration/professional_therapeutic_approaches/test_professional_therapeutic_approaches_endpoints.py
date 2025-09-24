"""
Integration tests for professional therapeutic approaches endpoints.
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach
from app.models.therapeutic_approach import TherapeuticApproach


class TestProfessionalTherapeuticApproachesEndpoints:
    """Integration tests for professional therapeutic approaches endpoints."""

    def test_get_professional_therapeutic_approaches_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test getting all therapeutic approaches for a professional successfully."""
        # Create a professional and therapeutic approach in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a therapeutic approach
        therapeutic_approach = TherapeuticApproach(
            name="Test Cognitive Behavioral Therapy",
            description="A type of psychotherapy that helps people change negative thought patterns",
            category="psychotherapy",
        )
        db_session.add(therapeutic_approach)
        db_session.commit()
        db_session.refresh(therapeutic_approach)

        # Create a professional therapeutic approach relationship
        professional_therapeutic_approach = ProfessionalTherapeuticApproach(
            professional_id=professional["id"], therapeutic_approach_id=str(therapeutic_approach.id)
        )
        db_session.add(professional_therapeutic_approach)
        db_session.commit()
        db_session.refresh(professional_therapeutic_approach)

        # Test getting professional therapeutic approaches
        response = client.get(f"/api/v1/professional-therapeutic-approaches/professional/{professional['id']}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

        # Check if our created professional therapeutic approach is in the response
        professional_approach_ids = [pta["id"] for pta in data]
        assert str(professional_therapeutic_approach.id) in professional_approach_ids

    def test_get_professional_therapeutic_approach_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test getting a specific professional therapeutic approach successfully."""
        # Create a professional and therapeutic approach in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a therapeutic approach
        therapeutic_approach = TherapeuticApproach(
            name="Test Dialectical Behavior Therapy",
            description="A type of therapy that combines cognitive-behavioral techniques with mindfulness",
            category="psychotherapy",
        )
        db_session.add(therapeutic_approach)
        db_session.commit()
        db_session.refresh(therapeutic_approach)

        # Create a professional therapeutic approach relationship
        professional_therapeutic_approach = ProfessionalTherapeuticApproach(
            professional_id=professional["id"], therapeutic_approach_id=str(therapeutic_approach.id)
        )
        db_session.add(professional_therapeutic_approach)
        db_session.commit()
        db_session.refresh(professional_therapeutic_approach)

        # Test getting specific professional therapeutic approach
        response = client.get(f"/api/v1/professional-therapeutic-approaches/{professional_therapeutic_approach.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(professional_therapeutic_approach.id)
        assert data["professional_id"] == professional["id"]
        assert data["therapeutic_approach_id"] == str(therapeutic_approach.id)

    def test_get_professional_therapeutic_approach_not_found(self, client: TestClient):
        """Test getting a professional therapeutic approach that doesn't exist."""
        # Test getting non-existent professional therapeutic approach
        response = client.get("/api/v1/professional-therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404
        data = response.json()
        assert "Professional therapeutic approach not found" in data["detail"]

    def test_create_professional_therapeutic_approach_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test creating a professional therapeutic approach successfully."""
        # Create a professional and therapeutic approach in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a therapeutic approach
        therapeutic_approach = TherapeuticApproach(
            name="Test Gestalt Therapy",
            description="A form of psychotherapy that focuses on the present moment",
            category="psychotherapy",
        )
        db_session.add(therapeutic_approach)
        db_session.commit()
        db_session.refresh(therapeutic_approach)

        # Test creating professional therapeutic approach
        professional_therapeutic_approach_data = {
            "professional_id": professional["id"],
            "therapeutic_approach_id": str(therapeutic_approach.id),
        }

        response = client.post(
            "/api/v1/professional-therapeutic-approaches/", json=professional_therapeutic_approach_data
        )

        assert response.status_code == 201
        data = response.json()
        assert data["professional_id"] == professional["id"]
        assert data["therapeutic_approach_id"] == str(therapeutic_approach.id)
        assert "id" in data

        # Verify the professional therapeutic approach was created in the database
        created_pta = (
            db_session.query(ProfessionalTherapeuticApproach)
            .filter(
                ProfessionalTherapeuticApproach.professional_id == professional["id"],
                ProfessionalTherapeuticApproach.therapeutic_approach_id == str(therapeutic_approach.id),
            )
            .first()
        )
        assert created_pta is not None

    def test_update_professional_therapeutic_approach_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test updating a professional therapeutic approach successfully."""
        # Create a professional and therapeutic approaches in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create therapeutic approaches
        therapeutic_approach1 = TherapeuticApproach(
            name="Test EMDR Therapy",
            description="Eye Movement Desensitization and Reprocessing therapy",
            category="trauma_therapy",
        )
        therapeutic_approach2 = TherapeuticApproach(
            name="Test Somatic Therapy",
            description="A form of therapy that focuses on the body",
            category="body_therapy",
        )
        db_session.add(therapeutic_approach1)
        db_session.add(therapeutic_approach2)
        db_session.commit()
        db_session.refresh(therapeutic_approach1)
        db_session.refresh(therapeutic_approach2)

        # Create a professional therapeutic approach relationship
        professional_therapeutic_approach = ProfessionalTherapeuticApproach(
            professional_id=professional["id"], therapeutic_approach_id=str(therapeutic_approach1.id)
        )
        db_session.add(professional_therapeutic_approach)
        db_session.commit()
        db_session.refresh(professional_therapeutic_approach)

        # Test updating professional therapeutic approach
        update_data = {"therapeutic_approach_id": str(therapeutic_approach2.id)}

        response = client.put(
            f"/api/v1/professional-therapeutic-approaches/{professional_therapeutic_approach.id}", json=update_data
        )

        assert response.status_code == 200
        data = response.json()
        assert data["professional_id"] == professional["id"]
        assert data["therapeutic_approach_id"] == str(therapeutic_approach2.id)

        # Verify the professional therapeutic approach was updated in the database
        db_session.commit()  # Ensure any pending changes are committed
        updated_pta = (
            db_session.query(ProfessionalTherapeuticApproach)
            .filter(ProfessionalTherapeuticApproach.id == professional_therapeutic_approach.id)
            .first()
        )
        assert updated_pta.therapeutic_approach_id == therapeutic_approach2.id

    def test_update_professional_therapeutic_approach_not_found(self, client: TestClient):
        """Test updating a professional therapeutic approach that doesn't exist."""
        # Test updating non-existent professional therapeutic approach
        update_data = {"therapeutic_approach_id": "550e8400-e29b-41d4-a716-446655440001"}

        response = client.put(
            "/api/v1/professional-therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000", json=update_data
        )

        assert response.status_code == 404
        data = response.json()
        assert "Professional therapeutic approach not found" in data["detail"]

    def test_delete_professional_therapeutic_approach_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test deleting a professional therapeutic approach successfully."""
        # Create a professional and therapeutic approach in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create a therapeutic approach
        therapeutic_approach = TherapeuticApproach(
            name="Test Art Therapy",
            description="A form of psychotherapy that uses art as a medium for expression",
            category="creative_therapy",
        )
        db_session.add(therapeutic_approach)
        db_session.commit()
        db_session.refresh(therapeutic_approach)

        # Create a professional therapeutic approach relationship
        professional_therapeutic_approach = ProfessionalTherapeuticApproach(
            professional_id=professional["id"], therapeutic_approach_id=str(therapeutic_approach.id)
        )
        db_session.add(professional_therapeutic_approach)
        db_session.commit()
        db_session.refresh(professional_therapeutic_approach)

        # Test deleting professional therapeutic approach
        response = client.delete(f"/api/v1/professional-therapeutic-approaches/{professional_therapeutic_approach.id}")

        assert response.status_code == 204

        # Verify the professional therapeutic approach was deleted from the database
        deleted_pta = (
            db_session.query(ProfessionalTherapeuticApproach)
            .filter(ProfessionalTherapeuticApproach.id == professional_therapeutic_approach.id)
            .first()
        )
        assert deleted_pta is None

    def test_delete_professional_therapeutic_approach_not_found(self, client: TestClient):
        """Test deleting a professional therapeutic approach that doesn't exist."""
        # Test deleting non-existent professional therapeutic approach
        response = client.delete("/api/v1/professional-therapeutic-approaches/550e8400-e29b-41d4-a716-446655440000")

        assert response.status_code == 404
        data = response.json()
        assert "Professional therapeutic approach not found" in data["detail"]

    def test_update_professional_therapeutic_approaches_success(
        self, client: TestClient, db_session: Session, test_data_factory
    ):
        """Test updating multiple professional therapeutic approaches successfully."""
        # Create a professional and therapeutic approaches in the database
        professional_data = test_data_factory["professional"]("test_professional")

        # Register professional
        response = client.post("/api/v1/auth/register/professional", json=professional_data)
        assert response.status_code == 201
        professional = response.json()

        # Create therapeutic approaches
        therapeutic_approach1 = TherapeuticApproach(
            name="Test Music Therapy",
            description="A form of therapy that uses music to address physical and emotional needs",
            category="creative_therapy",
        )
        therapeutic_approach2 = TherapeuticApproach(
            name="Test Drama Therapy",
            description="A form of therapy that uses drama and theater techniques",
            category="creative_therapy",
        )
        therapeutic_approach3 = TherapeuticApproach(
            name="Test Dance Therapy",
            description="A form of therapy that uses movement and dance",
            category="creative_therapy",
        )
        db_session.add(therapeutic_approach1)
        db_session.add(therapeutic_approach2)
        db_session.add(therapeutic_approach3)
        db_session.commit()
        db_session.refresh(therapeutic_approach1)
        db_session.refresh(therapeutic_approach2)
        db_session.refresh(therapeutic_approach3)

        # Test updating professional therapeutic approaches with multiple approach IDs
        approach_ids = [str(therapeutic_approach1.id), str(therapeutic_approach2.id), str(therapeutic_approach3.id)]

        url = (
            f"/api/v1/professional-therapeutic-approaches/professional/{professional['id']}/approaches"
            f"?approach_ids={','.join(approach_ids)}"
        )
        response = client.put(url)

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Updated 3 therapeutic approaches" in data["message"]

        # Verify the professional therapeutic approaches were created in the database
        created_ptas = (
            db_session.query(ProfessionalTherapeuticApproach)
            .filter(ProfessionalTherapeuticApproach.professional_id == professional["id"])
            .all()
        )
        assert len(created_ptas) == 3

        # Verify all therapeutic approach IDs are present
        created_approach_ids = [pta.therapeutic_approach_id for pta in created_ptas]
        for approach_id in approach_ids:
            assert approach_id in [str(aid) for aid in created_approach_ids]
