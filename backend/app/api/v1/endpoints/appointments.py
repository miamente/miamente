"""
Appointment endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.services.appointment_service import AppointmentService
from app.schemas.appointment import (
    AppointmentResponse, 
    BookAppointmentRequest, 
    BookAppointmentResponse,
    AppointmentUpdate
)

router = APIRouter()


@router.post("/book", response_model=BookAppointmentResponse)
async def book_appointment(
    appointment_data: BookAppointmentRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Book a new appointment."""
    appointment_service = AppointmentService(db)
    
    try:
        appointment = appointment_service.book_appointment(
            user_id=current_user_id,
            professional_id=str(appointment_data.professional_id),
            availability_id=str(appointment_data.availability_id)
        )
        
        return BookAppointmentResponse(
            appointment_id=appointment.id,
            message="Appointment booked successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to book appointment"
        )


@router.get("/", response_model=List[AppointmentResponse])
async def get_user_appointments(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all appointments for the current user."""
    appointment_service = AppointmentService(db)
    appointments = appointment_service.get_user_appointments(current_user_id)
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get appointment by ID."""
    appointment_service = AppointmentService(db)
    appointment = appointment_service.get_appointment(appointment_id, current_user_id)
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update appointment."""
    appointment_service = AppointmentService(db)
    
    try:
        appointment = appointment_service.update_appointment(
            appointment_id=appointment_id,
            user_id=current_user_id,
            update_data=update_data
        )
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        return appointment
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update appointment"
        )


@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Cancel appointment."""
    appointment_service = AppointmentService(db)
    
    try:
        success = appointment_service.cancel_appointment(appointment_id, current_user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        return {"message": "Appointment cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel appointment"
        )
