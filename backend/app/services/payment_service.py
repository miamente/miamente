"""
Payment service for business logic.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.models.appointment import Appointment
from app.schemas.payment import PaymentCreate


class PaymentService:
    """Payment service."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_payment_by_id(self, payment_id: str) -> Optional[Payment]:
        """Get payment by ID."""
        return self.db.query(Payment).filter(Payment.id == payment_id).first()
    
    def get_payment_by_appointment(self, appointment_id: str) -> Optional[Payment]:
        """Get payment by appointment ID."""
        return self.db.query(Payment).filter(Payment.appointment_id == appointment_id).first()
    
    def create_payment(self, payment_data: PaymentCreate) -> Payment:
        """Create payment record."""
        try:
            payment = Payment(**payment_data.dict())
            self.db.add(payment)
            self.db.commit()
            self.db.refresh(payment)
            return payment
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment"
            )
    
    def update_payment_status(self, payment_id: str, status: PaymentStatus) -> bool:
        """Update payment status."""
        payment = self.get_payment_by_id(payment_id)
        if not payment:
            return False
        
        try:
            payment.status = status
            
            if status == PaymentStatus.COMPLETED:
                payment.processed_at = datetime.utcnow()
            elif status == PaymentStatus.FAILED:
                payment.failed_at = datetime.utcnow()
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            return False
    
    def process_payment(self, appointment_id: str, payment_intent_id: str) -> Optional[Payment]:
        """Process payment for an appointment."""
        try:
            # Get appointment
            appointment = self.db.query(Appointment).filter(
                Appointment.id == appointment_id
            ).first()
            
            if not appointment:
                return None
            
            # Create payment record
            payment = Payment(
                appointment_id=appointment.id,
                user_id=appointment.user_id,
                amount_cents=appointment.payment_amount_cents,
                currency=appointment.payment_currency,
                provider=PaymentProvider.MOCK,
                status=PaymentStatus.COMPLETED,
                provider_payment_id=payment_intent_id,
                description=f"Payment for appointment {appointment.id}",
                processed_at=datetime.utcnow()
            )
            
            self.db.add(payment)
            
            # Update appointment
            appointment.paid = True
            appointment.payment_status = "completed"
            
            self.db.commit()
            self.db.refresh(payment)
            return payment
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process payment"
            )
    
    def refund_payment(self, payment_id: str) -> bool:
        """Refund payment."""
        payment = self.get_payment_by_id(payment_id)
        if not payment:
            return False
        
        try:
            payment.status = PaymentStatus.REFUNDED
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            return False
