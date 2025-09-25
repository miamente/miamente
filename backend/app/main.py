"""
Main FastAPI application module for Miamente backend.
"""

import logging
import uvicorn

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.api import api_router
from app.core.config import get_settings, clear_settings_cache, configure_logging
from app.core.database import Base, get_engine

# Configure logging first
configure_logging()
logger = logging.getLogger(__name__)

# Clear settings cache to ensure fresh environment variable reading
clear_settings_cache()

# Create database tables with error handling
try:
    engine = get_engine()
    if engine is not None:
        logger.info("DATABASE: Creating database tables")
        Base.metadata.create_all(bind=engine)
        logger.info("DATABASE: Database tables created successfully")
    else:
        logger.error("DATABASE: Cannot create tables - database engine is None")
except (SQLAlchemyError, ConnectionError, TimeoutError) as exc:
    logger.error("DATABASE: Failed to create database tables: %s", exc)
    logger.warning("APPLICATION: Starting without database tables - will retry on first request")

app = FastAPI(
    title=get_settings().PROJECT_NAME,
    version=get_settings().VERSION,
    description="Backend API for Miamente mental health platform",
    openapi_url=f"{get_settings().API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS with logging
settings = get_settings()
logger.info("MAIN: Setting up CORS with origins: %s", settings.BACKEND_CORS_ORIGINS)
logger.info("MAIN: Setting up ALLOWED_HOSTS: %s", settings.ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)


# Add database error handling middleware
@app.middleware("http")
async def database_error_handler(request: Request, call_next):
    """Middleware to handle database connection errors gracefully."""
    try:
        response = await call_next(request)
        return response
    except SQLAlchemyError as db_error:
        logger.error("DATABASE_MIDDLEWARE: SQLAlchemy error: %s", db_error)
        logger.error("DATABASE_MIDDLEWARE: Error type: %s", type(db_error).__name__)

        return JSONResponse(
            status_code=503,
            content={
                "error": "Database temporarily unavailable",
                "message": "The database service is currently experiencing issues. Please try again later.",
                "error_type": "database_error",
                "status_code": 503,
            },
        )
    except (ConnectionError, TimeoutError) as exc:
        logger.error("DATABASE_MIDDLEWARE: Unexpected error: %s", exc)
        logger.error("DATABASE_MIDDLEWARE: Error type: %s", type(exc).__name__)

        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred. Please try again later.",
                "error_type": "internal_error",
                "status_code": 500,
            },
        )


# Include API router
app.include_router(api_router, prefix=get_settings().API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse(
        content={
            "message": "Miamente Backend API",
            "version": get_settings().VERSION,
            "docs": "/docs",
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    # Simple health check - always return healthy
    return JSONResponse(content={"status": "healthy", "services": {"api": "healthy"}})


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=get_settings().DEBUG,
        log_level="info",
    )
