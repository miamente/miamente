"""
Professional Therapeutic Approach model - Junction table for professional-therapeutic approach relationships.

This model manages the many-to-many relationship between professionals and their
therapeutic approaches, allowing professionals to specialize in multiple approaches.
"""

import uuid

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class ProfessionalTherapeuticApproach(Base, TimestampMixin):
    """Professional Therapeutic Approach model - Many-to-many relationship between profe
    ssionals and
    therapeutic approaches."""

    __tablename__ = "professional_therapeutic_approaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professionals.id"), nullable=False)
    therapeutic_approach_id = Column(UUID(as_uuid=True), ForeignKey("therapeutic_approaches.id"), nullable=False)

    # Relationships
    professional = relationship(
        "app.models.professional.Professional",
        back_populates="therapeutic_approaches",
    )
    therapeutic_approach = relationship(
        "app.models.therapeutic_approach.TherapeuticApproach",
        foreign_keys=[therapeutic_approach_id],
    )

    def __repr__(self):
        return (
            f"<ProfessionalTherapeuticApproach("
            f"id={self.id}, "
            f"professional_id={self.professional_id}, "
            f"therapeutic_approach_id={self.therapeutic_approach_id}"
            f")>"
        )
