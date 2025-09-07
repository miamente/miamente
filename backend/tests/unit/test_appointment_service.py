"""
Test-specific appointment service that uses test models.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from tests.conftest import AppointmentModel, UserModel, ProfessionalModel
from tests.fixtures.test_appointment import TestAppointmentCreate, TestAppointmentUpdate


class TestAppointmentService:
    """Test appointment service that uses test models."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_appointment(self, appointment_data: TestAppointmentCreate) -> AppointmentModel:
        """Create new appointment."""
        import uuid
        db_appointment = AppointmentModel(
            professional_id=appointment_data.professional_id,
            user_id=appointment_data.user_id,
            availability_id=uuid.uuid4(),  # Generate a temporary availability_id
            start_time=appointment_data.start_time,
            end_time=appointment_data.end_time,
            session_notes=appointment_data.notes,
            status="pending_payment",
            payment_amount_cents=50000
        )
        
        self.db.add(db_appointment)
        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment
    
    def get_appointment_by_id(self, appointment_id: str) -> Optional[AppointmentModel]:
        """Get appointment by ID."""
        return self.db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    
    def get_user_appointments(self, user_id: str) -> List[AppointmentModel]:
        """Get appointments for a user."""
        return self.db.query(AppointmentModel).filter(
            AppointmentModel.user_id == user_id
        ).all()
    
    def get_professional_appointments(self, professional_id: str) -> List[AppointmentModel]:
        """Get appointments for a professional."""
        return self.db.query(AppointmentModel).filter(
            AppointmentModel.professional_id == professional_id
        ).all()
    
    def update_appointment(self, appointment_id: str, update_data: TestAppointmentUpdate) -> Optional[AppointmentModel]:
        """Update appointment."""
        appointment = self.get_appointment_by_id(appointment_id)
        if not appointment:
            return None
        
        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(appointment, field, value)
        
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def cancel_appointment(self, appointment_id: str) -> bool:
        """Cancel appointment."""
        appointment = self.get_appointment_by_id(appointment_id)
        if not appointment:
            return False
        
        appointment.status = "cancelled"
        self.db.commit()
        return True
    
    def complete_appointment(self, appointment_id: str) -> bool:
        """Complete appointment."""
        appointment = self.get_appointment_by_id(appointment_id)
        if not appointment:
            return False
        
        appointment.status = "completed"
        self.db.commit()
        return True
