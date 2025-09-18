"""
Modality service for managing intervention modalities.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.modality import Modality
from app.schemas.modality import ModalityCreate, ModalityUpdate


class ModalityService:
    """Service for managing modalities."""

    def __init__(self, db: Session):
        self.db = db

    def get_modality(self, modality_id: str) -> Optional[Modality]:
        """Get a modality by ID."""
        return self.db.query(Modality).filter(Modality.id == modality_id).first()

    def get_modalities(self, skip: int = 0, limit: int = 100) -> List[Modality]:
        """Get all modalities."""
        return self.db.query(Modality).offset(skip).limit(limit).all()

    def get_modalities_by_category(self, category: str) -> List[Modality]:
        """Get modalities by category."""
        return self.db.query(Modality).filter(Modality.category == category).all()

    def create_modality(self, modality: ModalityCreate) -> Modality:
        """Create a new modality."""
        db_modality = Modality(**modality.dict())
        self.db.add(db_modality)
        self.db.commit()
        self.db.refresh(db_modality)
        return db_modality

    def update_modality(self, modality_id: str, modality_update: ModalityUpdate) -> Optional[Modality]:
        """Update a modality."""
        db_modality = self.get_modality(modality_id)
        if not db_modality:
            return None

        update_data = modality_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_modality, field, value)

        self.db.commit()
        self.db.refresh(db_modality)
        return db_modality

    def delete_modality(self, modality_id: str) -> bool:
        """Delete a modality."""
        db_modality = self.get_modality(modality_id)
        if not db_modality:
            return False

        self.db.delete(db_modality)
        self.db.commit()
        return True
