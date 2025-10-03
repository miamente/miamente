"""
Therapeutic approach endpoints.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.utils.auth import get_current_admin_user
from app.schemas.therapeutic_approach import (
    TherapeuticApproachCreate,
    TherapeuticApproachResponse,
    TherapeuticApproachUpdate,
    PaginatedTherapeuticApproachesResponse,
    TherapeuticApproachWithCountResponse,
)
from app.services.therapeutic_approach_service import TherapeuticApproachService

router = APIRouter()

# Error messages
THERAPEUTIC_APPROACH_NOT_FOUND_MESSAGE = "Therapeutic approach not found"


@router.get("/", response_model=List[TherapeuticApproachResponse])
def get_therapeutic_approaches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all therapeutic approaches."""
    service = TherapeuticApproachService(db)
    approaches = service.get_therapeutic_approaches(skip=skip, limit=limit)
    return approaches


@router.get("/category/{category}", response_model=List[TherapeuticApproachResponse])
def get_therapeutic_approaches_by_category(category: str, db: Session = Depends(get_db)):
    """Get therapeutic approaches by category."""
    service = TherapeuticApproachService(db)
    approaches = service.get_therapeutic_approaches_by_category(category)
    return approaches


@router.get("/{approach_id}", response_model=TherapeuticApproachResponse)
def get_therapeutic_approach(approach_id: str, db: Session = Depends(get_db)):
    """Get a therapeutic approach by ID."""
    service = TherapeuticApproachService(db)
    approach = service.get_therapeutic_approach(approach_id)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=THERAPEUTIC_APPROACH_NOT_FOUND_MESSAGE,
        )
    return approach


@router.get("/admin/all", response_model=PaginatedTherapeuticApproachesResponse)
def get_all_therapeutic_approaches_admin(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _admin_user=Depends(get_current_admin_user),
):
    """Get all therapeutic approaches for admin with pagination and search."""
    service = TherapeuticApproachService(db)

    # Calculate skip from page and page_size
    skip = (page - 1) * page_size

    # Get therapeutic approaches and total count with search filter
    approaches = service.get_therapeutic_approaches_admin(skip=skip, limit=page_size, search=search)
    total = service.get_therapeutic_approaches_count(search=search)

    # Add professional count for each therapeutic approach
    approaches_with_count = []
    for approach in approaches:
        professional_count = service.get_therapeutic_approach_professional_count(approach.id)
        approach_with_count = TherapeuticApproachWithCountResponse(
            id=approach.id,
            name=approach.name,
            description=approach.description,
            category=approach.category,
            is_active=approach.is_active,
            created_at=approach.created_at.isoformat() if approach.created_at else None,
            updated_at=approach.updated_at.isoformat() if approach.updated_at else None,
            professional_count=professional_count,
        )
        approaches_with_count.append(approach_with_count)

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return PaginatedTherapeuticApproachesResponse(
        items=approaches_with_count, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.post("/", response_model=TherapeuticApproachResponse, status_code=status.HTTP_201_CREATED)
def create_therapeutic_approach(approach: TherapeuticApproachCreate, db: Session = Depends(get_db)):
    """Create a new therapeutic approach."""
    service = TherapeuticApproachService(db)
    return service.create_therapeutic_approach(approach)


@router.patch("/{approach_id}", response_model=TherapeuticApproachResponse)
def update_therapeutic_approach(
    approach_id: str,
    approach_update: TherapeuticApproachUpdate,
    db: Session = Depends(get_db),
):
    """Update a therapeutic approach."""
    service = TherapeuticApproachService(db)
    approach = service.update_therapeutic_approach(approach_id, approach_update)
    if not approach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=THERAPEUTIC_APPROACH_NOT_FOUND_MESSAGE,
        )
    return approach


@router.delete("/{approach_id}")
def delete_therapeutic_approach(approach_id: str, db: Session = Depends(get_db)):
    """Delete a therapeutic approach."""
    service = TherapeuticApproachService(db)
    success = service.delete_therapeutic_approach(approach_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=THERAPEUTIC_APPROACH_NOT_FOUND_MESSAGE,
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
