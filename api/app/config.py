import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedReach AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "medreach_ai_super_secret_jwt_key_2026_hackathon_demo")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo
    
    # SQLite by default for zero-config portable local dev, or PostgreSQL when DATABASE_URL is set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/medreach.db" if (os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")) else "sqlite:///./medreach.db"
    )
    
    # AI OCR Provider mode (DEMO / TESSERACT / VISION)
    AI_OCR_PROVIDER: str = os.getenv("AI_OCR_PROVIDER", "DEMO")
    
    # Upload storage directory
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR",
        "/tmp/uploads/prescriptions" if (os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")) else "./uploads/prescriptions"
    )

    class Config:
        case_sensitive = True

settings = Settings()
