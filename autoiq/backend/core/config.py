from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str     = "AutoIQ API"
    mongo_uri: str    = "mongodb://localhost:27017"
    db_name: str      = "autoiq"
    openai_api_key: str = ""
    openai_model_analysis: str = "gpt-4"
    openai_model_chat: str     = "gpt-3.5-turbo"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
