"""
Payment schemas.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentStatus, PaymentProvider
import uuid


class PaymentBase(BaseModel):
    """Base payment schema."""
    appointment_id: uuid.UUID
    amount_cents: int
    currency: str = "COP"
    provider: PaymentProvider = PaymentProvider.MOCK
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    """Payment creation schema."""
    pass


class PaymentUpdate(BaseModel):
    """Payment update schema."""
    status: Optional[PaymentStatus] = None
    provider_payment_id: Optional[str] = None
    provider_transaction_id: Optional[str] = None
    provider_response: Optional[Dict[str, Any]] = None
    processed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None


class PaymentResponse(PaymentBase):
    """Payment response schema."""
    id: uuid.UUID
    user_id: uuid.UUID
    status: PaymentStatus
    provider_payment_id: Optional[str] = None
    provider_transaction_id: Optional[str] = None
    provider_response: Optional[Dict[str, Any]] = None
    payment_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
class PaymentIntentRequest(BaseModel):
    """Payment intent request schema."""
    appointment_id: uuid.UUID
    amount_cents: int
    currency: str = "COP"


class PaymentIntentResponse(BaseModel):
    """Payment intent response schema."""
    payment_intent_id: str
    client_secret: Optional[str] = None
    status: str
    amount_cents: int
    currency: str
