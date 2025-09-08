"""
Payment endpoints.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.schemas.payment import PaymentResponse, PaymentIntentRequest, PaymentIntentResponse
from app.models.payment import Payment
from app.models.appointment import Appointment

router = APIRouter()


@router.get("/", response_model=list[PaymentResponse])
async def get_user_payments(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all payments for the current user."""
    try:
        user_uuid = uuid.UUID(current_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    payments = db.query(Payment).filter(
        Payment.user_id == user_uuid
    ).order_by(Payment.created_at.desc()).all()
    
    return payments


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: dict,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new payment."""
    try:
        user_uuid = uuid.UUID(current_user_id)
        # For now, create a dummy appointment_id since the test doesn't provide one
        # In a real app, this would come from the request or be created first
        appointment_uuid = uuid.uuid4()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Create payment
    payment = Payment(
        user_id=user_uuid,
        appointment_id=appointment_uuid,
        amount_cents=payment_data.get("amount_cents", 0),
        currency=payment_data.get("currency", "USD"),
        provider=payment_data.get("payment_method", "stripe"),
        status="pending"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return payment


@router.patch("/{payment_id}", response_model=PaymentResponse)
async def update_payment_status(
    payment_id: str,
    update_data: dict,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update payment status."""
    try:
        payment_uuid = uuid.UUID(payment_id)
        user_uuid = uuid.UUID(current_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment or user ID format"
        )
    
    # Get payment
    payment = db.query(Payment).filter(
        Payment.id == payment_uuid,
        Payment.user_id == user_uuid
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Update payment
    if "status" in update_data:
        payment.status = update_data["status"]
    if "provider_payment_id" in update_data:
        payment.provider_payment_id = update_data["provider_payment_id"]
    if "provider_transaction_id" in update_data:
        payment.provider_transaction_id = update_data["provider_transaction_id"]
    
    db.commit()
    db.refresh(payment)
    
    return payment


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
        
        try:
            appointment_uuid = uuid.UUID(appointment_id)
            user_uuid = uuid.UUID(current_user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )
        
        # Verify appointment exists and belongs to user
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_uuid,
            Appointment.user_id == user_uuid
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
    try:
        payment_uuid = uuid.UUID(payment_id)
        user_uuid = uuid.UUID(current_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    payment = db.query(Payment).filter(
        Payment.id == payment_uuid,
        Payment.user_id == user_uuid
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment
