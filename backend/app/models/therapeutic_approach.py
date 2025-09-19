"""
Therapeutic Approach model for the Miamente platform.
"""

import uuid

from sqlalchemy import Column, String, Text, DateTime, text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class TherapeuticApproach(Base):
    """Therapeutic Approach model - Theoretical and methodological currents."""

    __tablename__ = "therapeutic_approaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)   # Optional description for reference
    category = Column(String(100), nullable=True)  # Optional category grouping

    # Proper timestamp types with SQL defaults; avoids pylint E1102
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

    def __repr__(self) -> str:
        return f"<TherapeuticApproach(id={self.id}, name={self.name})>"
