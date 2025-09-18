"""
Therapeutic approach service for managing therapeutic approaches.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.therapeutic_approach import TherapeuticApproach
from app.schemas.therapeutic_approach import (
    TherapeuticApproachCreate,
    TherapeuticApproachUpdate,
)


class TherapeuticApproachService:
    """Service for managing therapeutic approaches."""

    def __init__(self, db: Session):
        self.db = db

    def get_therapeutic_approach(
        self, approach_id: str
    ) -> Optional[TherapeuticApproach]:
        """Get a therapeutic approach by ID."""
        return (
            self.db.query(TherapeuticApproach)
            .filter(TherapeuticApproach.id == approach_id)
            .first()
        )

    def get_therapeutic_approaches(
        self, skip: int = 0, limit: int = 100
    ) -> List[TherapeuticApproach]:
        """Get all therapeutic approaches."""
        return self.db.query(TherapeuticApproach).offset(skip).limit(limit).all()

    def get_therapeutic_approaches_by_category(
        self, category: str
    ) -> List[TherapeuticApproach]:
        """Get therapeutic approaches by category."""
        return (
            self.db.query(TherapeuticApproach)
            .filter(TherapeuticApproach.category == category)
            .all()
        )

    def create_therapeutic_approach(
        self, approach: TherapeuticApproachCreate
    ) -> TherapeuticApproach:
        """Create a new therapeutic approach."""
        db_approach = TherapeuticApproach(**approach.dict())
        self.db.add(db_approach)
        self.db.commit()
        self.db.refresh(db_approach)
        return db_approach

    def update_therapeutic_approach(
        self, approach_id: str, approach_update: TherapeuticApproachUpdate
    ) -> Optional[TherapeuticApproach]:
        """Update a therapeutic approach."""
        db_approach = self.get_therapeutic_approach(approach_id)
        if not db_approach:
            return None

        update_data = approach_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_approach, field, value)

        self.db.commit()
        self.db.refresh(db_approach)
        return db_approach

    def delete_therapeutic_approach(self, approach_id: str) -> bool:
        """Delete a therapeutic approach."""
        db_approach = self.get_therapeutic_approach(approach_id)
        if not db_approach:
            return False

        self.db.delete(db_approach)
        self.db.commit()
        return True
