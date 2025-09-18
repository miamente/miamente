"""
Availability service for business logic.
"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.availability import Availability, SlotStatus
from app.schemas.availability import AvailabilityCreate, BulkAvailabilityCreate


class AvailabilityService:
    """Availability service."""

    def __init__(self, db: Session):
        self.db = db

    def get_availability_by_id(self, availability_id: str) -> Optional[Availability]:
        """Get availability by ID."""
        return (
            self.db.query(Availability)
            .filter(Availability.id == availability_id)
            .first()
        )

    def get_professional_availability(self, professional_id: str) -> List[Availability]:
        """Get all availability for a professional."""
        return (
            self.db.query(Availability)
            .filter(Availability.professional_id == professional_id)
            .order_by(Availability.date.asc())
            .all()
        )

    def get_available_slots(
        self, professional_id: str, start_date: datetime, end_date: datetime
    ) -> List[Availability]:
        """Get available slots for a professional in a date range."""
        return (
            self.db.query(Availability)
            .filter(
                and_(
                    Availability.professional_id == professional_id,
                    Availability.status == SlotStatus.FREE,
                    Availability.date >= start_date,
                    Availability.date <= end_date,
                )
            )
            .order_by(Availability.date.asc())
            .all()
        )

    def create_availability(
        self, availability_data: AvailabilityCreate
    ) -> Availability:
        """Create availability slot."""
        try:
            availability = Availability(**availability_data.dict())
            self.db.add(availability)
            self.db.commit()
            self.db.refresh(availability)
            return availability

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create availability",
            )

    def create_bulk_availability(
        self, bulk_data: BulkAvailabilityCreate
    ) -> List[Availability]:
        """Create multiple availability slots."""
        try:
            availability_slots = []
            current_date = bulk_data.start_date.date()
            end_date = bulk_data.end_date.date()

            while current_date <= end_date:
                for time_slot in bulk_data.time_slots:
                    slot_datetime = datetime.combine(
                        current_date, datetime.strptime(time_slot, "%H:%M").time()
                    )

                    availability = Availability(
                        professional_id=bulk_data.professional_id,
                        date=slot_datetime,
                        time=time_slot,
                        duration=bulk_data.duration,
                        timezone=bulk_data.timezone,
                    )

                    availability_slots.append(availability)
                    self.db.add(availability)

                current_date += timedelta(days=1)

            self.db.commit()

            # Refresh all slots
            for slot in availability_slots:
                self.db.refresh(slot)

            return availability_slots

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bulk availability",
            )

    def update_availability_status(
        self, availability_id: str, status: SlotStatus, held_by: Optional[str] = None
    ) -> bool:
        """Update availability slot status."""
        availability = self.get_availability_by_id(availability_id)
        if not availability:
            return False

        try:
            availability.status = status
            if held_by:
                availability.held_by = held_by
                availability.held_at = datetime.utcnow()
            else:
                availability.held_by = None
                availability.held_at = None

            self.db.commit()
            return True

        except Exception:
            self.db.rollback()
            return False

    def delete_availability(self, availability_id: str) -> bool:
        """Delete availability slot."""
        availability = self.get_availability_by_id(availability_id)
        if not availability:
            return False

        try:
            self.db.delete(availability)
            self.db.commit()
            return True

        except Exception:
            self.db.rollback()
            return False
