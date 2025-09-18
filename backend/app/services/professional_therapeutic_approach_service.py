"""
Professional therapeutic approach service for managing professional therapeutic approach
    es.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.professional_therapeutic_approach import ProfessionalTherapeuticApproach
from app.schemas.professional_therapeutic_approach import (
    ProfessionalTherapeuticApproachCreate,
    ProfessionalTherapeuticApproachUpdate,
)


class ProfessionalTherapeuticApproachService:
    """Service for managing professional therapeutic approaches."""

    def __init__(self, db: Session):
        self.db = db

    def get_professional_therapeutic_approach(
        self, approach_id: str
    ) -> Optional[ProfessionalTherapeuticApproach]:
        """Get a professional therapeutic approach by ID."""
        return (
            self.db.query(ProfessionalTherapeuticApproach)
            .filter(ProfessionalTherapeuticApproach.id == approach_id)
            .first()
        )

    def get_professional_therapeutic_approaches(
        self, professional_id: str
    ) -> List[ProfessionalTherapeuticApproach]:
        """Get all therapeutic approaches for a professional."""
        return (
            self.db.query(ProfessionalTherapeuticApproach)
            .filter(ProfessionalTherapeuticApproach.professional_id == professional_id)
            .all()
        )

    def create_professional_therapeutic_approach(
        self, approach: ProfessionalTherapeuticApproachCreate
    ) -> ProfessionalTherapeuticApproach:
        """Create a new professional therapeutic approach."""
        db_approach = ProfessionalTherapeuticApproach(**approach.dict())
        self.db.add(db_approach)
        self.db.commit()
        self.db.refresh(db_approach)
        return db_approach

    def update_professional_therapeutic_approach(
        self, approach_id: str, approach_update: ProfessionalTherapeuticApproachUpdate
    ) -> Optional[ProfessionalTherapeuticApproach]:
        """Update a professional therapeutic approach."""
        db_approach = self.get_professional_therapeutic_approach(approach_id)
        if not db_approach:
            return None

        update_data = approach_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_approach, field, value)

        self.db.commit()
        self.db.refresh(db_approach)
        return db_approach

    def delete_professional_therapeutic_approach(self, approach_id: str) -> bool:
        """Delete a professional therapeutic approach."""
        db_approach = self.get_professional_therapeutic_approach(approach_id)
        if not db_approach:
            return False

        self.db.delete(db_approach)
        self.db.commit()
        return True

    def add_therapeutic_approaches_to_professional(
        self, professional_id: str, approach_ids: List[str]
    ) -> List[ProfessionalTherapeuticApproach]:
        """Add multiple therapeutic approaches to a professional."""
        # Remove existing therapeutic approaches for this professional
        self.db.query(ProfessionalTherapeuticApproach).filter(
            ProfessionalTherapeuticApproach.professional_id == professional_id
        ).delete()

        # Add new therapeutic approaches
        new_approaches = []
        for approach_id in approach_ids:
            approach = ProfessionalTherapeuticApproachCreate(
                professional_id=professional_id, therapeutic_approach_id=approach_id
            )
            db_approach = ProfessionalTherapeuticApproach(**approach.dict())
            self.db.add(db_approach)
            new_approaches.append(db_approach)

        self.db.commit()
        for approach in new_approaches:
            self.db.refresh(approach)

        return new_approaches
