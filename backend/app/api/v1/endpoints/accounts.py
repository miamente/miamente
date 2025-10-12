"""
Account endpoints for unified authentication system.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.account import Account
from app.schemas.auth import UnifiedLogin, UnifiedAuthResponse
from app.schemas.account import (
    AccountUpdate,
    AccountStatusUpdate,
    AccountWithRole,
    AccountWithProfile,
    PaginatedAccountsResponse,
)
from app.services.account_service import AccountService
from app.services.role_service import RoleService
from app.utils.auth import get_current_user_id, get_current_admin_user
from app.utils.response_helpers import create_account_response_with_tokens


router = APIRouter()


@router.post("/login", response_model=UnifiedAuthResponse)
async def unified_login(login_data: UnifiedLogin, db: Session = Depends(get_db)):
    """
    Unified login endpoint for all account types (users, professionals, admins).
    Returns account information with role and profile data.
    """
    account_service = AccountService(db)

    # Authenticate account
    account = account_service.authenticate(login_data.email, login_data.password)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not account.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is not active")

    # Use helper to create response with tokens
    return create_account_response_with_tokens(db, account)


@router.post("/register/user", response_model=UnifiedAuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(email: str, password: str, full_name: str, phone: str = None, db: Session = Depends(get_db)):
    """Register a new user account."""
    account_service = AccountService(db)

    # Create user account
    account = account_service.create_user_account(email=email, password=password, full_name=full_name, phone=phone)

    # Use helper to create response with tokens
    return create_account_response_with_tokens(db, account)


@router.post("/register/professional", response_model=UnifiedAuthResponse, status_code=status.HTTP_201_CREATED)
async def register_professional(
    email: str,
    password: str,
    full_name: str,
    rate_cents: int,
    phone_country_code: str = None,
    phone_number: str = None,
    license_number: str = None,
    years_experience: int = 0,
    short_description: str = None,
    db: Session = Depends(get_db),
):
    """Register a new professional account."""
    account_service = AccountService(db)

    # Prepare profile data
    profile_data = {
        "license_number": license_number,
        "years_experience": years_experience,
        "short_description": short_description,
    }

    # Create professional account
    account = account_service.create_professional_account(
        email=email,
        password=password,
        full_name=full_name,
        rate_cents=rate_cents,
        phone_country_code=phone_country_code,
        phone_number=phone_number,
        profile_data=profile_data,
    )

    # Use helper to create response with tokens
    return create_account_response_with_tokens(db, account)


@router.get("/me")
async def get_current_account(current_user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Get current authenticated account information.
    Returns account data without generating new tokens.
    """
    account_service = AccountService(db)

    # Get account with profile
    account_data = account_service.get_account_with_profile(current_user_id)

    if not account_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Return account data without tokens
    return {"role": account_data["role"], "account": account_data["account"], "profile": account_data["profile"]}


@router.post("/ensure-roles", status_code=status.HTTP_200_OK)
async def ensure_default_roles(db: Session = Depends(get_db)):
    """
    Ensure default roles exist in the database.
    This endpoint should be called during deployment/setup.
    """
    role_service = RoleService(db)
    role_service.ensure_default_roles()

    return {"message": "Default roles ensured"}


# Admin endpoints


@router.get("/admin/all", response_model=PaginatedAccountsResponse)
async def get_all_accounts_admin(
    page: int = 1,
    page_size: int = 10,
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _admin_user=Depends(get_current_admin_user),
):
    """
    Get all accounts with pagination and filtering (admin only).

    Args:
        page: Page number (starting from 1)
        page_size: Number of items per page
        role: Filter by role name ('user', 'professional', 'admin')
        search: Search term for full_name or email
        db: Database session
        _admin_user: Current admin user (dependency)

    Returns:
        Paginated list of accounts with role information
    """
    account_service = AccountService(db)

    # Calculate skip from page and page_size
    skip = (page - 1) * page_size

    # Get accounts with filtering
    accounts = account_service.get_accounts_admin(role_name=role, search=search, skip=skip, limit=page_size)

    # Count total accounts
    if role:
        total = account_service.count_accounts_by_role(role, search)
    else:
        # Count all accounts if no role filter
        total = (
            db.query(Account)
            .filter(
                (Account.full_name.ilike(f"%{search}%")) | (Account.email.ilike(f"%{search}%"))
                if search
                else True
            )
            .count()
        )

    # Convert to AccountWithRole
    accounts_with_role = []
    for account in accounts:
        account_dict = {
            "id": account.id,
            "email": account.email,
            "full_name": account.full_name,
            "phone": account.phone,
            "phone_country_code": account.phone_country_code,
            "phone_number": account.phone_number,
            "role_id": account.role_id,
            "is_active": account.is_active,
            "is_verified": account.is_verified,
            "profile_picture": account.profile_picture,
            "last_login": account.last_login,
            "created_at": account.created_at,
            "updated_at": account.updated_at,
            "role_name": account.role.name,
        }
        accounts_with_role.append(account_dict)

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return PaginatedAccountsResponse(
        items=accounts_with_role, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.get("/{account_id}", response_model=AccountWithProfile)
async def get_account_by_id(
    account_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user_id)
):
    """
    Get account by ID with profile information.

    Users can only access their own account, admins can access any account.

    Args:
        account_id: UUID of the account
        db: Database session
        current_user_id: Current authenticated user ID

    Returns:
        Account with role and profile information
    """
    account_service = AccountService(db)

    # Check if user is accessing their own account or is admin
    current_account = account_service.get_account_by_id(current_user_id)
    if not current_account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    is_admin = current_account.role.name == "admin"
    is_own_account = str(current_user_id) == account_id

    if not is_admin and not is_own_account:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own account information"
        )

    # Get account with profile
    account_data = account_service.get_account_with_profile(account_id)

    if not account_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Build response
    account = account_data["account"]
    account_with_role_dict = {
        "id": account.id,
        "email": account.email,
        "full_name": account.full_name,
        "phone": account.phone,
        "phone_country_code": account.phone_country_code,
        "phone_number": account.phone_number,
        "role_id": account.role_id,
        "is_active": account.is_active,
        "is_verified": account.is_verified,
        "profile_picture": account.profile_picture,
        "last_login": account.last_login,
        "created_at": account.created_at,
        "updated_at": account.updated_at,
        "role_name": account_data["role"],
    }

    return AccountWithProfile(account=account_with_role_dict, role=account_data["role"], profile=account_data["profile"])


@router.patch("/{account_id}", response_model=AccountWithProfile)
async def update_account_by_id(
    account_id: str,
    account_update: AccountUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update account information.

    Users can only update their own account, admins can update any account.

    Args:
        account_id: UUID of the account to update
        account_update: Account update data
        db: Database session
        current_user_id: Current authenticated user ID

    Returns:
        Updated account with role and profile information
    """
    account_service = AccountService(db)

    # Check if user is updating their own account or is admin
    current_account = account_service.get_account_by_id(current_user_id)
    if not current_account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    is_admin = current_account.role.name == "admin"
    is_own_account = str(current_user_id) == account_id

    if not is_admin and not is_own_account:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own account information"
        )

    # Update account
    updated_account = account_service.update_account(account_id, account_update)

    if not updated_account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Get updated account with profile
    account_data = account_service.get_account_with_profile(account_id)

    # Build response
    account = account_data["account"]
    account_with_role_dict = {
        "id": account.id,
        "email": account.email,
        "full_name": account.full_name,
        "phone": account.phone,
        "phone_country_code": account.phone_country_code,
        "phone_number": account.phone_number,
        "role_id": account.role_id,
        "is_active": account.is_active,
        "is_verified": account.is_verified,
        "profile_picture": account.profile_picture,
        "last_login": account.last_login,
        "created_at": account.created_at,
        "updated_at": account.updated_at,
        "role_name": account_data["role"],
    }

    return AccountWithProfile(account=account_with_role_dict, role=account_data["role"], profile=account_data["profile"])


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account_by_id(
    account_id: str, db: Session = Depends(get_db), _admin_user=Depends(get_current_admin_user)
):
    """
    Delete account (admin only).

    This is a hard delete that will cascade to profiles and related data.

    Args:
        account_id: UUID of the account to delete
        db: Database session
        _admin_user: Current admin user (dependency)

    Returns:
        204 No Content on success
    """
    account_service = AccountService(db)

    # Check if account exists
    account = account_service.get_account_by_id(account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Delete account (cascade will delete profile)
    db.delete(account)
    db.commit()

    return None


@router.patch("/{account_id}/status", response_model=AccountWithRole)
async def toggle_account_status(
    account_id: str,
    status_update: AccountStatusUpdate,
    db: Session = Depends(get_db),
    _admin_user=Depends(get_current_admin_user),
):
    """
    Toggle account active status (admin only).

    Args:
        account_id: UUID of the account
        status_update: Status update data (is_active boolean)
        db: Database session
        _admin_user: Current admin user (dependency)

    Returns:
        Updated account with role information
    """
    account_service = AccountService(db)

    # Update status
    if status_update.is_active:
        success = account_service.activate_account(account_id)
    else:
        success = account_service.deactivate_account(account_id)

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    # Get updated account
    account = account_service.get_account_by_id(account_id)

    # Build response
    account_with_role_dict = {
        "id": account.id,
        "email": account.email,
        "full_name": account.full_name,
        "phone": account.phone,
        "phone_country_code": account.phone_country_code,
        "phone_number": account.phone_number,
        "role_id": account.role_id,
        "is_active": account.is_active,
        "is_verified": account.is_verified,
        "profile_picture": account.profile_picture,
        "last_login": account.last_login,
        "created_at": account.created_at,
        "updated_at": account.updated_at,
        "role_name": account.role.name,
    }

    return AccountWithRole(**account_with_role_dict)
