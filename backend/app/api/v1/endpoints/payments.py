"""
Payment endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.schemas.payment import PaymentResponse, PaymentIntentRequest, PaymentIntentResponse
from app.models.payment import Payment
from app.models.appointment import Appointment

router = APIRouter()


@router.post("/intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    payment_data: PaymentIntentRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create payment intent for an appointment."""
    # Verify appointment exists and belongs to user
    appointment = db.query(Appointment).filter(
        Appointment.id == payment_data.appointment_id,
        Appointment.user_id == current_user_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verify payment amount matches appointment amount
    if payment_data.amount_cents != appointment.payment_amount_cents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount does not match appointment amount"
        )
    
    try:
        # For now, we'll create a mock payment intent
        # In production, this would integrate with Stripe or another payment provider
        payment_intent_id = f"pi_mock_{appointment.id}"
        
        return PaymentIntentResponse(
            payment_intent_id=payment_intent_id,
            client_secret=f"pi_mock_{appointment.id}_secret",
            status="requires_payment_method",
            amount_cents=payment_data.amount_cents,
            currency=payment_data.currency
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )


@router.post("/confirm/{payment_intent_id}")
async def confirm_payment(
    payment_intent_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Confirm payment for an appointment."""
    try:
        # Extract appointment ID from mock payment intent ID
        if not payment_intent_id.startswith("pi_mock_"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment intent ID"
            )
        
        appointment_id = payment_intent_id.replace("pi_mock_", "")
        
        # Verify appointment exists and belongs to user
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user_id
        ).first()
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        # Update appointment payment status
        appointment.paid = True
        appointment.payment_status = "completed"
        
        # Create payment record
        payment = Payment(
            appointment_id=appointment.id,
            user_id=current_user_id,
            amount_cents=appointment.payment_amount_cents,
            currency=appointment.payment_currency,
            provider="mock",
            status="completed",
            provider_payment_id=payment_intent_id,
            description=f"Payment for appointment {appointment.id}"
        )
        
        db.add(payment)
        db.commit()
        
        return {"message": "Payment confirmed successfully", "payment_id": payment.id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm payment"
        )


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get payment by ID."""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment
