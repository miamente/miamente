"""
Test configuration for backend tests.
"""
import os
from app.core.config import Settings


class TestSettings(Settings):
    """Test-specific settings."""
    
    # Override database URL for testing
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Test-specific secret key
    SECRET_KEY: str = "test-secret-key-for-testing-only"
    
    # Shorter token expiration for tests
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Test CORS origins
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # Test allowed hosts
    ALLOWED_HOSTS: list = ["localhost", "127.0.0.1"]
    
    # Test environment
    ENVIRONMENT: str = "test"


# Export test settings
test_settings = TestSettings()
