"""
Specialty model for the Miamente platform.
"""

from app.core.database import Base
from app.models.mixins import BaseNamedModelMixin, TimestampMixin


class Specialty(Base, BaseNamedModelMixin, TimestampMixin):
    """Specialty model - Academic or regulated professional fields."""

    __tablename__ = "specialties"
