"""
Professional Specialty model for the Miamente platform.
"""

from sqlalchemy import Boolean, Column, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import BaseJunctionModelMixin, TimestampMixin


class ProfessionalSpecialty(Base, BaseJunctionModelMixin, TimestampMixin):
    """Professional–Specialty link: many-to-many relationship between professionals and specialties."""

    __tablename__ = "professional_specialties"

    specialty_id = Column(UUID(as_uuid=True), ForeignKey("specialties.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    professional = relationship(
        "app.models.professional.Professional",
        back_populates="professional_specialties",
    )
    specialty = relationship("app.models.specialty.Specialty", foreign_keys=[specialty_id])

    def __repr__(self):
        return (
            f"<ProfessionalSpecialty("
            f"id={self.id}, "
            f"professional_id={self.professional_id}, "
            f"specialty_id={self.specialty_id}"
            f")>"
        )
