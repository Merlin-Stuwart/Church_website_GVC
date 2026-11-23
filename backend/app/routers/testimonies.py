from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List
import uuid
from datetime import datetime
from app.schemas.testimony import TestimonyCreate, TestimonyResponse
from app.database import get_database, is_db_connected
from app.auth import verify_admin_session
from app.services.email_service import notify_testimony

router = APIRouter(prefix="/api/testimonies", tags=["Testimonies"])

testimonies_store = {}

@router.get("", response_model=List[TestimonyResponse])
async def get_testimonies():
    results = []
    if is_db_connected():
        db = get_database()
        cursor = db.testimonies.find({}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results

    return list(testimonies_store.values())

@router.post("", response_model=TestimonyResponse, status_code=201)
async def create_testimony(testimony: TestimonyCreate, background_tasks: BackgroundTasks):
    new_id = f"testimony-{uuid.uuid4().hex[:8]}"
    testimony_dict = testimony.model_dump()
    testimony_dict["id"] = new_id
    testimony_dict["date"] = datetime.now().strftime("%Y-%m-%d")
    testimony_dict["featured_home"] = False
    testimony_dict["is_active"] = True
    testimony_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        await db.testimonies.insert_one({**testimony_dict, "_id": new_id})

    testimonies_store[new_id] = testimony_dict

    # Dispatch notification to church admin email
    background_tasks.add_task(notify_testimony, testimony_dict)

    return testimony_dict

@router.put("/{testimony_id}/toggle-home")
async def toggle_home_testimony(testimony_id: str, _authorized: bool = Depends(verify_admin_session)):
    new_state = True
    if testimony_id in testimonies_store:
        current = testimonies_store[testimony_id].get("featured_home", False)
        new_state = not current
        testimonies_store[testimony_id]["featured_home"] = new_state
    if is_db_connected():
        db = get_database()
        doc = await db.testimonies.find_one({"$or": [{"_id": testimony_id}, {"id": testimony_id}]})
        if doc:
            current = doc.get("featured_home", False)
            new_state = not current
            await db.testimonies.update_one(
                {"_id": doc["_id"]},
                {"$set": {"featured_home": new_state}}
            )
    return {"id": testimony_id, "featured_home": new_state}

@router.delete("")
async def clear_all_testimonies(_authorized: bool = Depends(verify_admin_session)):
    deleted_count = 0
    if is_db_connected():
        db = get_database()
        res = await db.testimonies.delete_many({})
        deleted_count = res.deleted_count
    testimonies_store.clear()
    return {"success": True, "deleted_count": deleted_count, "message": "All testimonies cleared"}

@router.delete("/{testimony_id}")
async def delete_testimony(testimony_id: str, _authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        db = get_database()
        res = await db.testimonies.delete_one({"$or": [{"_id": testimony_id}, {"id": testimony_id}]})
        if res.deleted_count > 0:
            testimonies_store.pop(testimony_id, None)
            return {"message": "Testimony deleted successfully"}
    if testimony_id in testimonies_store:
        del testimonies_store[testimony_id]
        return {"message": "Testimony deleted successfully"}
    return {"message": "Testimony removed"}
