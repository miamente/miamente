"""
Professional Specialty model for the Miamente platform.
"""
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class ProfessionalSpecialty(Base):
    """Professional Specialty model - Many-to-many relationship between professionals and specialties."""
    
    __tablename__ = "professional_specialties_new"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    specialty_id = Column(UUID(as_uuid=True), ForeignKey("specialties_new.id"), nullable=False)
    
    created_at = Column(String(255), server_default=func.now())
    
    # Relationships
    professional = relationship("app.models.professional.Professional", back_populates="professional_specialties_new")
    specialty = relationship("app.models.specialty_new.Specialty", foreign_keys=[specialty_id])
    
    def __repr__(self):
        return f"<ProfessionalSpecialty(id={self.id}, professional_id={self.professional_id}, specialty_id={self.specialty_id})>"
