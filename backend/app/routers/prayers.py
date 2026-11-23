from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List
import uuid
from datetime import datetime
from app.schemas.prayer import PrayerCreate, PrayerResponse
from app.database import get_database, is_db_connected
from app.auth import verify_admin_session
from app.services.email_service import notify_prayer_request

router = APIRouter(prefix="/api/prayers", tags=["Prayers"])

prayers_store = {}

@router.get("", response_model=List[PrayerResponse])
async def get_public_prayers():
    results = []
    if is_db_connected():
        db = get_database()
        cursor = db.prayers.find({"is_public": True}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results

    return [p for p in prayers_store.values() if p.get("is_public", True)]

@router.get("/admin/all", response_model=List[PrayerResponse])
async def get_all_prayers_admin(_authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        db = get_database()
        results = []
        cursor = db.prayers.find({}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results
    return list(prayers_store.values())

@router.post("", response_model=PrayerResponse, status_code=201)
async def submit_prayer(prayer: PrayerCreate, background_tasks: BackgroundTasks):
    new_id = f"prayer-{uuid.uuid4().hex[:8]}"
    prayer_dict = prayer.model_dump()
    prayer_dict["id"] = new_id
    prayer_dict["prayer_count"] = 1
    prayer_dict["created_at"] = datetime.now()

    if prayer_dict.get("is_anonymous"):
        prayer_dict["name"] = "Anonymous Intercessor"

    if is_db_connected():
        db = get_database()
        await db.prayers.insert_one({**prayer_dict, "_id": new_id})

    prayers_store[new_id] = prayer_dict

    # Dispatch notification to church admin email
    background_tasks.add_task(notify_prayer_request, prayer_dict)

    return prayer_dict

@router.post("/{prayer_id}/pray")
async def click_pray(prayer_id: str):
    if is_db_connected():
        db = get_database()
        res = await db.prayers.find_one_and_update(
            {"$or": [{"_id": prayer_id}, {"id": prayer_id}]},
            {"$inc": {"prayer_count": 1}},
            return_document=True
        )
        if res:
            res["id"] = str(res.get("_id", res.get("id")))
            prayers_store[prayer_id] = res
            return {"message": "You joined in prayer! God answers prayer.", "prayer_count": res.get("prayer_count", 0)}

    if prayer_id in prayers_store:
        prayers_store[prayer_id]["prayer_count"] = prayers_store[prayer_id].get("prayer_count", 0) + 1
        return {
            "message": "You joined in prayer! God answers prayer.",
            "prayer_count": prayers_store[prayer_id]["prayer_count"]
        }

    raise HTTPException(status_code=404, detail="Prayer request not found")

@router.delete("")
async def clear_all_prayers(_authorized: bool = Depends(verify_admin_session)):
    deleted_count = 0
    if is_db_connected():
        db = get_database()
        res = await db.prayers.delete_many({})
        deleted_count = res.deleted_count
    prayers_store.clear()
    return {"success": True, "deleted_count": deleted_count, "message": "All prayers cleared"}

@router.delete("/{prayer_id}")
async def delete_prayer(prayer_id: str, _authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        db = get_database()
        res = await db.prayers.delete_one({"$or": [{"_id": prayer_id}, {"id": prayer_id}]})
        if res.deleted_count > 0:
            prayers_store.pop(prayer_id, None)
            return {"message": "Prayer request deleted successfully"}
    if prayer_id in prayers_store:
        del prayers_store[prayer_id]
        return {"message": "Prayer request deleted successfully"}
    return {"message": "Prayer request deleted"}

