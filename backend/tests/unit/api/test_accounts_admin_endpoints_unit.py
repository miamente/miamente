"""
Unit tests for admin account endpoints.
"""

import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.api.v1.endpoints.accounts import (
    get_all_accounts_admin,
    get_account_by_id,
    update_account_by_id,
    delete_account_by_id,
    toggle_account_status,
)
from app.models.account import Account
from app.models.role import Role
from app.schemas.account import AccountUpdate, AccountStatusUpdate

# Mark all tests in this module as asyncio
pytestmark = pytest.mark.asyncio


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return MagicMock()


@pytest.fixture
def mock_admin_user():
    """Create a mock admin user."""
    admin_role = Role(id=uuid.uuid4(), name="admin", description="Admin role")
    admin = Account(
        id=uuid.uuid4(),
        role_id=admin_role.id,
        email="admin@test.com",
        full_name="Admin User",
        hashed_password="hashed",
        is_active=True,
        is_verified=True,
    )
    admin.role = admin_role
    return admin


@pytest.fixture
def mock_user_account():
    """Create a mock user account."""
    user_role = Role(id=uuid.uuid4(), name="user", description="User role")
    user = Account(
        id=uuid.uuid4(),
        role_id=user_role.id,
        email="user@test.com",
        full_name="Test User",
        hashed_password="hashed",
        is_active=True,
        is_verified=False,
        created_at=datetime.utcnow(),
    )
    user.role = user_role
    return user


class TestGetAllAccountsAdmin:
    """Tests for GET /accounts/admin/all endpoint."""

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_all_accounts_admin_success(
        self, mock_service_class, mock_db, mock_admin_user, mock_user_account
    ):
        """Test successful retrieval of all accounts with pagination."""
        # Setup mock service
        mock_service = mock_service_class.return_value
        mock_service.get_accounts_admin.return_value = [mock_user_account]
        mock_service.count_accounts_by_role.return_value = 1

        # Call endpoint
        response = await get_all_accounts_admin(
            page=1, page_size=10, role="user", search=None, db=mock_db, _admin_user=mock_admin_user
        )

        # Assertions - use attribute access for Pydantic models
        assert response.total == 1
        assert response.page == 1
        assert response.page_size == 10
        assert response.total_pages == 1
        assert len(response.items) == 1

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_all_accounts_admin_with_search(
        self, mock_service_class, mock_db, mock_admin_user, mock_user_account
    ):
        """Test retrieval with search filter."""
        mock_service = mock_service_class.return_value
        mock_service.get_accounts_admin.return_value = [mock_user_account]
        mock_service.count_accounts_by_role.return_value = 1

        response = await get_all_accounts_admin(
            page=1, page_size=10, role="user", search="test", db=mock_db, _admin_user=mock_admin_user
        )

        # Verify search was passed to service
        mock_service.get_accounts_admin.assert_called_once_with(role_name="user", search="test", skip=0, limit=10)
        assert len(response.items) == 1


class TestGetAccountById:
    """Tests for GET /accounts/{account_id} endpoint."""

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_account_by_id_success_own_account(self, mock_service_class, mock_db, mock_user_account):
        """Test getting own account information."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = mock_user_account
        mock_service.get_account_with_profile.return_value = {
            "account": mock_user_account,
            "role": "user",
            "profile": {"account_id": str(mock_user_account.id)},
        }

        response = await get_account_by_id(
            account_id=str(mock_user_account.id), db=mock_db, current_user_id=str(mock_user_account.id)
        )

        # Use attribute access for Pydantic models
        assert response.role == "user"
        assert response.account.email == "user@test.com"

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_account_by_id_forbidden_other_account(self, mock_service_class, mock_db, mock_user_account):
        """Test that non-admin cannot access other accounts."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = mock_user_account

        other_account_id = str(uuid.uuid4())

        with pytest.raises(HTTPException) as exc_info:
            await get_account_by_id(account_id=other_account_id, db=mock_db, current_user_id=str(mock_user_account.id))

        assert exc_info.value.status_code == 403

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_get_account_by_id_not_found(self, mock_service_class, mock_db, mock_user_account):
        """Test 404 when account not found."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = mock_user_account
        mock_service.get_account_with_profile.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await get_account_by_id(
                account_id=str(mock_user_account.id), db=mock_db, current_user_id=str(mock_user_account.id)
            )

        assert exc_info.value.status_code == 404


class TestUpdateAccountById:
    """Tests for PATCH /accounts/{account_id} endpoint."""

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_update_account_success(self, mock_service_class, mock_db, mock_user_account):
        """Test successful account update."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = mock_user_account

        updated_account = Account(
            id=mock_user_account.id,
            role_id=mock_user_account.role_id,
            email=mock_user_account.email,
            full_name="Updated Name",
            hashed_password="hashed",
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
        )
        updated_account.role = mock_user_account.role

        mock_service.update_account.return_value = updated_account
        mock_service.get_account_with_profile.return_value = {
            "account": updated_account,
            "role": "user",
            "profile": None,
        }

        account_update = AccountUpdate(full_name="Updated Name")
        response = await update_account_by_id(
            account_id=str(mock_user_account.id),
            account_update=account_update,
            db=mock_db,
            current_user_id=str(mock_user_account.id),
        )

        # Use attribute access for Pydantic models
        assert response.account.full_name == "Updated Name"


class TestDeleteAccountById:
    """Tests for DELETE /accounts/{account_id} endpoint."""

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_delete_account_success(self, mock_service_class, mock_db, mock_admin_user, mock_user_account):
        """Test successful account deletion."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = mock_user_account

        result = await delete_account_by_id(
            account_id=str(mock_user_account.id), db=mock_db, _admin_user=mock_admin_user
        )

        assert result is None
        mock_db.delete.assert_called_once_with(mock_user_account)
        mock_db.commit.assert_called_once()

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_delete_account_not_found(self, mock_service_class, mock_db, mock_admin_user):
        """Test 404 when account not found."""
        mock_service = mock_service_class.return_value
        mock_service.get_account_by_id.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await delete_account_by_id(account_id=str(uuid.uuid4()), db=mock_db, _admin_user=mock_admin_user)

        assert exc_info.value.status_code == 404


class TestToggleAccountStatus:
    """Tests for PATCH /accounts/{account_id}/status endpoint."""

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_toggle_account_status_activate(
        self, mock_service_class, mock_db, mock_admin_user, mock_user_account
    ):
        """Test activating an account."""
        mock_service = mock_service_class.return_value
        mock_service.activate_account.return_value = True
        mock_user_account.is_active = True
        mock_service.get_account_by_id.return_value = mock_user_account

        status_update = AccountStatusUpdate(is_active=True)
        response = await toggle_account_status(
            account_id=str(mock_user_account.id), status_update=status_update, db=mock_db, _admin_user=mock_admin_user
        )

        assert response.is_active is True
        mock_service.activate_account.assert_called_once_with(str(mock_user_account.id))

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_toggle_account_status_deactivate(
        self, mock_service_class, mock_db, mock_admin_user, mock_user_account
    ):
        """Test deactivating an account."""
        mock_service = mock_service_class.return_value
        mock_service.deactivate_account.return_value = True
        mock_user_account.is_active = False
        mock_service.get_account_by_id.return_value = mock_user_account

        status_update = AccountStatusUpdate(is_active=False)
        response = await toggle_account_status(
            account_id=str(mock_user_account.id), status_update=status_update, db=mock_db, _admin_user=mock_admin_user
        )

        assert response.is_active is False
        mock_service.deactivate_account.assert_called_once_with(str(mock_user_account.id))

    @patch("app.api.v1.endpoints.accounts.AccountService")
    async def test_toggle_account_status_not_found(self, mock_service_class, mock_db, mock_admin_user):
        """Test 404 when account not found."""
        mock_service = mock_service_class.return_value
        mock_service.activate_account.return_value = False

        status_update = AccountStatusUpdate(is_active=True)

        with pytest.raises(HTTPException) as exc_info:
            await toggle_account_status(
                account_id=str(uuid.uuid4()), status_update=status_update, db=mock_db, _admin_user=mock_admin_user
            )

        assert exc_info.value.status_code == 404
