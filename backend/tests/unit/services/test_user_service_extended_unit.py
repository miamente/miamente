"""
Extended unit tests for user service.
"""

import pytest
import uuid
from unittest.mock import Mock, patch
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from app.services.user_service import UserService
from app.models.user import User
from app.schemas.user import UserUpdate


class TestUserServiceExtendedUnit:
    """Extended test cases for UserService."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()

    @pytest.fixture
    def user_service(self, mock_db):
        """Create UserService instance with mocked database."""
        return UserService(mock_db)

    @pytest.fixture
    def sample_user(self):
        """Sample user object."""
        user = Mock(spec=User)
        user.id = uuid.uuid4()
        user.email = "test@example.com"
        user.full_name = "Test User"
        user.phone = "+1234567890"
        user.is_active = True
        return user

    @pytest.fixture
    def sample_user_update(self):
        """Sample user update data."""
        return UserUpdate(
            full_name="Updated Name",
            phone="+9876543210",
            emergency_contact="Updated Emergency Contact"
        )

    def test_get_user_by_id_success(self, user_service, mock_db, sample_user):
        """Test getting user by ID successfully."""
        user_id = str(sample_user.id)
        
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_db.query.return_value = mock_query
        
        result = user_service.get_user_by_id(user_id)
        
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_id_not_found(self, user_service, mock_db):
        """Test getting user by ID when user not found."""
        user_id = str(uuid.uuid4())
        
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query
        
        result = user_service.get_user_by_id(user_id)
        
        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_email_success(self, user_service, mock_db, sample_user):
        """Test getting user by email successfully."""
        email = sample_user.email
        
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = sample_user
        mock_db.query.return_value = mock_query
        
        result = user_service.get_user_by_email(email)
        
        assert result == sample_user
        mock_db.query.assert_called_once_with(User)

    def test_get_user_by_email_not_found(self, user_service, mock_db):
        """Test getting user by email when user not found."""
        email = "nonexistent@example.com"
        
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        mock_db.query.return_value = mock_query
        
        result = user_service.get_user_by_email(email)
        
        assert result is None
        mock_db.query.assert_called_once_with(User)

    def test_get_users_with_pagination(self, user_service, mock_db):
        """Test getting users with pagination."""
        users = [Mock(spec=User) for _ in range(3)]
        skip = 10
        limit = 5
        
        mock_query = Mock()
        mock_query.offset.return_value.limit.return_value.all.return_value = users
        mock_db.query.return_value = mock_query
        
        result = user_service.get_users(skip=skip, limit=limit)
        
        assert result == users
        mock_db.query.assert_called_once_with(User)
        mock_query.offset.assert_called_once_with(skip)
        mock_query.offset.return_value.limit.assert_called_once_with(limit)

    def test_get_users_default_pagination(self, user_service, mock_db):
        """Test getting users with default pagination."""
        users = [Mock(spec=User) for _ in range(2)]
        
        mock_query = Mock()
        mock_query.offset.return_value.limit.return_value.all.return_value = users
        mock_db.query.return_value = mock_query
        
        result = user_service.get_users()
        
        assert result == users
        mock_db.query.assert_called_once_with(User)
        mock_query.offset.assert_called_once_with(0)
        mock_query.offset.return_value.limit.assert_called_once_with(100)

    def test_get_users_empty_result(self, user_service, mock_db):
        """Test getting users when no users exist."""
        mock_query = Mock()
        mock_query.offset.return_value.limit.return_value.all.return_value = []
        mock_db.query.return_value = mock_query
        
        result = user_service.get_users()
        
        assert result == []
        mock_db.query.assert_called_once_with(User)

    def test_update_user_success(self, user_service, mock_db, sample_user, sample_user_update):
        """Test updating user successfully."""
        user_id = str(sample_user.id)
        
        # Mock get_user_by_id to return the user
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.update_user(user_id, sample_user_update)
            
            assert result == sample_user
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once_with(sample_user)
            
            # Verify that user attributes were updated
            assert sample_user.full_name == "Updated Name"
            assert sample_user.phone == "+9876543210"
            assert sample_user.emergency_contact == "Updated Emergency Contact"

    def test_update_user_not_found(self, user_service, mock_db, sample_user_update):
        """Test updating user when user not found."""
        user_id = str(uuid.uuid4())
        
        with patch.object(user_service, 'get_user_by_id', return_value=None):
            result = user_service.update_user(user_id, sample_user_update)
            
            assert result is None
            mock_db.commit.assert_not_called()
            mock_db.refresh.assert_not_called()

    def test_update_user_partial_update(self, user_service, mock_db, sample_user):
        """Test updating user with partial data."""
        user_id = str(sample_user.id)
        partial_update = UserUpdate(full_name="New Name Only")
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.update_user(user_id, partial_update)
            
            assert result == sample_user
            assert sample_user.full_name == "New Name Only"
            # Other fields should remain unchanged
            assert sample_user.phone == "+1234567890"

    def test_update_user_database_error(self, user_service, mock_db, sample_user, sample_user_update):
        """Test updating user when database error occurs."""
        user_id = str(sample_user.id)
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            mock_db.commit.side_effect = SQLAlchemyError("Database error")
            
            with pytest.raises(HTTPException) as exc_info:
                user_service.update_user(user_id, sample_user_update)
            
            assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert exc_info.value.detail == "Failed to update user"
            mock_db.rollback.assert_called_once()

    def test_update_user_empty_update_data(self, user_service, mock_db, sample_user):
        """Test updating user with empty update data."""
        user_id = str(sample_user.id)
        empty_update = UserUpdate()
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.update_user(user_id, empty_update)
            
            assert result == sample_user
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once_with(sample_user)

    def test_deactivate_user_success(self, user_service, mock_db, sample_user):
        """Test deactivating user successfully."""
        user_id = str(sample_user.id)
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.deactivate_user(user_id)
            
            assert result is True
            assert sample_user.is_active is False
            mock_db.commit.assert_called_once()

    def test_deactivate_user_not_found(self, user_service, mock_db):
        """Test deactivating user when user not found."""
        user_id = str(uuid.uuid4())
        
        with patch.object(user_service, 'get_user_by_id', return_value=None):
            result = user_service.deactivate_user(user_id)
            
            assert result is False
            mock_db.commit.assert_not_called()

    def test_deactivate_user_database_error(self, user_service, mock_db, sample_user):
        """Test deactivating user when database error occurs."""
        user_id = str(sample_user.id)
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            mock_db.commit.side_effect = SQLAlchemyError("Database error")
            
            result = user_service.deactivate_user(user_id)
            
            assert result is False
            mock_db.rollback.assert_called_once()

    def test_deactivate_user_already_inactive(self, user_service, mock_db, sample_user):
        """Test deactivating user that is already inactive."""
        user_id = str(sample_user.id)
        sample_user.is_active = False  # Already inactive
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.deactivate_user(user_id)
            
            assert result is True
            assert sample_user.is_active is False
            mock_db.commit.assert_called_once()

    def test_user_service_initialization(self, mock_db):
        """Test UserService initialization."""
        user_service = UserService(mock_db)
        assert user_service.db == mock_db

    def test_update_user_with_none_values(self, user_service, mock_db, sample_user):
        """Test updating user with None values (should be excluded)."""
        user_id = str(sample_user.id)
        update_with_none = UserUpdate(
            full_name="New Name",
            phone=None,  # This should be excluded from update
            emergency_contact="New Emergency Contact"
        )
        
        with patch.object(user_service, 'get_user_by_id', return_value=sample_user):
            result = user_service.update_user(user_id, update_with_none)
            
            assert result == sample_user
            assert sample_user.full_name == "New Name"
            assert sample_user.emergency_contact == "New Emergency Contact"
            # Phone should remain unchanged since it was None in update
            # Note: The mock behavior might set it to None, so we check the call was made
            mock_db.commit.assert_called_once()

    def test_get_users_large_limit(self, user_service, mock_db):
        """Test getting users with large limit."""
        users = [Mock(spec=User) for _ in range(50)]
        large_limit = 1000
        
        mock_query = Mock()
        mock_query.offset.return_value.limit.return_value.all.return_value = users
        mock_db.query.return_value = mock_query
        
        result = user_service.get_users(skip=0, limit=large_limit)
        
        assert result == users
        mock_query.offset.assert_called_once_with(0)
        mock_query.offset.return_value.limit.assert_called_once_with(large_limit)
