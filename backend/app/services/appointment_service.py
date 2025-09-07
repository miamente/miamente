"""
Appointment service.
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.appointment import Appointment, AppointmentStatus
from app.models.availability import Availability, SlotStatus
from app.models.professional import Professional
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.core.config import settings


class AppointmentService:
    """Appointment service."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_appointment(
        self,
        user_id: str,
        professional_id: str,
        start_time: str,
        end_time: str,
        notes: str = ""
    ) -> Appointment:
        """Create a new appointment."""
        try:
            user_uuid = uuid.UUID(user_id)
            professional_uuid = uuid.UUID(professional_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user or professional ID format"
            )
        
        # Parse datetime strings
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid datetime format"
            )
        
        # Verify user and professional exist
        user = self.db.query(User).filter(User.id == user_uuid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        professional = self.db.query(Professional).filter(Professional.id == professional_uuid).first()
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Professional not found"
            )
        
        # Create appointment
        appointment = Appointment(
            user_id=user_uuid,
            professional_id=professional_uuid,
            availability_id=uuid.uuid4(),  # Generate a temporary availability_id
            start_time=start_dt,
            end_time=end_dt,
            session_notes=notes,
            status=AppointmentStatus.PENDING_PAYMENT,
            payment_amount_cents=50000,  # Default amount
            payment_currency="COP"
        )
        
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        
        return appointment
    
    def book_appointment(
        self, 
        user_id: str, 
        professional_id: str, 
        availability_id: str
    ) -> Appointment:
        """Book an appointment with transaction handling."""
        # Start transaction
        try:
            # Get availability slot
            availability = self.db.query(Availability).filter(
                Availability.id == availability_id
            ).first()
            
            if not availability:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Availability slot not found"
                )
            
            # Verify slot belongs to professional
            if availability.professional_id != professional_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slot does not belong to the specified professional"
                )
            
            # Check if slot is available
            if availability.status != SlotStatus.FREE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Slot is no longer available"
                )
            
            # Get professional data
            professional = self.db.query(Professional).filter(
                Professional.id == professional_id
            ).first()
            
            if not professional:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Professional not found"
                )
            
            # Update slot status to held
            availability.status = SlotStatus.HELD
            availability.held_by = user_id
            availability.held_at = datetime.utcnow()
            
            # Create appointment
            appointment = Appointment(
                user_id=user_id,
                professional_id=professional_id,
                availability_id=availability_id,
                start_time=availability.date,
                end_time=availability.date + timedelta(minutes=availability.duration),
                duration=availability.duration,
                timezone=availability.timezone,
                status=AppointmentStatus.PENDING_PAYMENT,
                paid=False,
                payment_amount_cents=professional.rate_cents,
                payment_currency=professional.currency,
                payment_provider=settings.PAYMENT_PROVIDER,
                payment_status="pending",
            )
            
            self.db.add(appointment)
            self.db.commit()
            self.db.refresh(appointment)
            
            return appointment
            
        except Exception as e:
            self.db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to book appointment"
            )
    
    def get_appointment(self, appointment_id: str, user_id: str) -> Optional[Appointment]:
        """Get appointment by ID for a specific user."""
        try:
            appointment_uuid = uuid.UUID(appointment_id)
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return None
        appointment = self.db.query(Appointment).filter(
            and_(
                Appointment.id == appointment_uuid,
                Appointment.user_id == user_uuid
            )
        ).first()
        return appointment
    
    def get_user_appointments(self, user_id: str) -> List[Appointment]:
        """Get all appointments for a user."""
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return []
        return self.db.query(Appointment).filter(
            Appointment.user_id == user_uuid
        ).order_by(Appointment.start_time.desc()).all()
    
    def get_professional_appointments(self, professional_id: str) -> List[Appointment]:
        """Get all appointments for a professional."""
        try:
            professional_uuid = uuid.UUID(professional_id)
        except ValueError:
            return []
        return self.db.query(Appointment).filter(
            Appointment.professional_id == professional_uuid
        ).order_by(Appointment.start_time.desc()).all()
    
    def cancel_appointment(self, appointment_id: str, user_id: str) -> bool:
        """Cancel an appointment."""
        appointment = self.get_appointment(appointment_id, user_id)
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        # Only allow cancellation if not paid
        if appointment.paid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel paid appointments"
            )
        
        try:
            # Update appointment status
            appointment.status = AppointmentStatus.CANCELLED
            appointment.cancelled_at = datetime.utcnow()
            
            # Release the slot
            availability = self.db.query(Availability).filter(
                Availability.id == appointment.availability_id
            ).first()
            
            if availability:
                availability.status = SlotStatus.FREE
                availability.held_by = None
                availability.held_at = None
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel appointment"
            )
    
    def update_appointment(
        self, 
        appointment_id: str, 
        user_id: str, 
        update_data: AppointmentUpdate
    ) -> Optional[Appointment]:
        """Update appointment."""
        appointment = self.get_appointment(appointment_id, user_id)
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        try:
            # Update fields
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(appointment, field, value)
            
            self.db.commit()
            self.db.refresh(appointment)
            return appointment
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update appointment"
            )
    
    def confirm_payment(self, appointment_id: str) -> bool:
        """Confirm payment for an appointment."""
        appointment = self.db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        
        if not appointment:
            return False
        
        try:
            # Update appointment status
            appointment.paid = True
            appointment.status = AppointmentStatus.CONFIRMED
            appointment.payment_status = "completed"
            
            # Update slot status
            availability = self.db.query(Availability).filter(
                Availability.id == appointment.availability_id
            ).first()
            
            if availability:
                availability.status = SlotStatus.BOOKED
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            return False
