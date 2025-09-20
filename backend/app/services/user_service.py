"""
User service for business logic.
"""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    """User service."""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users."""
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_user(self, user_id: str, update_data: UserUpdate) -> Optional[User]:
        """Update user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        try:
            # Update fields
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(user, field, value)

            self.db.commit()
            self.db.refresh(user)
            return user

        except SQLAlchemyError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user",
            ) from exc

    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        try:
            user.is_active = False
            self.db.commit()
            return True

        except SQLAlchemyError:
            self.db.rollback()
            return False
