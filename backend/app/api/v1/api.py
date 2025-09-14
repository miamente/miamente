"""
API v1 router configuration.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, professionals, appointments, availability, payments, files, 
    specialties, professional_specialties,
    modalities, therapeutic_approaches, specialties_new,
    professional_modalities, professional_specialties_new, professional_therapeutic_approaches
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(files.router, prefix="/files", tags=["files"])

# Legacy endpoints (keep for backward compatibility)
api_router.include_router(specialties.router, prefix="/specialties", tags=["specialties"])
api_router.include_router(professional_specialties.router, prefix="/professional-specialties", tags=["professional-specialties"])

# New mental health endpoints
api_router.include_router(modalities.router, prefix="/modalities", tags=["modalities"])
api_router.include_router(therapeutic_approaches.router, prefix="/therapeutic-approaches", tags=["therapeutic-approaches"])
api_router.include_router(specialties_new.router, prefix="/specialties-new", tags=["specialties-new"])
api_router.include_router(professional_modalities.router, prefix="/professional-modalities", tags=["professional-modalities"])
api_router.include_router(professional_specialties_new.router, prefix="/professional-specialties-new", tags=["professional-specialties-new"])
api_router.include_router(professional_therapeutic_approaches.router, prefix="/professional-therapeutic-approaches", tags=["professional-therapeutic-approaches"])
