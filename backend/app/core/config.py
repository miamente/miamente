"""
Application configuration settings.
"""

import secrets
from typing import List

from functools import lru_cache
from pydantic import AnyHttpUrl, ConfigDict, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Basic settings
    PROJECT_NAME: str = "Miamente Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    DEBUG: bool = False

    # Server settings
    SERVER_NAME: str = "localhost"
    SERVER_HOST: AnyHttpUrl = "http://localhost:8000"

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "https://miamente.vercel.app",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value: str | List[str]) -> List[str]:
        """Accept a CSV string or list for CORS origins and normalize to list[str]."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",")]
        if isinstance(value, list):
            return value
        raise ValueError(value)

    # Allowed hosts
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "*.railway.app",
        "*.vercel.app",
    ]

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, value: str | List[str]) -> List[str]:
        """Accept a CSV string or list for allowed hosts and normalize to list[str]."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",")]
        if isinstance(value, list):
            return value
        raise ValueError(value)

    # Database settings
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "miamente"
    DATABASE_USER: str = ""
    DATABASE_PASSWORD: str = ""
    DATABASE_URL: str = ""  # pylint: disable=invalid-name

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate database credentials
        if not self.DATABASE_URL and (not self.DATABASE_USER or not self.DATABASE_PASSWORD):
            raise ValueError(
                "Database credentials must be provided. "
                "Set either DATABASE_URL or both DATABASE_USER and DATABASE_PASSWORD"
            )
        # Construct DATABASE_URL from individual components if not provided
        if not self.DATABASE_URL:
            url = (
                f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
            self.DATABASE_URL = url  # pylint: disable=invalid-name

    # JWT settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"

    # Timezone
    TIMEZONE: str = "America/Bogota"

    model_config = ConfigDict(case_sensitive=True, env_file=".env")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()
