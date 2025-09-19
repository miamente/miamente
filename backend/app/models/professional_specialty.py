"""
Professional Specialty model for the Miamente platform.
"""

import uuid

from sqlalchemy import Column, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProfessionalSpecialty(Base):
    """Professional–Specialty link: many-to-many relationship between professionals and specialties."""

    __tablename__ = "professional_specialties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    specialty_id = Column(UUID(as_uuid=True), ForeignKey("specialties.id"), nullable=False)

    # Proper timestamp type + SQL-standard default (avoids pylint E1102)
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

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
