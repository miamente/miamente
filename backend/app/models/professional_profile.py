"""
ProfessionalProfile model for the Miamente platform - Professional-specific information.
"""

from sqlalchemy import ARRAY, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProfessionalProfile(Base):
    """
    Professional-specific profile information for mental health professionals.
    Linked one-to-one with Account.

    Note: Relationships with specialties, therapeutic approaches, and modalities
    are handled through junction tables (professional_specialties,
    professional_therapeutic_approaches, professional_modalities) that reference
    the account_id.
    """

    __tablename__ = "professional_profiles"

    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), primary_key=True)
    license_number = Column(String(100), nullable=True)
    years_experience = Column(Integer, default=0)
    rate_cents = Column(Integer, nullable=False)
    custom_rate_cents = Column(Integer, nullable=True)
    currency = Column(String(3), default="COP")
    short_description = Column(Text, nullable=True)  # Formerly 'bio'
    academic_experience = Column(Text, nullable=True)  # JSON string
    work_experience = Column(Text, nullable=True)  # JSON string
    certifications = Column(Text, nullable=True)  # JSON string
    languages = Column(ARRAY(String), nullable=True)
    timezone = Column(String(50), default="America/Bogota")
    working_hours = Column(Text, nullable=True)  # JSON string
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_phone_country_code = Column(String(10), nullable=True)
    emergency_phone_number = Column(String(20), nullable=True)

    # Relationships
    account = relationship("Account", back_populates="professional_profile")

    def __repr__(self):
        return f"<ProfessionalProfile(account_id={self.account_id})>"
