from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, is_db_connected
from app.routers import sermons, events, prayers, testimonies, contact, donations, admin, ministries, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    # Initialize db.auth collection
    try:
        from app.routers.admin import ensure_auth_collection
        await ensure_auth_collection()
    except Exception as e:
        logger.warning("Auth collection init check: %s", e)
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for Grace Victory Church (GVC) - Empowering Faith & Ministries with FastAPI and MongoDB.",
    lifespan=lifespan
)

# Production & Development CORS Configuration
raw_origins = [o.strip() for o in settings.CORS_ORIGINS if o.strip() and o.strip() != "*"]
has_wildcard = "*" in settings.CORS_ORIGINS or not raw_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=raw_origins if not has_wildcard else ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_origin_regex=r"^https?://.*" if has_wildcard else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(sermons.router)
app.include_router(events.router)
app.include_router(prayers.router)
app.include_router(testimonies.router)
app.include_router(ministries.router)
app.include_router(contact.router)
app.include_router(donations.router)
app.include_router(admin.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Grace Victory Church (GVC) API",
        "church": settings.CHURCH_NAME,
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/status")
async def get_system_status():
    return {
        "status": "healthy",
        "church_name": settings.CHURCH_NAME,
        "email": settings.CHURCH_EMAIL,
        "phone": settings.CHURCH_PHONE,
        "address": settings.CHURCH_ADDRESS,
        "database": {
            "type": "MongoDB",
            "connected": is_db_connected()
        },
        "service_schedule": [
            {"service": "Sunday Worship Service", "time": "09:30 AM - 11:30 AM"},
            {"service": "Wednesday Mid-Week Bible Study", "time": "07:00 PM - 08:30 PM"},
            {"service": "Friday Fasting Prayer", "time": "10:30 AM - 01:30 PM"},
            {"service": "Saturday Youth Fellowship", "time": "06:00 PM - 08:00 PM"}
        ],
        "daily_verse": {
            "verse": "Now thanks be unto God, which always causeth us to triumph in Christ!",
            "tamil_verse": "எப்பொழுதும் கிறிஸ்துவுக்குள் எங்களை வெற்றிபெறச் செய்கிற தேவனுக்கு ஸ்தோத்திரம்!",
            "reference": "2 Corinthians 2:14"
        }
    }
