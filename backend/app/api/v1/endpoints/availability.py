"""
Availability endpoints.
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_id
from app.core.database import get_db
from app.models.availability import Availability
from app.models.professional import Professional
from app.schemas.availability import (
    AvailabilityCreate,
    AvailabilityResponse,
    BulkAvailabilityCreate,
)

router = APIRouter()


@router.get("/professional/{professional_id}", response_model=List[AvailabilityResponse])
async def get_professional_availability(professional_id: str, db: Session = Depends(get_db)):
    """Get availability for a specific professional."""
    # Verify professional exists and is active
    professional = db.query(Professional).filter(Professional.id == professional_id, Professional.is_active).first()

    if not professional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Professional not found")

    availability = (
        db.query(Availability)
        .filter(Availability.professional_id == professional_id)
        .order_by(Availability.date.asc())
        .all()
    )

    return availability


@router.post("/", response_model=AvailabilityResponse)
async def create_availability(
    availability_data: AvailabilityCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create availability slot (for professionals)."""
    # Verify user is a professional
    professional = db.query(Professional).filter(Professional.id == current_user_id, Professional.is_active).first()

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can create availability",
        )

    # Verify professional_id matches current user
    if str(availability_data.professional_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create availability for yourself",
        )

    try:
        availability = Availability(**availability_data.dict())
        db.add(availability)
        db.commit()
        db.refresh(availability)
        return availability

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create availability",
        )


@router.post("/bulk", response_model=List[AvailabilityResponse])
async def create_bulk_availability(
    bulk_data: BulkAvailabilityCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create multiple availability slots (for professionals)."""
    # Verify user is a professional
    professional = db.query(Professional).filter(Professional.id == current_user_id, Professional.is_active).first()

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only professionals can create availability",
        )

    # Verify professional_id matches current user
    if str(bulk_data.professional_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create availability for yourself",
        )

    try:
        availability_slots = []

        # Generate slots for each day in the range

        current_date = bulk_data.start_date.date()
        end_date = bulk_data.end_date.date()

        while current_date <= end_date:
            for time_slot in bulk_data.time_slots:
                slot_datetime = datetime.combine(current_date, datetime.strptime(time_slot, "%H:%M").time())

                availability = Availability(
                    professional_id=bulk_data.professional_id,
                    date=slot_datetime,
                    time=time_slot,
                    duration=bulk_data.duration,
                    timezone=bulk_data.timezone,
                )

                availability_slots.append(availability)
                db.add(availability)

            current_date += timedelta(days=1)

        db.commit()

        # Refresh all slots
        for slot in availability_slots:
            db.refresh(slot)

        return availability_slots

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bulk availability",
        )
