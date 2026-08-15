from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./pamoja.db"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    COMMISSION_RATE: float = 0.15
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    ADMIN_EMAIL: str = "admin@pamoja.ke"
    ADMIN_PASSWORD: str = "admin123"
    UPLOAD_DIR: str = "./uploads"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()