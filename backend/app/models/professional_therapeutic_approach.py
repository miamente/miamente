"""
Professional Therapeutic Approach model - Junction table for professional-therapeutic approach relationships.

This model manages the many-to-many relationship between professionals and their
therapeutic approaches, allowing professionals to specialize in multiple approaches.
"""

from sqlalchemy import Boolean, Column, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import BaseJunctionModelMixin, TimestampMixin


class ProfessionalTherapeuticApproach(Base, BaseJunctionModelMixin, TimestampMixin):
    """
    Professional Therapeutic Approach model - Many-to-many relationship between
    accounts (professionals) and therapeutic approaches.

    Note: professional_id now references accounts.id instead of professionals.id
    to support the unified account system.
    """

    __tablename__ = "professional_therapeutic_approaches"

    therapeutic_approach_id = Column(UUID(as_uuid=True), ForeignKey("therapeutic_approaches.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    # Changed to reference Account model instead of Professional
    account = relationship("app.models.account.Account", foreign_keys="ProfessionalTherapeuticApproach.professional_id")
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
