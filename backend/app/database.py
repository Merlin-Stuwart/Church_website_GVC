
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
    logger.info("Checking MongoDB connection...")

    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )

        db_manager.db = db_manager.client[settings.DATABASE_NAME]

        # Verify MongoDB connection
        await asyncio.wait_for(
            db_manager.client.admin.command("ping"),
            timeout=15
        )

        db_manager.is_connected = True

        logger.info(
            "Successfully connected to MongoDB (%s)",
            settings.DATABASE_NAME
        )

    except Exception:
        db_manager.is_connected = False
        db_manager.db = None

        if db_manager.client is not None:
            db_manager.client.close()
            db_manager.client = None

        logger.error(
            "MongoDB connection failed. Check database configuration and network access."
        )

        # Prevent production from running without MongoDB
        raise RuntimeError(
            "MongoDB connection failed. Backend startup stopped."
        ) from None


async def close_mongo_connection():
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")

        try:
            db_manager.client.close()
        except Exception:
            logger.warning("Error while closing MongoDB connection.")

        db_manager.client = None
        db_manager.db = None
        db_manager.is_connected = False

        logger.info("MongoDB connection closed.")


def get_database():
    return db_manager.db


def is_db_connected():
    return db_manager.is_connected
