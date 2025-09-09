"""
Professional endpoints.
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.services.auth_service import AuthService
from app.schemas.professional import ProfessionalUpdate, ProfessionalResponse
from app.models.professional import Professional

router = APIRouter()


@router.get("/", response_model=List[ProfessionalResponse])
async def get_professionals(
    skip: int = 0,
    limit: int = 100,
    specialty: str = None,
    min_rate_cents: int = None,
    max_rate_cents: int = None,
    db: Session = Depends(get_db)
):
    """Get all active professionals with optional filtering."""
    query = db.query(Professional).filter(Professional.is_active == True)
    
    # Filter by specialty if provided
    if specialty:
        query = query.filter(Professional.specialty.ilike(f"%{specialty}%"))
    
    # Filter by rate range if provided
    if min_rate_cents is not None:
        query = query.filter(Professional.rate_cents >= min_rate_cents)
    
    if max_rate_cents is not None:
        query = query.filter(Professional.rate_cents <= max_rate_cents)
    
    professionals = query.offset(skip).limit(limit).all()
    
    return professionals


@router.get("/{professional_id}", response_model=ProfessionalResponse)
async def get_professional(
    professional_id: str,
    db: Session = Depends(get_db)
):
    """Get professional by ID."""
    try:
        professional_uuid = uuid.UUID(professional_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    professional = db.query(Professional).filter(
        Professional.id == professional_uuid,
        Professional.is_active == True
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    return professional


@router.get("/{professional_id}/availability")
async def get_professional_availability(
    professional_id: str,
    db: Session = Depends(get_db)
):
    """Get professional availability."""
    try:
        professional_uuid = uuid.UUID(professional_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid professional ID format"
        )
    
    # Check if professional exists
    professional = db.query(Professional).filter(
        Professional.id == professional_uuid,
        Professional.is_active == True
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    # For now, return empty availability list
    # In a real app, this would query the availability table
    return []


@router.get("/me/profile", response_model=ProfessionalResponse)
async def get_current_professional(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current professional profile."""
    auth_service = AuthService(db)
    professional = auth_service.get_professional_by_id(current_user_id)
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    return professional


@router.get("/me/appointments")
async def get_current_professional_appointments(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current professional appointments."""
    from app.services.appointment_service import AppointmentService
    
    appointment_service = AppointmentService(db)
    appointments = appointment_service.get_professional_appointments(current_user_id)
    
    return appointments


@router.put("/me", response_model=ProfessionalResponse)
async def update_current_professional(
    update_data: ProfessionalUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update current professional information."""
    auth_service = AuthService(db)
    professional = auth_service.get_professional_by_id(current_user_id)
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    try:
        # Update professional fields
        for field, value in update_data.dict(exclude_unset=True).items():
            if hasattr(professional, field):
                setattr(professional, field, value)
        
        db.commit()
        db.refresh(professional)
        
        return professional
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update professional"
        )


@router.put("/me/profile", response_model=ProfessionalResponse)
async def update_current_professional(
    update_data: ProfessionalUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update current professional profile."""
    auth_service = AuthService(db)
    professional = auth_service.get_professional_by_id(current_user_id)
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    try:
        # Update fields
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(professional, field, value)
        
        db.commit()
        db.refresh(professional)
        return professional
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update professional"
        )
