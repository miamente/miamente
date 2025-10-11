"""
Authentication utilities.
"""

from typing import Optional
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.core.database import get_db
from app.services.account_service import AccountService

security = HTTPBearer(auto_error=False)

# Error messages
INVALID_AUTH_CREDENTIALS_MESSAGE = "Invalid authentication credentials"


def _extract_account_id_from_credentials(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    """
    Extract and validate account ID from credentials.

    Args:
        credentials: HTTP Authorization credentials with Bearer token

    Returns:
        Account ID as string

    Raises:
        HTTPException: If credentials are invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    account_id = verify_token(token)

    if account_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_AUTH_CREDENTIALS_MESSAGE,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return account_id


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    Get current account ID from token.

    This is a dependency function that extracts the account ID from the JWT token
    in the Authorization header.
    """
    return _extract_account_id_from_credentials(credentials)


def get_current_admin_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Get current admin account from token.

    This dependency function validates that the authenticated account has admin role.

    Returns:
        Account object if user is admin

    Raises:
        HTTPException: If not authenticated, account not found, or not admin
    """
    # Extract and validate account ID from token
    account_id = _extract_account_id_from_credentials(credentials)

    # Convert to UUID
    try:
        account_uuid = uuid.UUID(account_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account ID format",
        )

    # Get account
    account_service = AccountService(db)
    account = account_service.get_account_by_id(account_uuid)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    # Verify admin role
    if account.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return account
