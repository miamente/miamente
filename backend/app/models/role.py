"""
Role model for the Miamente platform.
"""

import uuid

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Role(Base, TimestampMixin):
    """Role model for account types (user, professional, admin)."""

    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    accounts = relationship("Account", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>"
