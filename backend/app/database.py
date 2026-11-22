import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False

db_manager = Database()

async def connect_to_mongo():
    logger.info("Checking MongoDB connection at: %s", settings.MONGODB_URL)
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=1000,
            connectTimeoutMS=1000,
            socketTimeoutMS=1000
        )
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        # Ping with strict 1.5s timeout so startup never hangs if MongoDB is not yet running
        await asyncio.wait_for(db_manager.client.admin.command('ping'), timeout=1.5)
        db_manager.is_connected = True
        logger.info("Successfully connected to MongoDB (%s)", settings.DATABASE_NAME)
    except Exception as e:
        db_manager.is_connected = False
        logger.warning("MongoDB not active (%s). Backend running seamlessly in fallback memory storage mode.", e)

async def close_mongo_connection():
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        try:
            db_manager.client.close()
        except Exception:
            pass
        logger.info("MongoDB connection closed.")

def get_database():
    return db_manager.db

def is_db_connected():
    return db_manager.is_connected
