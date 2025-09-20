"""Endpoints for managing intervention modalities."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.utils.auth import get_current_user_id
from app.core.database import get_db
from app.models.modality import Modality
from app.schemas.modality import ModalityCreate, ModalityResponse, ModalityUpdate

router = APIRouter()

# Error messages
MODALITY_NOT_FOUND_MESSAGE = "Modality not found"


@router.get("/", response_model=List[ModalityResponse])
async def get_modalities(db: Session = Depends(get_db)):
    """Get all active modalities."""
    modalities = db.query(Modality).filter(Modality.is_active).all()
    return modalities


@router.get("/{modality_id}", response_model=ModalityResponse)
async def get_modality(
    modality_id: str,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user_id),  # auth enforced, value not used
):
    """Get a specific modality by ID."""
    modality = db.query(Modality).filter(Modality.id == modality_id).first()
    if not modality:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MODALITY_NOT_FOUND_MESSAGE)
    return modality


@router.post("/", response_model=ModalityResponse)
async def create_modality(
    modality: ModalityCreate,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user_id),
):
    """Create a new modality."""
    # Check if modality with same name already exists
    existing_modality = db.query(Modality).filter(Modality.name == modality.name).first()
    if existing_modality:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Modality with this name already exists",
        )

    db_modality = Modality(**modality.dict())
    db.add(db_modality)
    db.commit()
    db.refresh(db_modality)
    return db_modality


@router.put("/{modality_id}", response_model=ModalityResponse)
async def update_modality(
    modality_id: str,
    modality_update: ModalityUpdate,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user_id),
):
    """Update a modality."""
    modality = db.query(Modality).filter(Modality.id == modality_id).first()
    if not modality:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MODALITY_NOT_FOUND_MESSAGE)

    update_data = modality_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(modality, field, value)

    db.commit()
    db.refresh(modality)
    return modality


@router.delete("/{modality_id}")
async def delete_modality(
    modality_id: str,
    db: Session = Depends(get_db),
    _user_id: str = Depends(get_current_user_id),
):
    """Delete a modality (soft delete by setting is_active to False)."""
    modality = db.query(Modality).filter(Modality.id == modality_id).first()
    if not modality:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MODALITY_NOT_FOUND_MESSAGE)

    modality.is_active = False
    db.commit()
    return {"message": "Modality deleted successfully"}
