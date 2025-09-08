"""
Test-specific professional service that uses test models.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from tests.conftest import ProfessionalModel
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate


class TestProfessionalService:
    """Test professional service that uses test models."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_professional_by_id(self, professional_id: str) -> Optional[ProfessionalModel]:
        """Get professional by ID."""
        return self.db.query(ProfessionalModel).filter(ProfessionalModel.id == professional_id).first()
    
    def get_professional_by_email(self, email: str) -> Optional[ProfessionalModel]:
        """Get professional by email."""
        return self.db.query(ProfessionalModel).filter(ProfessionalModel.email == email).first()
    
    def get_professionals(self, skip: int = 0, limit: int = 100) -> List[ProfessionalModel]:
        """Get all active professionals."""
        return self.db.query(ProfessionalModel).filter(
            ProfessionalModel.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_professionals_by_specialty(self, specialty: str) -> List[ProfessionalModel]:
        """Get professionals by specialty."""
        return self.db.query(ProfessionalModel).filter(
            ProfessionalModel.specialty.ilike(f"%{specialty}%"),
            ProfessionalModel.is_active == True
        ).all()
    
    def update_professional(self, professional_id: str, update_data: ProfessionalUpdate) -> Optional[ProfessionalModel]:
        """Update professional."""
        professional = self.get_professional_by_id(professional_id)
        if not professional:
            return None
        
        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(professional, field, value)
        
        self.db.commit()
        self.db.refresh(professional)
        return professional
    
    def deactivate_professional(self, professional_id: str) -> bool:
        """Deactivate professional."""
        professional = self.get_professional_by_id(professional_id)
        if not professional:
            return False
        
        professional.is_active = False
        self.db.commit()
        return True
