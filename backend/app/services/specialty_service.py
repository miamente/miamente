"""
Specialty service for managing specialties (new version without price/description).
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.specialty import Specialty
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate


class SpecialtyService:
    """Service for managing specialties (new version)."""

    def __init__(self, db: Session):
        self.db = db

    def get_specialty(self, specialty_id: str) -> Optional[Specialty]:
        """Get a specialty by ID."""
        return self.db.query(Specialty).filter(Specialty.id == specialty_id).first()

    def get_specialties(self, skip: int = 0, limit: int = 100) -> List[Specialty]:
        """Get all specialties."""
        return self.db.query(Specialty).offset(skip).limit(limit).all()

    def get_specialties_by_category(self, category: str) -> List[Specialty]:
        """Get specialties by category."""
        return self.db.query(Specialty).filter(Specialty.category == category).all()

    def create_specialty(self, specialty: SpecialtyCreate) -> Specialty:
        """Create a new specialty."""
        db_specialty = Specialty(**specialty.dict())
        self.db.add(db_specialty)
        self.db.commit()
        self.db.refresh(db_specialty)
        return db_specialty

    def update_specialty(self, specialty_id: str, specialty_update: SpecialtyUpdate) -> Optional[Specialty]:
        """Update a specialty."""
        db_specialty = self.get_specialty(specialty_id)
        if not db_specialty:
            return None

        update_data = specialty_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_specialty, field, value)

        self.db.commit()
        self.db.refresh(db_specialty)
        return db_specialty

    def delete_specialty(self, specialty_id: str) -> bool:
        """Delete a specialty."""
        db_specialty = self.get_specialty(specialty_id)
        if not db_specialty:
            return False

        self.db.delete(db_specialty)
        self.db.commit()
        return True
