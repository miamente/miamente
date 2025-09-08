"""
Payment model for the Miamente platform.
"""
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentProvider(str, enum.Enum):
    """Payment provider enumeration."""
    MOCK = "mock"
    STRIPE = "stripe"
    PAYPAL = "paypal"


class Payment(Base):
    """Payment model."""
    
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="COP")
    provider = Column(Enum(PaymentProvider), default=PaymentProvider.MOCK)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Provider specific information
    provider_payment_id = Column(String(255), nullable=True)
    provider_transaction_id = Column(String(255), nullable=True)
    provider_response = Column(JSONB, nullable=True)
    
    # Payment metadata
    description = Column(Text, nullable=True)
    payment_metadata = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="payment")
    user = relationship("User", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment(id={self.id}, appointment_id={self.appointment_id}, amount_cents={self.amount_cents}, status={self.status})>"
