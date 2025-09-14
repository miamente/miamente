"""
Professional specialty service for managing professional specialties (new version).
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.professional_specialty_new import ProfessionalSpecialty
from app.schemas.professional_specialty_new import ProfessionalSpecialtyCreate, ProfessionalSpecialtyUpdate


class ProfessionalSpecialtyNewService:
    """Service for managing professional specialties (new version)."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_professional_specialty(self, specialty_id: str) -> Optional[ProfessionalSpecialty]:
        """Get a professional specialty by ID."""
        return self.db.query(ProfessionalSpecialty).filter(ProfessionalSpecialty.id == specialty_id).first()
    
    def get_professional_specialties(self, professional_id: str) -> List[ProfessionalSpecialty]:
        """Get all specialties for a professional."""
        return self.db.query(ProfessionalSpecialty).filter(
            ProfessionalSpecialty.professional_id == professional_id
        ).all()
    
    def create_professional_specialty(self, specialty: ProfessionalSpecialtyCreate) -> ProfessionalSpecialty:
        """Create a new professional specialty."""
        db_specialty = ProfessionalSpecialty(**specialty.dict())
        self.db.add(db_specialty)
        self.db.commit()
        self.db.refresh(db_specialty)
        return db_specialty
    
    def update_professional_specialty(self, specialty_id: str, specialty_update: ProfessionalSpecialtyUpdate) -> Optional[ProfessionalSpecialty]:
        """Update a professional specialty."""
        db_specialty = self.get_professional_specialty(specialty_id)
        if not db_specialty:
            return None
        
        update_data = specialty_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_specialty, field, value)
        
        self.db.commit()
        self.db.refresh(db_specialty)
        return db_specialty
    
    def delete_professional_specialty(self, specialty_id: str) -> bool:
        """Delete a professional specialty."""
        db_specialty = self.get_professional_specialty(specialty_id)
        if not db_specialty:
            return False
        
        self.db.delete(db_specialty)
        self.db.commit()
        return True
    
    def add_specialties_to_professional(self, professional_id: str, specialty_ids: List[str]) -> List[ProfessionalSpecialty]:
        """Add multiple specialties to a professional."""
        # Remove existing specialties for this professional
        self.db.query(ProfessionalSpecialty).filter(
            ProfessionalSpecialty.professional_id == professional_id
        ).delete()
        
        # Add new specialties
        new_specialties = []
        for specialty_id in specialty_ids:
            specialty = ProfessionalSpecialtyCreate(
                professional_id=professional_id,
                specialty_id=specialty_id
            )
            db_specialty = ProfessionalSpecialty(**specialty.dict())
            self.db.add(db_specialty)
            new_specialties.append(db_specialty)
        
        self.db.commit()
        for specialty in new_specialties:
            self.db.refresh(specialty)
        
        return new_specialties
