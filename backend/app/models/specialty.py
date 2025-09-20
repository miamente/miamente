"""
Specialty model for the Miamente platform.
"""

import uuid

from sqlalchemy import Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Specialty(Base):
    """Specialty model - Academic or regulated professional fields."""

    __tablename__ = "specialties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100), nullable=True)  # Optional category grouping

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
        return f"<Specialty(id={self.id}, name={self.name})>"
