"""
Application configuration settings.
"""
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, ConfigDict
from pydantic_settings import BaseSettings
import secrets


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
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:8000", "https://miamente.vercel.app"]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    # Allowed hosts
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "*.railway.app", "*.vercel.app"]
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    # Database settings
    DATABASE_URL: str = "postgresql://manueljurado@localhost:5432/miamente"
    
    # JWT settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"
    
    # Timezone
    TIMEZONE: str = "America/Bogota"
    
    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env"
    )


settings = Settings()
