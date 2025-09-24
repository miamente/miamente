"""
Application configuration settings.
"""

import logging
import os
import secrets
from functools import lru_cache
from typing import List, Union

from pydantic import ConfigDict, field_validator
from pydantic_settings import BaseSettings

# Set up logging
logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings."""

    # --- Básicos ---
    PROJECT_NAME: str = "Miamente Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    DEBUG: bool = False

    # --- Servidor ---
    SERVER_NAME: str = "localhost"
    SERVER_HOST: str = "http://localhost:8000"

    # --- CORS ---
    # Acepta: "*", CSV ("http://a,http://b") o lista desde código/tests.
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:3001,http://localhost:8000"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        """
        Acepta:
          - "*" como wildcard (devuelve ["*"])
          - Cadena CSV: "http://a,http://b"
          - Lista: ["http://a", "http://b"]
        Normaliza a list[str].
        """
        if isinstance(value, str):
            value = value.strip()
            if value == "*":
                return ["*"]
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        raise ValueError(f"Invalid BACKEND_CORS_ORIGINS: {value}")

    # --- Allowed hosts ---
    # Igual lógica que CORS: "*", CSV o lista.
    ALLOWED_HOSTS: Union[str, List[str]] = "localhost,127.0.0.1"

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, value: Union[str, List[str]]) -> List[str]:
        """
        Acepta:
          - "*"
          - Cadena CSV
          - Lista
        Normaliza a list[str].
        """
        if isinstance(value, str):
            value = value.strip()
            if value == "*":
                return ["*"]
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        raise ValueError(f"Invalid ALLOWED_HOSTS: {value}")

    # --- Base de datos ---
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "miamente"
    DATABASE_USER: str = ""
    DATABASE_PASSWORD: str = ""
    DATABASE_URL: str = ""  # pylint: disable=invalid-name

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validar credenciales mínimas
        if not self.DATABASE_URL and (not self.DATABASE_USER or not self.DATABASE_PASSWORD):
            raise ValueError(
                "Database credentials must be provided. "
                "Set either DATABASE_URL or both DATABASE_USER and DATABASE_PASSWORD"
            )
        # Construir DATABASE_URL si no viene dada
        if not self.DATABASE_URL:
            url = (
                f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )
            self.DATABASE_URL = url  # pylint: disable=invalid-name

    # --- JWT ---
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 días
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 días
    ALGORITHM: str = "HS256"

    # --- Zona horaria ---
    TIMEZONE: str = "America/Bogota"

    # --- Config Pydantic Settings ---
    # Busca primero en variables de entorno; luego en .env; respeta mayúsculas exactas.
    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env",
    )

    # --- Helpers opcionales ---
    @property
    def cors_allow_all(self) -> bool:
        """True si el wildcard '*' está activo para CORS."""
        return self.BACKEND_CORS_ORIGINS == ["*"]

    @property
    def hosts_allow_all(self) -> bool:
        """True si el wildcard '*' está activo para hosts permitidos."""
        return self.ALLOWED_HOSTS == ["*"]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    logger.info("SETTINGS: Creating new Settings instance")
    return Settings()


def clear_settings_cache():
    """Clear the settings cache to force reload from environment variables."""
    logger.info("SETTINGS: Clearing settings cache")
    get_settings.cache_clear()


def reload_settings():
    """Reload settings from environment variables and return the new instance."""
    logger.info("SETTINGS: Reloading settings from environment")
    clear_settings_cache()
    return get_settings()


def configure_logging():
    """Configure logging for the application."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Set up basic logging configuration
    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    logger.info("LOGGING: Configured logging with level: %s", log_level)
    return log_level
