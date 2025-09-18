"""
Therapeutic Approach model for the Miamente platform.
"""

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

import uuid

from app.core.database import Base

class TherapeuticApproach(Base):
    """Therapeutic Approach model - Theoretical and methodological currents."""

    __tablename__ = "therapeutic_approaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)  # Optional description for reference
    category = Column(String(100), nullable=True)  # Optional category grouping

    created_at = Column(String(255), server_default=func.now())
    updated_at = Column(String(255), onupdate=func.now())

    def __repr__(self):
        return f"<TherapeuticApproach(id={self.id}, name={self.name})>"
