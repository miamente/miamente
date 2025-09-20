"""
Authentication utilities.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import verify_token

security = HTTPBearer(auto_error=False)

# Error messages
INVALID_AUTH_CREDENTIALS_MESSAGE = "Invalid authentication credentials"


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """Get current user ID from token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_AUTH_CREDENTIALS_MESSAGE,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id
