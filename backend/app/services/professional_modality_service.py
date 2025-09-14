"""
Professional modality service for managing professional modalities.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.professional_modality import ProfessionalModality
from app.schemas.professional_modality import ProfessionalModalityCreate, ProfessionalModalityUpdate


class ProfessionalModalityService:
    """Service for managing professional modalities."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_professional_modality(self, modality_id: str) -> Optional[ProfessionalModality]:
        """Get a professional modality by ID."""
        return self.db.query(ProfessionalModality).filter(ProfessionalModality.id == modality_id).first()
    
    def get_professional_modalities(self, professional_id: str) -> List[ProfessionalModality]:
        """Get all modalities for a professional."""
        return self.db.query(ProfessionalModality).filter(
            ProfessionalModality.professional_id == professional_id,
            ProfessionalModality.is_active == True
        ).all()
    
    def get_default_professional_modality(self, professional_id: str) -> Optional[ProfessionalModality]:
        """Get the default modality for a professional."""
        return self.db.query(ProfessionalModality).filter(
            ProfessionalModality.professional_id == professional_id,
            ProfessionalModality.is_default == True,
            ProfessionalModality.is_active == True
        ).first()
    
    def create_professional_modality(self, modality: ProfessionalModalityCreate) -> ProfessionalModality:
        """Create a new professional modality."""
        # If this is being marked as default, remove default flag from other modalities
        if modality.is_default:
            self.db.query(ProfessionalModality).filter(
                ProfessionalModality.professional_id == modality.professional_id,
                ProfessionalModality.is_default == True
            ).update({"is_default": False})
        
        db_modality = ProfessionalModality(**modality.dict())
        self.db.add(db_modality)
        self.db.commit()
        self.db.refresh(db_modality)
        return db_modality
    
    def update_professional_modality(self, modality_id: str, modality_update: ProfessionalModalityUpdate) -> Optional[ProfessionalModality]:
        """Update a professional modality."""
        db_modality = self.get_professional_modality(modality_id)
        if not db_modality:
            return None
        
        # If this is being marked as default, remove default flag from other modalities
        if modality_update.is_default:
            self.db.query(ProfessionalModality).filter(
                ProfessionalModality.professional_id == db_modality.professional_id,
                ProfessionalModality.id != modality_id,
                ProfessionalModality.is_default == True
            ).update({"is_default": False})
        
        update_data = modality_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_modality, field, value)
        
        self.db.commit()
        self.db.refresh(db_modality)
        return db_modality
    
    def delete_professional_modality(self, modality_id: str) -> bool:
        """Delete a professional modality."""
        db_modality = self.get_professional_modality(modality_id)
        if not db_modality:
            return False
        
        # If this was the default modality, we need to set another one as default
        if db_modality.is_default:
            other_modalities = self.db.query(ProfessionalModality).filter(
                ProfessionalModality.professional_id == db_modality.professional_id,
                ProfessionalModality.id != modality_id,
                ProfessionalModality.is_active == True
            ).all()
            
            if other_modalities:
                other_modalities[0].is_default = True
                self.db.commit()
        
        self.db.delete(db_modality)
        self.db.commit()
        return True
    
    def set_default_modality(self, professional_id: str, modality_id: str) -> bool:
        """Set a modality as default for a professional."""
        # Remove default flag from all modalities for this professional
        self.db.query(ProfessionalModality).filter(
            ProfessionalModality.professional_id == professional_id,
            ProfessionalModality.is_default == True
        ).update({"is_default": False})
        
        # Set the specified modality as default
        result = self.db.query(ProfessionalModality).filter(
            ProfessionalModality.id == modality_id,
            ProfessionalModality.professional_id == professional_id
        ).update({"is_default": True})
        
        self.db.commit()
        return result > 0
