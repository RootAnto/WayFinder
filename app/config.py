from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    SQLALCHEMY_DATABASE_URL: str

    class Config:
        env_file = Path(__file__).parent.parent / "app/.env"

settings = Settings()
