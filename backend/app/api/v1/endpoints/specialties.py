"""
Specialty (new version) endpoints.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.utils.auth import get_current_admin_user
from app.core.database import get_db
from app.schemas.specialty import (
    SpecialtyCreate,
    SpecialtyResponse,
    SpecialtyUpdate,
    PaginatedSpecialtiesResponse,
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
    
    # Add professional count for each specialty
    specialties_with_count = []
    for specialty in specialties:
        professional_count = service.get_specialty_professional_count(specialty.id)
        # Only expose active specialties to public/professional context
        if not specialty.is_active:
            continue
        specialty_dict = {
            "id": specialty.id,
            "name": specialty.name,
            "is_active": specialty.is_active,
            "professional_count": professional_count,
        }
        specialties_with_count.append(specialty_dict)
    
    return specialties_with_count


@router.get("/admin/all", response_model=PaginatedSpecialtiesResponse)
def get_all_specialties_admin(
    page: int = 1, 
    page_size: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _admin_user = Depends(get_current_admin_user),
):
    """Get all specialties for admin with pagination and search."""
    service = SpecialtyService(db)
    
    # Calculate skip from page and page_size
    skip = (page - 1) * page_size
    
    # Get specialties and total count with search filter
    specialties = service.get_specialties_admin(skip=skip, limit=page_size, search=search)
    total = service.get_specialties_count(search=search)
    
    # Add professional count for each specialty
    specialties_with_count = []
    for specialty in specialties:
        professional_count = service.get_specialty_professional_count(specialty.id)
        specialty_dict = {
            "id": specialty.id,
            "name": specialty.name,
            "description": specialty.description,
            "is_active": specialty.is_active,
            "professional_count": professional_count,
        }
        specialties_with_count.append(specialty_dict)
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedSpecialtiesResponse(
        items=specialties_with_count,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )




@router.get("/{specialty_id}", response_model=SpecialtyResponse)
def get_specialty(specialty_id: str, db: Session = Depends(get_db)):
    """Get a specialty by ID."""
    service = SpecialtyService(db)
    specialty = service.get_specialty(specialty_id)
    if not specialty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE)
    return specialty


@router.post("/", response_model=SpecialtyResponse, status_code=status.HTTP_201_CREATED)
def create_specialty(specialty: SpecialtyCreate, db: Session = Depends(get_db), _admin_user = Depends(get_current_admin_user)):
    """Create a new specialty."""
    service = SpecialtyService(db)
    try:
        return service.create_specialty(specialty)
    except IntegrityError:
        # Duplicate name or other constraint violation
        db.rollback()  # ensure session is clean after failed commit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specialty with this name already exists",
        )


@router.patch("/{specialty_id}", response_model=SpecialtyResponse)
def update_specialty(specialty_id: str, specialty_update: SpecialtyUpdate, db: Session = Depends(get_db), _admin_user = Depends(get_current_admin_user)):
    """Update a specialty."""
    service = SpecialtyService(db)
    specialty = service.update_specialty(specialty_id, specialty_update)
    if not specialty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE)
    return specialty


@router.delete("/{specialty_id}")
def delete_specialty(specialty_id: str, db: Session = Depends(get_db), _admin_user = Depends(get_current_admin_user)):
    """Delete a specialty."""
    service = SpecialtyService(db)
    # Block deletion if specialty is assigned to any active professional
    assigned_count = service.get_specialty_professional_count(specialty_id)
    if assigned_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete specialty: it is assigned to one or more professionals",
        )
    success = service.delete_specialty(specialty_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=SPECIALTY_NOT_FOUND_MESSAGE)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
