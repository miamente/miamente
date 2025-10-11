"""
Authentication endpoints - Minimal version for token refresh only.

For login and registration, use /api/v1/accounts/* endpoints instead.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_token_response, verify_token
from app.schemas.auth import RefreshToken, Token


router = APIRouter()


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshToken, _db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.

    This endpoint validates the refresh token and generates a new access token
    and refresh token pair.
    """
    account_id = verify_token(refresh_data.refresh_token)

    if account_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_token_response(account_id)
