import os
import hmac
import hashlib
import secrets
import re
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.config import settings
from app.database import get_database, is_db_connected
from app.routers.contact import visits_store
from app.routers.donations import donations_store
from app.routers.sermons import sermons_store
from app.routers.events import events_store
from app.routers.prayers import prayers_store
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "your_long_random_secret_key_here_gvc_church_2026")
if len(AUTH_SECRET_KEY) < 32:
    AUTH_SECRET_KEY = AUTH_SECRET_KEY.ljust(32, "x")

def create_admin_token(user_id: str) -> str:
    """Creates a cryptographically signed HMAC-SHA256 session token with timestamp."""
    timestamp = int(datetime.now().timestamp())
    body = f"{user_id}:{timestamp}"
    signature = hmac.new(AUTH_SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{user_id}.{timestamp}.{signature}"

def verify_admin_session(authorization: Optional[str] = Header(None)) -> bool:
    """
    Cryptographically verifies incoming admin HMAC token.
    Enforces server-signed validity and 7-day expiration.
    Rejects any forged, tampered, or expired tokens with 401.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Admin authorization required. Please login with your church admin credentials."
        )
    raw = authorization.replace("Bearer ", "").strip()
    if not raw:
        raise HTTPException(status_code=401, detail="Session token required.")

    # Validate HMAC signed token format: user_id.timestamp.signature
    parts = raw.split(".")
    if len(parts) == 3:
        user_id, timestamp_str, sig = parts
        try:
            timestamp = int(timestamp_str)
            body = f"{user_id}:{timestamp}"
            expected_sig = hmac.new(AUTH_SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
            if hmac.compare_digest(expected_sig, sig):
                # Verify 7-day expiration (7 * 86400 seconds)
                if not 0 <= datetime.now().timestamp() - timestamp <= 7 * 86400:
                    raise HTTPException(status_code=401, detail="Admin session expired. Please re-login.")
                return True
        except ValueError:
            pass

   

    raise HTTPException(status_code=401, detail="Invalid admin session token. Access denied.")

# Admin Initial Credentials (Configurable via Environment Variables / .env)
DEFAULT_ADMIN_USER = getattr(settings, "ADMIN_USER_ID", os.getenv("ADMIN_USER_ID", "admin"))
DEFAULT_ADMIN_PASSWORD = settings.ADMIN_PASSWORD
DEFAULT_ADMIN_EMAIL = getattr(settings, "ADMIN_NOTIFICATION_EMAIL", os.getenv("ADMIN_NOTIFICATION_EMAIL", "contact@gracevictorychurch.org"))

if not DEFAULT_ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD must be set in the backend environment.")

# Seed credentials only when MongoDB has no admin account.
DEFAULT_AUTH_DOC = {
    "_id": "admin-account",
    "user_id": DEFAULT_ADMIN_USER,
    "username": DEFAULT_ADMIN_USER,
    "email": DEFAULT_ADMIN_EMAIL,
    "password": password_hash.hash(DEFAULT_ADMIN_PASSWORD),
    "role": "superadmin",
    "created_at": datetime.now().isoformat(),
}

async def ensure_auth_collection():
    """Initialize or upgrade the admin account in MongoDB auth collection."""
    if not is_db_connected():
        return
    try:
        db = get_database()
        count = await db.auth.count_documents({})
        if count == 0:
            await db.auth.insert_one(dict(DEFAULT_AUTH_DOC))
            print("Initialized MongoDB admin auth collection.")
        else:
            # If existing document has a plaintext password, upgrade it to Argon2
            existing = await db.auth.find_one({})
            if existing and existing.get("password") and not existing.get("password", "").startswith("$argon2"):
                plain = existing.get("password")
                hashed = password_hash.hash(plain)
                await db.auth.update_one({"_id": existing["_id"]}, {"$set": {"password": hashed}})
                print("Upgraded existing plaintext admin password to Argon2 hash in MongoDB.")
    except Exception as exc:
        print(f"MongoDB admin initialization failed: {type(exc).__name__}")

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
    "admin_notification_email": DEFAULT_ADMIN_EMAIL,
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

class ForgotPasswordRequest(BaseModel):
    user_id: Optional[str] = "admin"

class ResetPasswordWithOTPRequest(BaseModel):
    user_id: Optional[str] = "admin"
    otp: str
    new_password: str

# In-memory storage fallback for active OTP verification requests
password_resets_store: Dict[str, Dict[str, Any]] = {}

def _mask_email(email: str) -> str:
    """Mask email for privacy e.g. madara05112001@gmail.com -> m*****1@gmail.com"""
    if not email or "@" not in email:
        return "super admin email"
    name, domain = email.split("@", 1)
    if len(name) <= 2:
        masked_name = name[0] + "*"
    else:
        masked_name = name[0] + ("*" * (len(name) - 2)) + name[-1]
    return f"{masked_name}@{domain}"

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

def _identity_query(value: str) -> Dict[str, Any]:
    """Case-insensitive exact matching, with regex metacharacters escaped."""
    pattern = f"^{re.escape(value)}$"
    return {"$or": [
        {"user_id": {"$regex": pattern, "$options": "i"}},
        {"username": {"$regex": pattern, "$options": "i"}},
        {"email": {"$regex": pattern, "$options": "i"}},
    ]}


def _verify_password(password: str, encoded: str) -> bool:
    """
    Verify password with Argon2 (pwdlib), with seamless support for:
    1. Valid pwdlib hash (Argon2 / Bcrypt)
    2. Legacy plaintext password stored in MongoDB (e.g. 'gvcadmin2026')
    3. Password configured in .env (ADMIN_PASSWORD, e.g. 'admin123')
    """
    if not password:
        return False

    # 1. Standard pwdlib hash verification
    try:
        if encoded and password_hash.verify(password, encoded):
            return True
    except Exception:
        pass

    # 2. Legacy plaintext match against DB stored password
    if encoded and hmac.compare_digest(password.strip(), encoded.strip()):
        return True

    # 3. Match against configured .env ADMIN_PASSWORD
    env_password = getattr(settings, "ADMIN_PASSWORD", "") or os.getenv("ADMIN_PASSWORD", "")
    if env_password and hmac.compare_digest(password.strip(), env_password.strip()):
        return True

    return False


@router.post("/login")
async def admin_login(payload: LoginRequest):
    user_key = (payload.user_id or payload.username or "").strip()
    provided_password = payload.password or ""
    if not user_key or not provided_password:
        raise HTTPException(status_code=400, detail="User ID and password are required.")
    if not is_db_connected():
        raise HTTPException(status_code=503, detail="Admin login temporarily unavailable.")

    try:
        db = get_database()
        user_doc = await db.auth.find_one(_identity_query(user_key))
    except Exception:
        raise HTTPException(status_code=503, detail="Admin login temporarily unavailable.")

    if not user_doc or not _verify_password(provided_password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid User ID or Password. Access denied.")

    # Auto-upgrade password hash in MongoDB to Argon2 if legacy plaintext
    try:
        stored_hash = user_doc.get("password", "")
        if not stored_hash.startswith("$argon2"):
            new_hash = password_hash.hash(provided_password)
            await db.auth.update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"password": new_hash}}
            )
            print("Successfully upgraded admin password to Argon2 hash in MongoDB.")
    except Exception as exc:
        print(f"Note on password migration: {exc}")

    session_token = create_admin_token(user_doc.get("user_id", "admin"))
    return {
        "success": True,
        "message": f"Welcome back, {user_doc.get('username', 'Admin')}!",
        "token": session_token,
        "user": {
            "user_id": user_doc.get("user_id", "admin"),
            "username": user_doc.get("username", "admin"),
            "role": user_doc.get("role", "superadmin"),
        },
    }


@router.get("/auth/info")
async def get_auth_info():
    """Return basic auth info without exposing the password hash."""
    user_id = DEFAULT_ADMIN_USER
    if is_db_connected():
        try:
            db = get_database()
            doc = await db.auth.find_one({})
            if doc:
                user_id = doc.get("user_id", DEFAULT_ADMIN_USER)
        except Exception:
            pass
    return {"collection": "auth", "user_id": user_id}


@router.put("/auth/credentials")
async def update_auth_credentials(
    payload: UpdateAuthCredentialsRequest,
    _authorized: bool = Depends(verify_admin_session),
):
    """Update an existing MongoDB admin account after verifying its current password."""
    target_user = (payload.user_id or DEFAULT_ADMIN_USER).strip()
    updated_user_id = (payload.new_user_id or target_user).strip()
    updated_password = payload.new_password

    if not target_user or not updated_user_id:
        raise HTTPException(status_code=400, detail="User ID cannot be empty.")
    if len(updated_password) < 12:
        raise HTTPException(status_code=400, detail="New password must be at least 12 characters long.")
    if not is_db_connected():
        raise HTTPException(status_code=503, detail="Admin credentials update temporarily unavailable.")

    try:
        db = get_database()
        user_doc = await db.auth.find_one(_identity_query(target_user))
    except Exception:
        raise HTTPException(status_code=503, detail="Admin credentials update temporarily unavailable.")

    if not user_doc or not _verify_password(payload.current_password, user_doc.get("password", "")):
        raise HTTPException(status_code=401, detail="Current admin credentials are incorrect.")

    try:
        result = await db.auth.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {
                "user_id": updated_user_id,
                "username": updated_user_id,
                "password": password_hash.hash(updated_password),
                "updated_at": datetime.now().isoformat(),
            }},
        )
        if result.matched_count != 1:
            raise HTTPException(status_code=409, detail="Admin account changed. Please retry.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Could not save admin credentials.")

    return {
        "success": True,
        "message": "Admin credentials updated successfully.",
        "user_id": updated_user_id,
    }


@router.post("/forgot-password/request-otp")
async def request_password_reset_otp(payload: ForgotPasswordRequest):
    """
    Sends a 6-digit OTP to the church super admin notification email.
    Allows resetting admin password without needing the old password.
    """
    user_key = (payload.user_id or "admin").strip()
    if not user_key:
        user_key = "admin"

    # Find the admin user doc in MongoDB
    user_doc = None
    if is_db_connected():
        try:
            db = get_database()
            user_doc = await db.auth.find_one(_identity_query(user_key))
            if not user_doc:
                user_doc = await db.auth.find_one({"_id": "admin-account"})
                if not user_doc:
                    user_doc = await db.auth.find_one({})
        except Exception as e:
            print("DB lookup for forgot-password:", e)

    # Determine recipient super admin email
    recipient_email = None
    if user_doc and user_doc.get("email"):
        recipient_email = user_doc.get("email")
    if not recipient_email:
        recipient_email = getattr(settings, "ADMIN_NOTIFICATION_EMAIL", os.getenv("ADMIN_NOTIFICATION_EMAIL", "madara05112001@gmail.com"))

    # Generate cryptographically secure 6-digit numeric OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.now().timestamp() + (10 * 60)  # 10 minutes

    user_identifier = (user_doc.get("user_id") if user_doc else user_key).lower()
    reset_data = {
        "user_id": user_identifier,
        "otp": otp_code,
        "email": recipient_email,
        "expires_at": expires_at,
        "created_at": datetime.now().isoformat()
    }
    password_resets_store[user_identifier] = reset_data

    # Save to MongoDB password_resets collection
    if is_db_connected():
        try:
            db = get_database()
            await db.password_resets.update_one(
                {"user_id": user_identifier},
                {"$set": reset_data},
                upsert=True
            )
        except Exception as exc:
            print(f"Failed to save reset OTP to mongo: {exc}")

    # Dispatch email via email_service
    from dotenv import load_dotenv
    from app.config import BASE_DIR
    load_dotenv(BASE_DIR / ".env", override=True)

    smtp_user = (os.getenv("SMTP_USER") or getattr(settings, "SMTP_USER", "")).strip()
    smtp_pass = (os.getenv("SMTP_PASSWORD") or getattr(settings, "SMTP_PASSWORD", "")).replace(" ", "").strip()

    if not smtp_user or not smtp_pass:
        raise HTTPException(
            status_code=400,
            detail="SMTP is not configured yet in backend/.env. Please enter your SMTP_USER and SMTP_PASSWORD (Google App Password) to send real OTP emails."
        )

    from app.services.email_service import send_password_reset_otp_email
    sent_successfully = send_password_reset_otp_email(recipient_email, otp_code, user_identifier)

    if not sent_successfully:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to deliver email to {recipient_email}. Please verify your SMTP_USER and SMTP_PASSWORD in backend/.env (ensure 16-character App Password is valid)."
        )

    masked = _mask_email(recipient_email)
    return {
        "success": True,
        "message": f"Verification OTP sent successfully to {masked}. Please check your email inbox and spam folder.",
        "masked_email": masked,
        "user_id": user_identifier
    }


@router.post("/forgot-password/reset")
async def reset_password_with_otp(payload: ResetPasswordWithOTPRequest):
    """
    Validates the 6-digit OTP and updates the admin password with Argon2 hash.
    Does NOT require the old password.
    """
    user_key = (payload.user_id or "admin").strip().lower()
    provided_otp = (payload.otp or "").strip()
    new_password = (payload.new_password or "").strip()

    if not provided_otp:
        raise HTTPException(status_code=400, detail="6-digit OTP is required.")
    if len(new_password) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    # Find reset record in MongoDB or memory
    record = None
    if is_db_connected():
        try:
            db = get_database()
            record = await db.password_resets.find_one({"user_id": user_key})
            if not record:
                # Also try finding by OTP
                record = await db.password_resets.find_one({"otp": provided_otp})
        except Exception as e:
            print("DB lookup for OTP reset:", e)

    if not record:
        record = password_resets_store.get(user_key)
        if not record:
            for k, r in password_resets_store.items():
                if r.get("otp") == provided_otp:
                    record = r
                    break

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new OTP.")

    # Check expiration (10 minutes)
    if datetime.now().timestamp() > record.get("expires_at", 0):
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Constant-time comparison for security
    if not hmac.compare_digest(str(record.get("otp", "")).strip(), provided_otp):
        raise HTTPException(status_code=400, detail="Incorrect OTP code. Please check and try again.")

    # Hash new password with Argon2
    new_hash = password_hash.hash(new_password)

    # Update in MongoDB db.auth
    if is_db_connected():
        try:
            db = get_database()
            res = await db.auth.update_one(
                _identity_query(user_key),
                {"$set": {
                    "password": new_hash,
                    "updated_at": datetime.now().isoformat()
                }}
            )
            if res.matched_count == 0:
                # Update default or first admin record
                await db.auth.update_one(
                    {},
                    {"$set": {
                        "password": new_hash,
                        "updated_at": datetime.now().isoformat()
                    }}
                )
            # Remove used OTP record
            await db.password_resets.delete_many({"otp": provided_otp})
            print("Admin password reset with OTP successfully in MongoDB.")
        except Exception as exc:
            print("Error saving reset password to MongoDB:", exc)

    # Invalidate OTP in memory
    password_resets_store.pop(user_key, None)

    return {
        "success": True,
        "message": "Password reset successfully! You can now log in with your new password.",
        "user_id": user_key
    }


@router.get("/settings")
async def get_site_settings():
    """
    Returns public church configuration.
    CRITICAL SECURITY: Strips razorpay_key_secret completely so secrets NEVER leave the server.
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
    has_secret = bool(safe_copy.get("razorpay_key_secret") and not str(safe_copy.get("razorpay_key_secret")).endswith("Testing"))
    safe_copy["razorpay_secret_configured"] = has_secret
    safe_copy.pop("razorpay_key_secret", None)
    return safe_copy

@router.post("/settings")
async def update_site_settings(payload: SettingsUpdateRequest, _authorized: bool = Depends(verify_admin_session)):
    """Updates church settings and banking details (Admin Session Required)"""
    raw_updates = payload.model_dump()
    updates = {}
    for k, v in raw_updates.items():
        if v is not None:
            # Only update secret if user explicitly provided a genuine new secret
            if k == "razorpay_key_secret":
                clean_secret = str(v).strip()
                if not clean_secret or clean_secret.startswith("•••") or clean_secret == "••••••••••••":
                    continue
                updates[k] = clean_secret
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
    response_settings["razorpay_secret_configured"] = bool(site_settings_cache.get("razorpay_key_secret") and not str(site_settings_cache.get("razorpay_key_secret")).endswith("Testing"))
    response_settings.pop("razorpay_key_secret", None)

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
