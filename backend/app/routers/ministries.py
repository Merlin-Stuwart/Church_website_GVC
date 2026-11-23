from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
import uuid
from datetime import datetime
from app.schemas.ministry import MinistryCreate, MinistryUpdate, MinistryResponse
from app.database import get_database, is_db_connected
from app.auth import verify_admin_session

router = APIRouter(prefix="/api/ministries", tags=["Ministries & Prayer Services"])

ministries_store = {}

@router.get("", response_model=List[MinistryResponse])
async def get_all_ministries():
    results = []
    if is_db_connected():
        try:
            db = get_database()
            cursor = db.ministries.find({}).sort("created_at", 1)
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                results.append(doc)
            return results
        except Exception as e:
            print("MongoDB fetch ministries error:", e)
            raise HTTPException(status_code=500, detail=f"Database error: {e}")
    return list(ministries_store.values())

@router.post("", response_model=MinistryResponse, status_code=status.HTTP_201_CREATED)
async def create_ministry(ministry: MinistryCreate, _authorized: bool = Depends(verify_admin_session)):
    new_id = f"ministry-{uuid.uuid4().hex[:8]}"
    item_dict = ministry.model_dump()
    item_dict["id"] = new_id
    item_dict["created_at"] = datetime.now()

    if is_db_connected():
        try:
            db = get_database()
            await db.ministries.insert_one({**item_dict, "_id": new_id})
        except Exception as e:
            print("MongoDB insert ministry error:", e)
            raise HTTPException(status_code=500, detail=f"Database error: {e}")

    ministries_store[new_id] = item_dict
    return item_dict

@router.put("/{ministry_id}", response_model=MinistryResponse)
async def update_ministry(ministry_id: str, payload: MinistryUpdate, _authorized: bool = Depends(verify_admin_session)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    existing = ministries_store.get(ministry_id, {})
    updated_item = {**existing, **updates, "id": ministry_id}

    if is_db_connected():
        try:
            db = get_database()
            await db.ministries.update_one(
                {"$or": [{"_id": ministry_id}, {"id": ministry_id}]},
                {"$set": updates, "$setOnInsert": {"id": ministry_id, "created_at": datetime.now()}},
                upsert=True
            )
            saved = await db.ministries.find_one({"$or": [{"_id": ministry_id}, {"id": ministry_id}]})
            if saved:
                saved["id"] = str(saved.get("_id", saved.get("id")))
                ministries_store[ministry_id] = saved
                return saved
        except Exception as e:
            print("MongoDB update ministry error:", e)
            raise HTTPException(status_code=500, detail=f"Database error: {e}")

    ministries_store[ministry_id] = updated_item
    return updated_item

@router.delete("")
async def clear_all_ministries(_authorized: bool = Depends(verify_admin_session)):
    deleted_count = 0
    if is_db_connected():
        try:
            db = get_database()
            res = await db.ministries.delete_many({})
            deleted_count = res.deleted_count
        except Exception as e:
            print("MongoDB clear ministries error:", e)
            raise HTTPException(status_code=500, detail=f"Database error: {e}")

    ministries_store.clear()
    return {"success": True, "deleted_count": deleted_count, "message": "All ministries cleared"}

@router.delete("/{ministry_id}")
async def delete_ministry(ministry_id: str, _authorized: bool = Depends(verify_admin_session)):
    deleted = False
    if is_db_connected():
        try:
            db = get_database()
            res = await db.ministries.delete_one({"$or": [{"_id": ministry_id}, {"id": ministry_id}]})
            if res.deleted_count > 0:
                deleted = True
        except Exception as e:
            print("MongoDB delete ministry error:", e)
            raise HTTPException(status_code=500, detail=f"Database error: {e}")

    if ministry_id in ministries_store:
        del ministries_store[ministry_id]
        deleted = True

    return {"success": True, "message": "Ministry deleted successfully"}
