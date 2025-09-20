"""
Test configuration settings for backend tests.
"""

from typing import List, Union

from pydantic import field_validator, ConfigDict
from pydantic_settings import BaseSettings

# import secrets  # Unused import


class Settings(BaseSettings):
    """Test application settings."""

    # Basic settings
    PROJECT_NAME: str = "Miamente Test Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "test-secret-key-for-testing-only"
    DEBUG: bool = True

    # Server settings
    SERVER_NAME: str = "localhost"
    SERVER_HOST: str = "http://localhost:8000"

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from string or list format."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Allowed hosts
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse allowed hosts from string or list format."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Database settings - using test database
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "miamente_test"
    DATABASE_USER: str = ""
    DATABASE_PASSWORD: str = ""
    DATABASE_URL: str = ""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate database credentials - require password protection for tests too
        if not self.DATABASE_URL and (not self.DATABASE_USER or not self.DATABASE_PASSWORD):
            raise ValueError(
                "Test database credentials must be provided with password protection. "
                "Set either DATABASE_URL (with password) or both DATABASE_USER and "
                "DATABASE_PASSWORD environment variables."
            )

        # If DATABASE_USER is provided, DATABASE_PASSWORD is required
        if self.DATABASE_USER and not self.DATABASE_PASSWORD:
            raise ValueError(
                "DATABASE_PASSWORD is required when DATABASE_USER is provided. "
                "Test database access must be password protected."
            )

        # Construct DATABASE_URL from individual components if not provided
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )

        # Validate that DATABASE_URL contains password if provided directly
        if self.DATABASE_URL and "://" in self.DATABASE_URL:
            # Check if URL contains password (format: postgresql://user:password@host:port/db)
            if "@" in self.DATABASE_URL and ":" in self.DATABASE_URL.split("@")[0].split("://")[1]:
                # URL contains password, which is good
                pass
            else:
                raise ValueError(
                    "Test DATABASE_URL must include password protection. "
                    "Format: postgresql://username:password@host:port/database"
                )

    # JWT settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"

    # Timezone
    TIMEZONE: str = "America/Bogota"

    model_config = ConfigDict(case_sensitive=True, env_file=".env.test")


# Test settings will be created when needed to ensure proper validation
test_settings = None


def get_test_settings() -> Settings:
    """Get test settings, creating them if they don't exist."""
    global test_settings
    if test_settings is None:
        test_settings = Settings()
    return test_settings
