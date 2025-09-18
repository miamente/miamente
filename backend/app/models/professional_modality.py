import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ProfessionalModality(Base):
    """Professional modality model for professional's intervention modalities."""

    __tablename__ = "professional_modalities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    modality_id = Column(UUID(as_uuid=True), ForeignKey("modalities.id"), nullable=False)  # Foreign key to modality
    modality_name = Column(String(255), nullable=False)  # Cached name for convenience
    virtual_price = Column(Integer, nullable=False, default=0)  # Price in cents
    presencial_price = Column(Integer, nullable=False, default=0)  # Price in cents
    offers_presencial = Column(Boolean, default=False, nullable=False)
    description = Column(String(1000), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    professional = relationship("app.models.professional.Professional", back_populates="professional_modalities")
    modality = relationship("app.models.modality.Modality")

    def __repr__(self):
        return f"<ProfessionalModality(id={self.id}, modality='{self.modality_name}')>"
