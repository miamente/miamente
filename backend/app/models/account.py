"""
Account model for the Miamente platform - Unified authentication for all user types.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class Account(Base, TimestampMixin):
    """
    Base account model for all users (regular users, professionals, admins).
    Contains common authentication and profile information.
    """

    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    phone_country_code = Column(String(10), nullable=True)
    phone_number = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(Text, nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    role = relationship("Role", back_populates="accounts")
    user_profile = relationship("UserProfile", back_populates="account", uselist=False, cascade="all, delete-orphan")
    professional_profile = relationship(
        "ProfessionalProfile", back_populates="account", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Account(id={self.id}, email={self.email}, role_id={self.role_id})>"

