"""Modality model for intervention modalities in Miamente."""

from sqlalchemy import Boolean, Column, Integer, String, Text

from app.core.database import Base
from app.models.mixins import BaseNamedModelMixin, TimestampMixin


class Modality(Base, BaseNamedModelMixin, TimestampMixin):
    """Modality model for intervention modalities."""

    __tablename__ = "modalities"

    description = Column(Text, nullable=True)
    currency = Column(String(3), default="COP", nullable=False)
    default_price_cents = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
