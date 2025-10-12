"""
Association between a Professional and a Modality, including pricing/config flags.

Note: This junction table now references accounts.id instead of professionals.id
to support the unified account system.
"""

import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class ProfessionalModality(Base, TimestampMixin):
    """
    Professional modality model for a professional's intervention modalities.

    Note: professional_id now references accounts.id instead of professionals.id
    to support the unified account system.
    """

    __tablename__ = "professional_modalities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    modality_id = Column(UUID(as_uuid=True), ForeignKey("modalities.id"), nullable=False)  # Foreign key to modality
    modality_name = Column(String(255), nullable=False)  # Cached name for convenience
    virtual_price = Column(Integer, nullable=False, default=0)  # Price in cents
    presencial_price = Column(Integer, nullable=False, default=0)  # Price in cents
    offers_presencial = Column(Boolean, default=False, nullable=False)
    description = Column(String(1000), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    # Changed to reference Account model instead of Professional
    account = relationship("app.models.account.Account", foreign_keys=[professional_id])
    modality = relationship("app.models.modality.Modality")

    def __repr__(self) -> str:
        return f"<ProfessionalModality(id={self.id}, modality='{self.modality_name}')>"
