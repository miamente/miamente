"""
Professional service for business logic.
"""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.professional import Professional
from app.schemas.professional import ProfessionalUpdate
from app.services.professional_modality_service import ProfessionalModalityService
from app.services.professional_specialty_new_service import (
    ProfessionalSpecialtyNewService,
)
from app.services.professional_therapeutic_approach_service import (
    ProfessionalTherapeuticApproachService,
)


class ProfessionalService:
    """Professional service."""

    def __init__(self, db: Session):
        self.db = db
        self.specialty_service = ProfessionalSpecialtyNewService(db)
        self.therapeutic_approach_service = ProfessionalTherapeuticApproachService(db)
        self.modality_service = ProfessionalModalityService(db)

    def get_professional_by_id(self, professional_id: str) -> Optional[Professional]:
        """Get professional by ID."""
        return (
            self.db.query(Professional)
            .filter(Professional.id == professional_id)
            .first()
        )

    def get_professional_by_email(self, email: str) -> Optional[Professional]:
        """Get professional by email."""
        return self.db.query(Professional).filter(Professional.email == email).first()

    def get_professionals(self, skip: int = 0, limit: int = 100) -> List[Professional]:
        """Get all active professionals."""
        return (
            self.db.query(Professional)
            .filter(Professional.is_active)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_professionals_by_specialty(self, specialty: str) -> List[Professional]:
        """Get professionals by specialty."""
        return (
            self.db.query(Professional)
            .filter(
                Professional.specialty.ilike(f"%{specialty}%"),
                Professional.is_active,
            )
            .all()
        )

    def update_professional(
        self, professional_id: str, update_data: ProfessionalUpdate
    ) -> Optional[Professional]:
        """Update professional."""
        professional = self.get_professional_by_id(professional_id)
        if not professional:
            return None

        try:
            # Handle new specialty_ids field
            if update_data.specialty_ids is not None:
                self.specialty_service.add_specialties_to_professional(
                    professional_id, update_data.specialty_ids
                )

            # Handle new modality_ids field (this would need to be implemented based on requirements)
            # if update_data.modality_ids is not None:
            #     self.modality_service.add_modalities_to_professional(professional_id, update_data.modality_ids)

            # Update other fields (excluding the new relationship fields)
            update_dict = update_data.dict(exclude_unset=True)
            update_dict.pop("specialty_ids", None)
            update_dict.pop("modality_ids", None)

            for field, value in update_dict.items():
                setattr(professional, field, value)

            self.db.commit()
            self.db.refresh(professional)
            return professional

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update professional",
            )

    def deactivate_professional(self, professional_id: str) -> bool:
        """Deactivate professional."""
        professional = self.get_professional_by_id(professional_id)
        if not professional:
            return False

        try:
            professional.is_active = False
            self.db.commit()
            return True

        except Exception:
            self.db.rollback()
            return False
