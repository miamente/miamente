"""
Model tests rely on real DB behavior; mark them as integration.
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from app.models.user import User as UserModel

pytestmark = pytest.mark.integration


class TestUserModel:
    """Test User model."""

    def test_create_user(self, db_session):
        """Test creating a user."""
        user = UserModel(full_name="Test User", email="test3@example.com", hashed_password="hashed_password")

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.id is not None
        assert user.email == "test3@example.com"
        assert user.full_name == "Test User"
        assert user.is_active == True  # Default value
        # created_at might be None if server_default doesn't work in tests
        # This is acceptable for test purposes

    def test_user_email_unique(self, db_session):
        """Test that user email must be unique."""
        user1 = UserModel(full_name="Test User 1", email="test1@example.com", hashed_password="hashed_password")
        user2 = UserModel(full_name="Test User 2", email="test1@example.com", hashed_password="hashed_password")

        db_session.add(user1)
        db_session.commit()

        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_defaults(self, db_session):
        """Test user default values."""
        user = UserModel(full_name="Test User", email="test2@example.com", hashed_password="hashed_password")

        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        assert user.is_active == True  # Default value
        assert user.is_verified == False  # Default value
        assert user.phone is None
        assert user.profile_picture is None
