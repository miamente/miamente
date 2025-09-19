"""
Specialty (new version) endpoints.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.specialty import (
    SpecialtyCreate,
    SpecialtyResponse,
    SpecialtyUpdate,
)
from app.services.specialty_service import SpecialtyService

router = APIRouter()

# Error messages
SPECIALTY_NOT_FOUND_MESSAGE = "Specialty not found"


@router.get("/", response_model=List[SpecialtyResponse])
def get_specialties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all specialties."""
    service = SpecialtyService(db)
    specialties = service.get_specialties(skip=skip, limit=limit)
    return specialties


@router.get("/category/{category}", response_model=List[SpecialtyResponse])
def get_specialties_by_category(category: str, db: Session = Depends(get_db)):
    """Get specialties by category."""
    service = SpecialtyService(db)
    specialties = service.get_specialties_by_category(category)
    return specialties


@router.get("/{specialty_id}", response_model=SpecialtyResponse)
def get_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Get a specialty by ID."""
    service = SpecialtyService(db)
    specialty = service.get_specialty(specialty_id)
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE
        )
    return specialty


@router.post("/", response_model=SpecialtyResponse)
def create_specialty(specialty: SpecialtyCreate, db: Session = Depends(get_db)):
    """Create a new specialty."""
    service = SpecialtyService(db)
    return service.create_specialty(specialty)


@router.put("/{specialty_id}", response_model=SpecialtyResponse)
def update_specialty(
    specialty_id: str, specialty_update: SpecialtyUpdate, db: Session = Depends(get_db)
):
    """Update a specialty."""
    service = SpecialtyService(db)
    specialty = service.update_specialty(specialty_id, specialty_update)
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE
        )
    return specialty


@router.delete("/{specialty_id}")
def delete_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Delete a specialty."""
    service = SpecialtyService(db)
    success = service.delete_specialty(specialty_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE
        )
    return {"message": "Specialty deleted successfully"}
