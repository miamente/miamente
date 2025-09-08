"""
Professional service for business logic.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.professional import Professional
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate


class ProfessionalService:
    """Professional service."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_professional_by_id(self, professional_id: str) -> Optional[Professional]:
        """Get professional by ID."""
        return self.db.query(Professional).filter(Professional.id == professional_id).first()
    
    def get_professional_by_email(self, email: str) -> Optional[Professional]:
        """Get professional by email."""
        return self.db.query(Professional).filter(Professional.email == email).first()
    
    def get_professionals(self, skip: int = 0, limit: int = 100) -> List[Professional]:
        """Get all active professionals."""
        return self.db.query(Professional).filter(
            Professional.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_professionals_by_specialty(self, specialty: str) -> List[Professional]:
        """Get professionals by specialty."""
        return self.db.query(Professional).filter(
            Professional.specialty.ilike(f"%{specialty}%"),
            Professional.is_active == True
        ).all()
    
    def update_professional(self, professional_id: str, update_data: ProfessionalUpdate) -> Optional[Professional]:
        """Update professional."""
        professional = self.get_professional_by_id(professional_id)
        if not professional:
            return None
        
        try:
            # Update fields
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(professional, field, value)
            
            self.db.commit()
            self.db.refresh(professional)
            return professional
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update professional"
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
            
        except Exception as e:
            self.db.rollback()
            return False
