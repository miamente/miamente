"""
User model for the Miamente platform.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    preferences = Column(Text, nullable=True)  # JSON string for user preferences

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

    # Relationships

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, full_name={self.full_name})>"
