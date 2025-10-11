"""
API v1 router configuration.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    accounts,  # Unified account system
    auth,  # Token refresh only
    files,
    modalities,
    professional_modalities,
    professional_specialties,
    professional_therapeutic_approaches,
    specialties,
    therapeutic_approaches,
)

api_router = APIRouter()

# Unified account system endpoints
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])

# Auth endpoints (token refresh only)
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# File management
api_router.include_router(files.router, prefix="/files", tags=["files"])

# Legacy endpoints (keep for backward compatibility)
api_router.include_router(specialties.router, prefix="/specialties", tags=["specialties"])
api_router.include_router(
    professional_specialties.router,
    prefix="/professional-specialties",
    tags=["professional-specialties"],
)

# New mental health endpoints
api_router.include_router(modalities.router, prefix="/modalities", tags=["modalities"])
api_router.include_router(
    therapeutic_approaches.router,
    prefix="/therapeutic-approaches",
    tags=["therapeutic-approaches"],
)
api_router.include_router(
    professional_modalities.router,
    prefix="/professional-modalities",
    tags=["professional-modalities"],
)
api_router.include_router(
    professional_therapeutic_approaches.router,
    prefix="/professional-therapeutic-approaches",
    tags=["professional-therapeutic-approaches"],
)
