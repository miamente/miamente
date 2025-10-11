"""
Account endpoints for unified authentication system.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import UnifiedLogin, UnifiedAuthResponse
from app.services.account_service import AccountService
from app.services.role_service import RoleService
from app.utils.auth import get_current_user_id
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
