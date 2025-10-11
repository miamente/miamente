"""
UserProfile model for the Miamente platform - User-specific information.
"""

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserProfile(Base):
    """
    User-specific profile information for regular users and admins.
    Linked one-to-one with Account.
    """

    __tablename__ = "user_profiles"

    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), primary_key=True)
    date_of_birth = Column(DateTime, nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_phone_country_code = Column(String(10), nullable=True)
    emergency_phone_number = Column(String(20), nullable=True)

    # Relationships
    account = relationship("Account", back_populates="user_profile")

    def __repr__(self):
        return f"<UserProfile(account_id={self.account_id})>"
