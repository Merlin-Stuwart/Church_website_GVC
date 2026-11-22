import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Grace Victory Church API"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "grace_victory_church")
    
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
    ]
    
    # Church Details
    CHURCH_NAME: str = os.getenv("CHURCH_NAME", "Grace Victory Church")
    CHURCH_EMAIL: str = os.getenv("CHURCH_EMAIL", "contact@gracevictorychurch.org")
    CHURCH_PHONE: str = os.getenv("CHURCH_PHONE", "+91 93605 88397")
    CHURCH_ADDRESS: str = os.getenv("CHURCH_ADDRESS", "Grace Victory Church, Vattamalai, Tamil Nadu, India")
    
    # Admin Credentials (Set these securely in production environment variables)
    ADMIN_USER_ID: str = os.getenv("ADMIN_USER_ID", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "gvcadmin2026")
    ADMIN_NOTIFICATION_EMAIL: str = os.getenv("ADMIN_NOTIFICATION_EMAIL", "contact@gracevictorychurch.org")

    # Email Notification Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "notifications@gracevictorychurch.org")

settings = Settings()
