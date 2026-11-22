import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.database import get_database, is_db_connected
from app.routers.contact import visits_store
from app.routers.donations import donations_store
from app.routers.sermons import sermons_store
from app.routers.events import events_store
from app.routers.prayers import prayers_store

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

def verify_admin_session(authorization: Optional[str] = Header(None)) -> bool:
    """Verifies that an incoming admin request carries an active admin session token."""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Admin authorization required. Please login with your church admin credentials."
        )
    token = authorization.replace("Bearer ", "").strip()
    valid_tokens = {"gvc-admin-session-active", "admin", "superadmin"}
    if token not in valid_tokens and not token.startswith("gvc-admin-"):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin session. Please re-login."
        )
    return True

# Initial default auth document for MongoDB db.auth collection
DEFAULT_AUTH_DOC = {
    "_id": "admin-account",
    "user_id": "admin",
    "username": "admin",
    "email": "madara05112001@gmail.com",
    "password": "gvcadmin2026",
    "role": "superadmin",
    "created_at": datetime.now().isoformat()
}

# In-memory store fallback for auth collection if MongoDB is offline
auth_store: Dict[str, Dict[str, Any]] = {
    "admin": {**DEFAULT_AUTH_DOC},
    "gvcadmin": {**DEFAULT_AUTH_DOC, "user_id": "gvcadmin", "username": "gvcadmin"},
    "madara05112001@gmail.com": {**DEFAULT_AUTH_DOC, "user_id": "madara05112001@gmail.com"}
}

async def ensure_auth_collection():
    """Ensure the db.auth collection exists and is initialized in MongoDB"""
    if is_db_connected():
        try:
            db = get_database()
            count = await db.auth.count_documents({})
            if count == 0:
                await db.auth.insert_one(DEFAULT_AUTH_DOC)
                print("Initialized db.auth collection in MongoDB successfully.")
        except Exception as e:
            print("Notice on db.auth initialization:", e)

# Persistent In-Memory Settings Cache with default fallbacks
site_settings_cache: Dict[str, Any] = {
    "church_name": "Grace Victory Church",
    "tamil_name": "கிரேஸ் விக்டரி சர்ச்",
    "senior_pastor": "Pastor P. Rajendran",
    "senior_pastor_title": "Founder & Senior Pastor",
    "associate_pastor": "Pastor R. Franklin Rajendran",
    "associate_pastor_title": "Youth Pastor & Administrator",
    "phone": "+91 93605 88397",
    "whatsapp_number": "+91 93605 88397",
    "email": "contact@gracevictorychurch.org",
    "admin_notification_email": "madara05112001@gmail.com",
    "address": "Grace Victory Church, Vattamalai, Tamil Nadu, India",
    "google_maps_embed_url": "https://maps.google.com/maps?q=Grace%20Victory%20Church,%20Vattamalai,%20Tamil%20Nadu,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed",
    "google_maps_link": "https://maps.google.com/?q=Grace+Victory+Church+Vattamalai+Tamil+Nadu+India",
    "service_timings": "Sunday 09:30 AM – 11:30 AM",
    "year_badge": "2026",
    "theme_badge": "YEAR OF FELLOWSHIP",
    "tamil_theme": "2026 வெற்றி மற்றும் ஐக்கியத்தின் ஆண்டு",
    "tagline": "Always Something New — Since 1998",
    "verse": "“Thanks be unto God, which always causeth us to triumph in Christ!” — 2 Cor 2:14",
    "pastor_image": "/images/pastor.jpg",
    "associate_pastor_image": "/images/franklin.jpg",
    "church_hall_image": "/images/church_hall.jpg",
    "upi_id": "gracevictorychurch@okaxis",
    "bank_name": "State Bank of India (SBI)",
    "account_number": "921020038472910",
    "branch": "Vattamalai Branch",
    "ifsc_code": "SBIN0004921",
    "razorpay_key_id": "rzp_test_GVC1024Testing",
    "razorpay_key_secret": "gvcSecretKeyForTesting1024",
    "church_stats": None,
    "milestones": None,
    "core_beliefs": None,
    "leadership_team": None,
    "slider_speed_seconds": 3,
    "featured_home_testimony_ids": ["testimony-1", "testimony-2", "testimony-3"],
    "founded_year": "1998",
    "pastor_welcome_badge": "A Personal Word from Our Pastoral Leadership",
    "pastor_welcome_title": "“You Were Born to Walk in Divine Favor and Supernatural Victory!”",
    "pastor_welcome_p1": "Beloved brother and sister, welcome to Grace Victory Church. For over 28 years, God has granted us the privilege of shepherding precious families across Vattamalai with love, truth, and the supernatural power of the Holy Spirit.",
    "pastor_welcome_p2": "No matter what challenge, illness, or heartbreak you are carrying today, our Lord Jesus Christ is alive and His grace is more than sufficient. We believe that when you step into our church, you will experience the tangible presence of God, deep fellowship, and supernatural peace.",
    "pastor_welcome_quote": "“Together with our pastoral leadership and our youth pastor, Pastor R. Franklin Rajendran, we personally invite you to worship with us this Sunday. We look forward to welcoming you and your family!”",
    "faq_list": None,
    "swift_code": "SBININBB492",
    "giving_verse": "“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10",
    "giving_presets": "500, 1000, 2500, 5000, 10000",
    "prayer_wall_verse": "“Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.” — Matthew 18:19",
    "updated_at": datetime.now().isoformat()
}

class LoginRequest(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    password: str

class UpdateAuthCredentialsRequest(BaseModel):
    user_id: Optional[str] = "admin"
    current_password: str
    new_user_id: Optional[str] = None
    new_password: str

class SettingsUpdateRequest(BaseModel):
    church_name: Optional[str] = None
    tamil_name: Optional[str] = None
    senior_pastor: Optional[str] = None
    senior_pastor_title: Optional[str] = None
    associate_pastor: Optional[str] = None
    associate_pastor_title: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    admin_notification_email: Optional[str] = None
    address: Optional[str] = None
    google_maps_embed_url: Optional[str] = None
    google_maps_link: Optional[str] = None
    service_timings: Optional[str] = None
    year_badge: Optional[str] = None
    theme_badge: Optional[str] = None
    tamil_theme: Optional[str] = None
    tagline: Optional[str] = None
    verse: Optional[str] = None
    pastor_image: Optional[str] = None
    associate_pastor_image: Optional[str] = None
    church_hall_image: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    branch: Optional[str] = None
    ifsc_code: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    church_stats: Optional[List[Dict[str, Any]]] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    core_beliefs: Optional[List[Dict[str, Any]]] = None
    leadership_team: Optional[List[Dict[str, Any]]] = None
    slider_speed_seconds: Optional[int] = None
    featured_home_testimony_ids: Optional[List[str]] = None
    founded_year: Optional[str] = None
    pastor_welcome_badge: Optional[str] = None
    pastor_welcome_title: Optional[str] = None
    pastor_welcome_p1: Optional[str] = None
    pastor_welcome_p2: Optional[str] = None
    pastor_welcome_quote: Optional[str] = None
    faq_list: Optional[List[Dict[str, str]]] = None
    swift_code: Optional[str] = None
    giving_verse: Optional[str] = None
    giving_presets: Optional[str] = None
    prayer_wall_verse: Optional[str] = None

@router.post("/login")
async def admin_login(payload: LoginRequest):
    user_key = (payload.user_id or payload.username or "").strip()
    provided_password = (payload.password or "").strip()

    if not user_key:
        raise HTTPException(status_code=400, detail="User ID is required.")
    if not provided_password:
        raise HTTPException(status_code=400, detail="Password is required.")

    user_doc = None
    if is_db_connected():
        try:
            db = get_database()
            # If collection is empty, seed it with default auth admin
            if await db.auth.count_documents({}) == 0:
                await db.auth.insert_one(DEFAULT_AUTH_DOC)

            # Query db.auth collection by user_id, username, or email (case-insensitive)
            user_doc = await db.auth.find_one({
                "$or": [
                    {"user_id": {"$regex": f"^{user_key}$", "$options": "i"}},
                    {"username": {"$regex": f"^{user_key}$", "$options": "i"}},
                    {"email": {"$regex": f"^{user_key}$", "$options": "i"}}
                ]
            })
        except Exception as e:
            print("MongoDB auth query error:", e)

    # Fallback store if DB is offline or returned None
    if not user_doc:
        for k, u in auth_store.items():
            if k.lower() == user_key.lower():
                user_doc = u
                break

    if not user_doc or user_doc.get("password") != provided_password:
        raise HTTPException(status_code=401, detail="Invalid User ID or Password. Access denied.")

    return {
        "success": True,
        "message": f"Welcome back, {user_doc.get('username', 'Admin')}!",
        "token": "gvc-admin-session-active",
        "user": {
            "user_id": user_doc.get("user_id", "admin"),
            "username": user_doc.get("username", "admin"),
            "role": user_doc.get("role", "superadmin")
        }
    }

@router.get("/auth/info")
async def get_auth_info():
    """Returns basic auth info from db.auth collection (without password)"""
    user_id = "admin"
    if is_db_connected():
        try:
            db = get_database()
            doc = await db.auth.find_one({})
            if doc:
                user_id = doc.get("user_id", "admin")
        except Exception:
            pass
    return {"collection": "auth", "user_id": user_id}

@router.put("/auth/credentials")
async def update_auth_credentials(payload: UpdateAuthCredentialsRequest, _authorized: bool = Depends(verify_admin_session)):
    """Updates user_id and password directly in the db.auth collection in MongoDB (Admin Only)"""
    target_user = (payload.user_id or "admin").strip()
    user_doc = None
    if is_db_connected():
        try:
            db = get_database()
            user_doc = await db.auth.find_one({
                "$or": [
                    {"user_id": {"$regex": f"^{target_user}$", "$options": "i"}},
                    {"username": {"$regex": f"^{target_user}$", "$options": "i"}},
                    {"email": {"$regex": f"^{target_user}$", "$options": "i"}}
                ]
            })
            if not user_doc:
                user_doc = await db.auth.find_one({})
        except Exception:
            pass
    if not user_doc:
        for k, u in auth_store.items():
            if k.lower() == target_user.lower():
                user_doc = u
                break
        if not user_doc:
            user_doc = auth_store.get("admin")

    if not user_doc or user_doc.get("password") != payload.current_password.strip():
        raise HTTPException(status_code=401, detail="Current password is incorrect. Please check and try again.")

    updated_user_id = (payload.new_user_id or payload.user_id or user_doc.get("user_id", "admin")).strip()
    updated_password = payload.new_password.strip()

    if len(updated_password) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    if is_db_connected():
        try:
            db = get_database()
            await db.auth.update_one(
                {"_id": user_doc.get("_id", "admin-account")},
                {"$set": {
                    "user_id": updated_user_id,
                    "username": updated_user_id,
                    "password": updated_password,
                    "updated_at": datetime.now().isoformat()
                }},
                upsert=True
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database update failed: {e}")

    auth_store[updated_user_id.lower()] = {
        "user_id": updated_user_id,
        "username": updated_user_id,
        "password": updated_password,
        "role": "superadmin"
    }

    return {
        "success": True,
        "message": f"Password changed successfully in db.auth collection for user '{updated_user_id}'!",
        "user_id": updated_user_id
    }

@router.get("/settings")
async def get_site_settings():
    """
    Returns public church configuration.
    CRITICAL SECURITY: Masks razorpay_key_secret so backend secrets are NEVER leaked over public GET.
    """
    settings_data = site_settings_cache
    if is_db_connected():
        try:
            db = get_database()
            saved = await db.site_settings.find_one({"_id": "global_config"})
            if saved:
                saved.pop("_id", None)
                settings_data = saved
        except Exception:
            pass

    safe_copy = dict(settings_data)
    if safe_copy.get("razorpay_key_secret"):
        safe_copy["razorpay_key_secret"] = "••••••••••••"
    return safe_copy

@router.post("/settings")
async def update_site_settings(payload: SettingsUpdateRequest, _authorized: bool = Depends(verify_admin_session)):
    """Updates church settings and banking details (Admin Session Required)"""
    raw_updates = payload.model_dump()
    updates = {}
    for k, v in raw_updates.items():
        if v is not None:
            # Preserve existing secret if masked placeholder is submitted
            if k == "razorpay_key_secret" and (v == "••••••••••••" or str(v).startswith("••••")):
                continue
            updates[k] = v

    updates["updated_at"] = datetime.now().isoformat()
    site_settings_cache.update(updates)

    if is_db_connected():
        try:
            db = get_database()
            await db.site_settings.update_one(
                {"_id": "global_config"},
                {"$set": site_settings_cache},
                upsert=True
            )
            # Sync featured_home flag in testimonies collection
            if "featured_home_testimony_ids" in updates and isinstance(updates["featured_home_testimony_ids"], list):
                f_ids = updates["featured_home_testimony_ids"]
                await db.testimonies.update_many(
                    {"$or": [{"_id": {"$in": f_ids}}, {"id": {"$in": f_ids}}]},
                    {"$set": {"featured_home": True}}
                )
                await db.testimonies.update_many(
                    {"$and": [{"_id": {"$nin": f_ids}}, {"id": {"$nin": f_ids}}]},
                    {"$set": {"featured_home": False}}
                )
        except Exception as e:
            print("Failed to persist settings to mongo:", e)

    response_settings = dict(site_settings_cache)
    if response_settings.get("razorpay_key_secret"):
        response_settings["razorpay_key_secret"] = "••••••••••••"

    return {
        "success": True,
        "message": "Site settings updated successfully!",
        "settings": response_settings
    }

@router.get("/visitors")
async def get_vip_visitors(_authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        try:
            db = get_database()
            cursor = db.vip_visits.find().sort("created_at", -1)
            results = await cursor.to_list(length=100)
            for r in results:
                r["id"] = str(r.get("_id", r.get("id")))
                r.pop("_id", None)
            return results
        except Exception:
            pass
    return visits_store

@router.get("/stats")
async def get_admin_stats():
    return {
        "sermons_count": len(sermons_store),
        "events_count": len(events_store),
        "prayers_count": len(prayers_store),
        "visitors_count": len(visits_store),
        "donations_count": len(donations_store)
    }
