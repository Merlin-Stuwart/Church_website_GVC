from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, is_db_connected, get_database
from app.routers import sermons, events, prayers, testimonies, contact, donations, admin, ministries, notifications

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    # Initialize db.auth collection
    try:
        from app.routers.admin import ensure_auth_collection, site_settings_cache
        await ensure_auth_collection()
        # Hydrate in-memory settings cache from MongoDB so cold starts use live settings immediately
        if is_db_connected():
            db = get_database()
            saved = await db.site_settings.find_one({"_id": "global_config"})
            if saved:
                saved.pop("_id", None)
                site_settings_cache.update(saved)
    except Exception as e:
        logger.warning("Startup init check: %s", e)
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
    from app.routers.admin import site_settings_cache
    cfg = dict(site_settings_cache)
    if is_db_connected():
        try:
            db = get_database()
            saved = await db.site_settings.find_one({"_id": "global_config"})
            if saved:
                cfg.update(saved)
        except Exception:
            pass

    return {
        "status": "healthy",
        "church_name": cfg.get("church_name") or settings.CHURCH_NAME,
        "email": cfg.get("email") or settings.CHURCH_EMAIL,
        "phone": cfg.get("phone") or settings.CHURCH_PHONE,
        "address": cfg.get("address") or settings.CHURCH_ADDRESS,
        "database": {
            "type": "MongoDB",
            "connected": is_db_connected()
        },
        "service_schedule": [
            {"service": "Sunday Worship Service", "time": cfg.get("service_timings") or "09:30 AM – 11:30 AM"},
            {"service": "Wednesday Mid-Week Bible Study", "time": cfg.get("wednesday_timing") or "07:00 PM – 08:30 PM"},
            {"service": "Friday Fasting Prayer", "time": cfg.get("friday_timing") or "10:30 AM – 01:30 PM"},
        ],
        "daily_verse": {
            "verse": cfg.get("verse") or "“Thanks be unto God, which always causeth us to triumph in Christ!” — 2 Cor 2:14",
        }
    }
