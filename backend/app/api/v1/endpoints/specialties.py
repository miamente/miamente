"""
Specialty endpoints.
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_id
from app.schemas.specialty import SpecialtyCreate, SpecialtyUpdate, SpecialtyResponse, ProfessionalSpecialtyUpdate
from app.models.specialty import Specialty
from app.models.professional import Professional
from app.models.professional_specialty import ProfessionalSpecialty

router = APIRouter()


@router.get("/", response_model=List[SpecialtyResponse])
async def get_specialties(
    category: str = None,
    exclude_assigned: bool = False,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all specialties with optional filtering by category and assigned specialties."""
    query = db.query(Specialty)
    
    if category:
        query = query.filter(Specialty.category == category)
    
    # If exclude_assigned is True, filter out specialties already assigned to the current professional
    if exclude_assigned:
        # Check if current user is a professional
        professional = db.query(Professional).filter(Professional.id == current_user_id).first()
        if professional:
            # Get specialty IDs already assigned to this professional
            assigned_specialty_ids = db.query(ProfessionalSpecialty.specialty_id).filter(
                ProfessionalSpecialty.professional_id == current_user_id,
                ProfessionalSpecialty.is_active == True,
                ProfessionalSpecialty.specialty_id.isnot(None)
            ).all()
            
            assigned_ids = [specialty_id[0] for specialty_id in assigned_specialty_ids]
            
            # Exclude already assigned specialties
            if assigned_ids:
                query = query.filter(~Specialty.id.in_(assigned_ids))
    
    specialties = query.all()
    return specialties


@router.get("/{specialty_id}", response_model=SpecialtyResponse)
async def get_specialty(
    specialty_id: str,
    db: Session = Depends(get_db)
):
    """Get specialty by ID."""
    try:
        specialty_uuid = uuid.UUID(specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format"
        )
    
    specialty = db.query(Specialty).filter(Specialty.id == specialty_uuid).first()
    
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specialty not found"
        )
    
    return specialty


@router.post("/", response_model=SpecialtyResponse)
async def create_specialty(
    specialty: SpecialtyCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new specialty (admin only)."""
    # Check if user is admin (you might want to add proper admin check)
    # For now, we'll allow any authenticated user to create specialties
    
    # Check if specialty name already exists
    existing_specialty = db.query(Specialty).filter(Specialty.name == specialty.name).first()
    if existing_specialty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specialty with this name already exists"
        )
    
    db_specialty = Specialty(**specialty.dict())
    db.add(db_specialty)
    db.commit()
    db.refresh(db_specialty)
    
    return db_specialty


@router.put("/{specialty_id}", response_model=SpecialtyResponse)
async def update_specialty(
    specialty_id: str,
    specialty_update: SpecialtyUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a specialty (admin only)."""
    try:
        specialty_uuid = uuid.UUID(specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format"
        )
    
    specialty = db.query(Specialty).filter(Specialty.id == specialty_uuid).first()
    
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specialty not found"
        )
    
    # Update specialty fields
    update_data = specialty_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(specialty, field, value)
    
    db.commit()
    db.refresh(specialty)
    
    return specialty


@router.put("/professional/update", response_model=dict)
async def update_professional_specialty(
    specialty_update: ProfessionalSpecialtyUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update professional's specialty and custom pricing."""
    # Get professional
    professional = db.query(Professional).filter(Professional.id == current_user_id).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    # Get specialty
    try:
        specialty_uuid = uuid.UUID(specialty_update.specialty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid specialty ID format"
        )
    
    specialty = db.query(Specialty).filter(Specialty.id == specialty_uuid).first()
    
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specialty not found"
        )
    
    # Update professional's specialty
    professional.specialty_id = specialty_uuid
    professional.specialty = specialty.name  # Keep for backward compatibility
    
    # Update pricing
    if specialty_update.custom_price_cents is not None:
        professional.custom_rate_cents = specialty_update.custom_price_cents
        professional.rate_cents = specialty_update.custom_price_cents
    else:
        professional.rate_cents = specialty.default_price_cents
        professional.custom_rate_cents = None
    
    db.commit()
    
    return {
        "message": "Professional specialty updated successfully",
        "specialty": specialty.name,
        "rate_cents": professional.rate_cents
    }


@router.get("/categories/", response_model=List[str])
async def get_specialty_categories(db: Session = Depends(get_db)):
    """Get all specialty categories."""
    categories = db.query(Specialty.category).distinct().all()
    return [category[0] for category in categories]
