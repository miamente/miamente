"""Modality model for intervention modalities in Miamente."""

import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Modality(Base):
    """Modality model for intervention modalities."""

    __tablename__ = "modalities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    currency = Column(String(3), default="COP", nullable=False)
    default_price_cents = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Proper timestamps (avoid pylint E1102)
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )

    def __repr__(self):
        return f"<Modality(id={self.id}, name='{self.name}')>"
