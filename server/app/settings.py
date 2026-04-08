"""
Application settings loaded from environment variables (and optionally a .env file).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    tenant_id: str
    client_id: str
    client_secret: str
    port: int = 8000

    # Comma-separated list of allowed CORS origins.
    # Example: CORS_ORIGINS=http://localhost:5173,https://myapp.azurewebsites.net
    cors_origins: list[str] = ["http://localhost:5173"]

    # Enable HSTS header. Set to True when serving behind HTTPS in production.
    enforce_https: bool = False


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
