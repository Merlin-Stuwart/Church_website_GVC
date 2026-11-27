from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional, Tuple
import os
import uuid
import logging
import hmac
import hashlib
import json
import httpx
from datetime import datetime

from app.schemas.donation import (
    DonationCreate, DonationResponse,
    PaymentOrderCreate, PaymentOrderResponse, PaymentVerifyRequest
)
from app.database import get_database, is_db_connected
from app.auth import verify_admin_session

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/donations", tags=["Donations & Giving"])

donations_store = []
_pending_orders: dict = {}

async def get_active_razorpay_keys() -> Tuple[str, str]:
    """Retrieve Razorpay API credentials securely from MongoDB, cache, or Environment."""
    env_key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
    env_key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()
    key_id = ""
    key_secret = ""

    try:
        from app.routers.admin import site_settings_cache
        c_id = (site_settings_cache.get("razorpay_key_id") or "").strip()
        c_sec = (site_settings_cache.get("razorpay_key_secret") or "").strip()
        if c_id and "Testing" not in c_id:
            key_id = c_id
        if c_sec and "Testing" not in c_sec:
            key_secret = c_sec
    except Exception:
        pass

    if is_db_connected():
        try:
            db = get_database()
            saved = await db.site_settings.find_one({"_id": "global_config"})
            if saved:
                db_id = (saved.get("razorpay_key_id") or "").strip()
                db_sec = (saved.get("razorpay_key_secret") or "").strip()
                if db_id and "Testing" not in db_id:
                    key_id = db_id
                if db_sec and "Testing" not in db_sec:
                    key_secret = db_sec
        except Exception:
            pass

    return (key_id or env_key_id), (key_secret or env_key_secret)

@router.get("/details")
async def get_giving_details():
    try:
        from app.routers.admin import site_settings_cache
        cache = site_settings_cache
    except Exception:
        cache = {}

    upi_id = cache.get("upi_id", "gracevictorychurch@okaxis")
    bank_name = cache.get("bank_name", "State Bank of India (SBI)")
    acc_no = cache.get("account_number", "921020038472910")
    branch = cache.get("branch", "Vattamalai Branch")
    ifsc = cache.get("ifsc_code", "SBIN0004921")
    swift = cache.get("swift_code", "SBININBB492")
    church_name = cache.get("church_name", "Grace Victory Church Trust")
    giving_verse = cache.get("giving_verse", "“Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.” — Malachi 3:10")
    giving_presets = cache.get("giving_presets", "500, 1000, 2500, 5000, 10000")

    key_id, _ = await get_active_razorpay_keys()

    if is_db_connected():
        try:
            db = get_database()
            saved = await db.site_settings.find_one({"_id": "global_config"})
            if saved:
                upi_id = saved.get("upi_id", upi_id)
                bank_name = saved.get("bank_name", bank_name)
                acc_no = saved.get("account_number", acc_no)
                branch = saved.get("branch", branch)
                ifsc = saved.get("ifsc_code", ifsc)
                swift = saved.get("swift_code", swift)
                church_name = saved.get("church_name", church_name)
                giving_verse = saved.get("giving_verse", giving_verse)
                giving_presets = saved.get("giving_presets", giving_presets)
        except Exception:
            pass

    return {
        "church_name": church_name,
        "upi_id": upi_id,
        "razorpay_key_id": key_id,
        "razorpay_enabled": bool(key_id and "Testing" not in key_id),
        "giving_verse": giving_verse,
        "giving_presets": giving_presets,
        "bank_details": {
            "account_name": church_name,
            "account_number": acc_no,
            "bank_name": bank_name,
            "branch": branch,
            "ifsc_code": ifsc,
            "swift_code": swift
        },
        "causes": [
            {"id": "tithe", "name": "Tithes & General Offerings", "desc": "Supporting Sunday worship, pastoral care & ongoing church operations"},
            {"id": "building", "name": "Sanctuary Expansion & Building Fund", "desc": "Expanding our church sanctuary and community youth centre"},
            {"id": "missions", "name": "Village Missions & Church Planting", "desc": "Supporting 15+ missionary pastors and rural gospel outreach"},
            {"id": "charity", "name": "Mercy Ministries & Needy Care", "desc": "Providing monthly groceries, medical aid and widow support"},
            {"id": "sundayschool", "name": "Children & Youth VBS", "desc": "Nurturing the next generation through Sunday school and camps"}
        ],
        "scripture": "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7"
    }

# =========================================================================
# 100% AUTOMATED BANK VERIFICATION (RAZORPAY ORDER & VERIFY API)
# =========================================================================

@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(order_req: PaymentOrderCreate):
    amount_in_paise = int(round(order_req.amount * 100))
    if amount_in_paise <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    key_id, key_secret = await get_active_razorpay_keys()
    order_id = f"order_{uuid.uuid4().hex[:14]}"
    real_razorpay_order = False

    # If live Razorpay keys are configured, create real order on Razorpay
    try:
        if key_id and key_secret and not key_id.endswith("Testing") and key_id.startswith("rzp_"):
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.razorpay.com/v1/orders",
                    auth=(key_id, key_secret),
                    json={
                        "amount": amount_in_paise,
                        "currency": "INR",
                        "receipt": f"gvc_{uuid.uuid4().hex[:8]}",
                        "notes": {
                            "donor_name": order_req.donor_name,
                            "email": order_req.email,
                            "phone": order_req.phone or "",
                            "cause": order_req.cause or "Tithes & General Offerings"
                        }
                    }
                )
                if res.status_code in [200, 201]:
                    data = res.json()
                    order_id = data.get("id", order_id)
                    real_razorpay_order = True
                else:
                    logger.warning("Razorpay order creation status %s: %s", res.status_code, res.text)
    except Exception as e:
        logger.warning("Razorpay API order error: %s. Using secure test order token.", e)

    # If real order was not created on Razorpay API, enable test/simulator mode so client doesn't crash with 400
    is_test = not real_razorpay_order or not key_id or "Testing" in key_id or not (key_id.startswith("rzp_test_") or key_id.startswith("rzp_live_"))

    church_name = "Grace Victory Church"
    try:
        from app.routers.admin import site_settings_cache
        church_name = site_settings_cache.get("church_name") or church_name
    except Exception:
        pass

    # Persist expected server-side order amount to prevent client-side amount tampering
    if len(_pending_orders) > 500:
        _pending_orders.clear()
    _pending_orders[order_id] = float(order_req.amount)
    if is_db_connected():
        try:
            db = get_database()
            await db.payment_orders.update_one(
                {"_id": order_id},
                {"$set": {"order_id": order_id, "amount": float(order_req.amount), "created_at": datetime.now()}},
                upsert=True
            )
        except Exception as e:
            logger.warning("Could not store pending payment order metadata: %s", e)

    return {
        "order_id": order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": key_id,
        "is_test_mode": is_test,
        "church_name": church_name
    }

@router.post("/verify-payment", response_model=DonationResponse)
async def verify_payment(verify_req: PaymentVerifyRequest):
    """
    Cryptographically verifies that the Bank actually received the funds.
    ONLY IF SIGNATURE IS VALID: Saves to MongoDB 'donations' collection and issues receipt.
    IF INVALID: Rejects and creates NO database records.
    """
    if verify_req.amount <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be greater than zero.")

    key_id, key_secret = await get_active_razorpay_keys()
    is_test_config = (not key_id) or ("Testing" in key_id)

    is_signature_valid = False
    if key_secret and verify_req.razorpay_signature:
        body = f"{verify_req.razorpay_order_id}|{verify_req.razorpay_payment_id}"
        expected_signature = hmac.new(
            key_secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        is_signature_valid = hmac.compare_digest(expected_signature, verify_req.razorpay_signature)

    allow_simulation = os.getenv("ALLOW_PAYMENT_SIMULATION", "false").lower() == "true"
    is_simulated_test = allow_simulation and is_test_config and verify_req.razorpay_payment_id.startswith("pay_sim_")

    if not is_signature_valid and not is_simulated_test:
        logger.error("Payment verification FAILED! Order: %s, Payment: %s", verify_req.razorpay_order_id, verify_req.razorpay_payment_id)
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed: The bank transaction signature could not be verified. No donation was recorded."
        )

    # Replay / idempotency protection: return existing record if this payment_id was already recorded
    if is_db_connected() and verify_req.razorpay_payment_id:
        try:
            db = get_database()
            existing = await db.donations.find_one({"transaction_id": verify_req.razorpay_payment_id})
            if existing:
                existing["id"] = str(existing.get("id") or existing.get("_id"))
                existing.pop("_id", None)
                return existing
        except Exception as e:
            logger.warning("Replay check lookup error: %s", e)

    # Verify amount against server-side order amount when available
    verified_amount = float(verify_req.amount)
    if is_signature_valid and verify_req.razorpay_order_id:
        expected_amount = _pending_orders.get(verify_req.razorpay_order_id)
        if expected_amount is None and is_db_connected():
            try:
                order_doc = await get_database().payment_orders.find_one({"_id": verify_req.razorpay_order_id})
                if order_doc and order_doc.get("amount") is not None:
                    expected_amount = float(order_doc["amount"])
            except Exception:
                pass
        if expected_amount is not None:
            if abs(verified_amount - expected_amount) > 0.01:
                raise HTTPException(status_code=400, detail="Payment amount mismatch with original order.")
            verified_amount = expected_amount

    # Store in MongoDB collection 'donations'
    receipt_no = f"GVC-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    donation_dict = {
        "id": f"don-{uuid.uuid4().hex[:8]}",
        "receipt_number": receipt_no,
        "donor_name": verify_req.donor_name.strip() or "Faithful Giver",
        "email": verify_req.email.strip() or "",
        "phone": verify_req.phone.strip() if verify_req.phone else "",
        "amount": verified_amount,
        "cause": verify_req.cause or "Tithes & General Offerings",
        "payment_method": "Razorpay / Bank UPI (Test Simulation)" if is_simulated_test else "Razorpay / Bank UPI (100% Verified)",
        "transaction_id": verify_req.razorpay_payment_id,
        "notes": verify_req.notes.strip() if verify_req.notes else "",
        "status": "Pending" if is_simulated_test else "Verified",
        "created_at": datetime.now()
    }

    if is_db_connected():
        try:
            db = get_database()
            await db.donations.insert_one({**donation_dict, "_id": donation_dict["id"]})
            logger.info("Donation %s (₹%s) saved to MongoDB 'donations'", donation_dict["id"], donation_dict["amount"])
        except Exception as e:
            logger.error("Failed to insert verified donation to MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error while saving verified donation.")

    donations_store.insert(0, donation_dict)
    return donation_dict

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Direct Server-to-Server Webhook from Razorpay Bank Event."""
    raw_body = await request.body()
    signature = (request.headers.get("X-Razorpay-Signature") or "").strip()
    if not signature:
        raise HTTPException(status_code=400, detail="Missing X-Razorpay-Signature header")

    _, key_secret = await get_active_razorpay_keys()
    webhook_secret = (os.getenv("RAZORPAY_WEBHOOK_SECRET") or key_secret or "").strip()
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    expected_sig = hmac.new(webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_sig, signature):
        logger.warning("Razorpay Webhook: Invalid Signature")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event_data = json.loads(raw_body.decode())
        event_name = event_data.get("event")

        if event_name in ["payment.captured", "order.paid"]:
            payload_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
            amount_paise = payload_entity.get("amount", 0)
            amount_rupees = amount_paise / 100.0
            payment_id = payload_entity.get("id", f"pay_wh_{uuid.uuid4().hex[:8]}")
            email = payload_entity.get("email", "")
            contact = payload_entity.get("contact", "")
            notes = payload_entity.get("notes", {})
            donor_name = notes.get("donor_name", "Online Giver")
            cause = notes.get("cause", "Tithes & General Offerings")

            receipt_no = f"GVC-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
            donation_dict = {
                "id": f"don-{uuid.uuid4().hex[:8]}",
                "receipt_number": receipt_no,
                "donor_name": donor_name,
                "email": email,
                "phone": contact,
                "amount": amount_rupees,
                "cause": cause,
                "payment_method": f"Razorpay Webhook ({payload_entity.get('method', 'UPI')})",
                "transaction_id": payment_id,
                "notes": notes.get("notes", ""),
                "status": "Verified",
                "created_at": datetime.now()
            }

            if is_db_connected():
                db = get_database()
                existing = await db.donations.find_one({"transaction_id": payment_id})
                if not existing:
                    await db.donations.insert_one({**donation_dict, "_id": donation_dict["id"]})
                    logger.info("Webhook: Verified donation recorded from bank: ₹%s", amount_rupees)

            donations_store.insert(0, donation_dict)
            return {"status": "success", "recorded": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error processing Razorpay webhook: %s", e)
        raise HTTPException(status_code=500, detail="Error processing webhook event")

    return {"status": "received"}

# =========================================================================
# STANDARD DONATIONS CRUD & ADMIN ACCESS
# =========================================================================

@router.post("", response_model=DonationResponse, status_code=201)
async def record_donation(donation: DonationCreate):
    if donation.amount <= 0:
        raise HTTPException(status_code=400, detail="Donation amount must be greater than zero.")
    receipt_no = f"GVC-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
    donation_dict = donation.model_dump()
    donation_dict["id"] = f"don-{uuid.uuid4().hex[:8]}"
    donation_dict["receipt_number"] = receipt_no
    donation_dict["created_at"] = datetime.now()
    # Public manual submissions always start as Pending until verified by Admin
    donation_dict["status"] = "Pending"

    if is_db_connected():
        try:
            db = get_database()
            mongo_doc = {**donation_dict, "_id": donation_dict["id"]}
            await db.donations.insert_one(mongo_doc)
            logger.info("Donation %s recorded in MongoDB collection 'donations'", donation_dict["id"])
        except Exception as e:
            logger.error("Failed to insert donation into MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error while saving donation.")

    donations_store.insert(0, donation_dict)
    return donation_dict

@router.get("", response_model=List[DonationResponse])
async def get_all_donations(_authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        try:
            db = get_database()
            results = []
            cursor = db.donations.find({}).sort("created_at", -1)
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                if "_id" in doc:
                    doc.pop("_id", None)
                results.append(doc)
            return results
        except Exception as e:
            logger.error("Failed to fetch donations from MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error occurred.")

    return donations_store

@router.delete("")
async def clear_all_donations(_authorized: bool = Depends(verify_admin_session)):
    deleted_count = 0
    if is_db_connected():
        try:
            db = get_database()
            res = await db.donations.delete_many({})
            deleted_count = res.deleted_count
        except Exception as e:
            logger.error("Failed to clear donations from MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error occurred.")

    donations_store.clear()
    return {"success": True, "deleted_count": deleted_count, "message": "All donation records cleared"}

@router.delete("/{donation_id}")
async def delete_donation(donation_id: str, _authorized: bool = Depends(verify_admin_session)):
    global donations_store
    if is_db_connected():
        try:
            db = get_database()
            await db.donations.delete_one({"$or": [{"_id": donation_id}, {"id": donation_id}]})
        except Exception as e:
            logger.error("Failed to delete donation from MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error occurred.")

    donations_store = [d for d in donations_store if d.get("id") != donation_id]
    return {"status": "success", "message": f"Donation {donation_id} removed"}

@router.patch("/{donation_id}/status")
async def update_donation_status(donation_id: str, payload: dict, _authorized: bool = Depends(verify_admin_session)):
    new_status = payload.get("status", "Verified")
    if is_db_connected():
        try:
            db = get_database()
            await db.donations.update_one(
                {"$or": [{"_id": donation_id}, {"id": donation_id}]},
                {"$set": {"status": new_status}}
            )
        except Exception as e:
            logger.error("Failed to update donation status in MongoDB: %s", e)
            raise HTTPException(status_code=500, detail="Database error occurred.")

    for d in donations_store:
        if d.get("id") == donation_id:
            d["status"] = new_status

    return {"status": "success", "id": donation_id, "new_status": new_status}
