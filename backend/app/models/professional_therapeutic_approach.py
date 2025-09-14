"""
Professional Therapeutic Approach model for the Miamente platform.
"""
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class ProfessionalTherapeuticApproach(Base):
    """Professional Therapeutic Approach model - Many-to-many relationship between professionals and therapeutic approaches."""
    
    __tablename__ = "professional_therapeutic_approaches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    therapeutic_approach_id = Column(UUID(as_uuid=True), ForeignKey("therapeutic_approaches.id"), nullable=False)
    
    created_at = Column(String(255), server_default=func.now())
    
    # Relationships
    professional = relationship("app.models.professional.Professional", back_populates="professional_therapeutic_approaches")
    therapeutic_approach = relationship("app.models.therapeutic_approach.TherapeuticApproach", foreign_keys=[therapeutic_approach_id])
    
    def __repr__(self):
        return f"<ProfessionalTherapeuticApproach(id={self.id}, professional_id={self.professional_id}, therapeutic_approach_id={self.therapeutic_approach_id})>"
