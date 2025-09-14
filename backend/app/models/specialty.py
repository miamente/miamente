"""
Specialty model for the Miamente platform.
"""
from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Specialty(Base):
    """Specialty model."""
    
    __tablename__ = "specialties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    default_price_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="COP", nullable=False)
    category = Column(String(100), nullable=False)
    
    def __repr__(self):
        return f"<Specialty(id={self.id}, name={self.name}, category={self.category})>"
