"""
Test-specific user service that uses test models.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Test user service that uses test models."""

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
        """Get user by ID."""
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[UserModel]:
        """Get user by email."""
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_users(self, skip: int = 0, limit: int = 100) -> List[UserModel]:
        """Get all users."""
        return self.db.query(UserModel).offset(skip).limit(limit).all()

    def update_user(self, user_id: str, update_data: UserUpdate) -> Optional[UserModel]:
        """Update user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.is_active = False
        self.db.commit()
        return True
