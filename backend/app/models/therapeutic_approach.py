"""
Therapeutic Approach model - Defines theoretical and methodological currents in therapy.

This model represents the different therapeutic approaches available in the platform,
such as Cognitive Behavioral Therapy, Psychoanalysis, etc.
"""

import uuid

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.mixins import TimestampMixin


class TherapeuticApproach(Base, TimestampMixin):
    """Therapeutic Approach model - Theoretical and methodological currents."""

    __tablename__ = "therapeutic_approaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)  # Optional description for reference
    category = Column(String(100), nullable=True)  # Optional category grouping

    def __repr__(self) -> str:
        return f"<TherapeuticApproach(id={self.id}, name={self.name})>"
