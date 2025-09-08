"""
API v1 router configuration.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, professionals, appointments, availability, payments

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
