"""
Helper functions for creating API responses.
"""

from sqlalchemy.orm import Session

from app.core.security import create_token_response
from app.schemas.auth import UnifiedAuthResponse
from app.schemas.account import AccountWithRole
from app.services.account_service import AccountService
from app.models.account import Account


def build_auth_response(account_data: dict, token_response: dict) -> UnifiedAuthResponse:
    """
    Build unified authentication response.

    Args:
        account_data: Dict with 'account', 'role', and 'profile' keys
        token_response: Dict with 'access_token', 'refresh_token', 'token_type'

    Returns:
        UnifiedAuthResponse with all account and token information
    """
    account_with_role = AccountWithRole(
        **{k: v for k, v in account_data["account"].__dict__.items() if not k.startswith("_")},
        role_name=account_data["role"],
    )

    return UnifiedAuthResponse(
        access_token=token_response["access_token"],
        refresh_token=token_response["refresh_token"],
        token_type=token_response["token_type"],
        account=account_with_role,
        role=account_data["role"],
        profile=account_data["profile"],
    )


def create_account_response_with_tokens(db: Session, account: Account) -> UnifiedAuthResponse:
    """
    Get account with profile and create authentication tokens.

    This is a convenience function that combines:
    1. Creating authentication tokens
    2. Getting account with profile
    3. Building the unified response

    Args:
        db: Database session
        account: Account model instance

    Returns:
        UnifiedAuthResponse with account, profile, and tokens
    """
    account_service = AccountService(db)
    token_response = create_token_response(str(account.id))
    account_data = account_service.get_account_with_profile(account.id)
    return build_auth_response(account_data, token_response)
