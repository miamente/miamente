"""
Specialty model for the Miamente platform.
"""

import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Specialty(Base, TimestampMixin):
    """Specialty model - Academic or regulated professional fields."""

    __tablename__ = "specialties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100), nullable=True)  # Optional category grouping

    def __repr__(self):
        return f"<Specialty(id={self.id}, name={self.name})>"
