"""
Specialty model for the Miamente platform.
"""

import uuid
from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Specialty(Base, TimestampMixin):
    """Specialty model - Academic or regulated professional fields."""

    __tablename__ = "specialties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
