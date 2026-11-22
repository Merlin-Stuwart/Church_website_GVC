from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid
from datetime import datetime
from app.schemas.sermon import SermonCreate, SermonUpdate, SermonResponse
from app.database import get_database, is_db_connected
from app.seed_data import INITIAL_SERMONS

router = APIRouter(prefix="/api/sermons", tags=["Sermons"])

# In-memory storage cache as fallback when MongoDB is starting up
sermons_store = {s["id"]: {**s, "created_at": datetime.now()} for s in INITIAL_SERMONS}

@router.get("", response_model=List[SermonResponse])
async def get_all_sermons(
    q: Optional[str] = None,
    category: Optional[str] = None,
    series: Optional[str] = None
):
    results = []
    if is_db_connected():
        db = get_database()
        query = {}
        if category and category.lower() != "all":
            query["category"] = category
        if series and series.lower() != "all":
            query["series"] = series
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"speaker": {"$regex": q, "$options": "i"}},
                {"scripture": {"$regex": q, "$options": "i"}},
                {"summary": {"$regex": q, "$options": "i"}}
            ]
        cursor = db.sermons.find(query).sort("date", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        if not results and not q and not category and not series:
            # If MongoDB collection is empty, seed it
            for s in INITIAL_SERMONS:
                await db.sermons.insert_one({**s, "_id": s["id"], "created_at": datetime.now()})
            return list(sermons_store.values())
        return results
    
    # Fallback to store
    items = list(sermons_store.values())
    if category and category.lower() != "all":
        items = [s for s in items if s.get("category", "").lower() == category.lower()]
    if series and series.lower() != "all":
        items = [s for s in items if s.get("series", "").lower() == series.lower()]
    if q:
        query_str = q.lower()
        items = [
            s for s in items
            if query_str in s.get("title", "").lower()
            or query_str in s.get("speaker", "").lower()
            or query_str in s.get("scripture", "").lower()
            or query_str in s.get("summary", "").lower()
        ]
    return sorted(items, key=lambda x: str(x.get("date")), reverse=True)

@router.get("/{sermon_id}", response_model=SermonResponse)
async def get_sermon(sermon_id: str):
    if is_db_connected():
        db = get_database()
        doc = await db.sermons.find_one({"$or": [{"_id": sermon_id}, {"id": sermon_id}]})
        if doc:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            return doc
    if sermon_id in sermons_store:
        return sermons_store[sermon_id]
    raise HTTPException(status_code=404, detail="Sermon not found")

@router.post("", response_model=SermonResponse, status_code=201)
async def create_sermon(sermon: SermonCreate):
    new_id = f"sermon-{uuid.uuid4().hex[:8]}"
    sermon_dict = sermon.model_dump()
    sermon_dict["id"] = new_id
    sermon_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        to_insert = {**sermon_dict, "_id": new_id}
        await db.sermons.insert_one(to_insert)

    sermons_store[new_id] = sermon_dict
    return sermon_dict

@router.put("/{sermon_id}", response_model=SermonResponse)
async def update_sermon(sermon_id: str, sermon: SermonUpdate):
    update_data = {k: v for k, v in sermon.model_dump().items() if v is not None}
    
    if is_db_connected():
        db = get_database()
        await db.sermons.update_one(
            {"$or": [{"_id": sermon_id}, {"id": sermon_id}]},
            {"$set": update_data}
        )
        doc = await db.sermons.find_one({"$or": [{"_id": sermon_id}, {"id": sermon_id}]})
        if doc:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            sermons_store[sermon_id] = doc
            return doc

    if sermon_id in sermons_store:
        sermons_store[sermon_id].update(update_data)
        return sermons_store[sermon_id]
    
    raise HTTPException(status_code=404, detail="Sermon not found")

@router.delete("/{sermon_id}")
async def delete_sermon(sermon_id: str):
    if is_db_connected():
        db = get_database()
        await db.sermons.delete_one({"$or": [{"_id": sermon_id}, {"id": sermon_id}]})
    if sermon_id in sermons_store:
        del sermons_store[sermon_id]
        return {"message": "Sermon deleted successfully", "id": sermon_id}
    raise HTTPException(status_code=404, detail="Sermon not found")
