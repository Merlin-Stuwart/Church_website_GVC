from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
import uuid
from datetime import datetime
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventRsvpCreate
from app.database import get_database, is_db_connected
from app.auth import verify_admin_session

router = APIRouter(prefix="/api/events", tags=["Events"])

events_store = {}
rsvps_store = []

@router.get("", response_model=List[EventResponse])
async def get_all_events(
    featured: Optional[bool] = None,
    category: Optional[str] = None
):
    results = []
    if is_db_connected():
        db = get_database()
        query = {}
        if featured is not None:
            query["featured"] = featured
        if category and category.lower() != "all":
            query["category"] = category
        cursor = db.events.find(query).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results

    items = list(events_store.values())
    if featured is not None:
        items = [e for e in items if e.get("featured") == featured]
    if category and category.lower() != "all":
        items = [e for e in items if e.get("category", "").lower() == category.lower()]
    return items

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    if is_db_connected():
        db = get_database()
        doc = await db.events.find_one({"$or": [{"_id": event_id}, {"id": event_id}]})
        if doc:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            return doc
    if event_id in events_store:
        return events_store[event_id]
    raise HTTPException(status_code=404, detail="Event not found")

@router.post("", response_model=EventResponse, status_code=201)
async def create_event(event: EventCreate, _authorized: bool = Depends(verify_admin_session)):
    new_id = f"event-{uuid.uuid4().hex[:8]}"
    event_dict = event.model_dump()
    event_dict["id"] = new_id
    event_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        await db.events.insert_one({**event_dict, "_id": new_id})

    events_store[new_id] = event_dict
    return event_dict

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event: EventUpdate, _authorized: bool = Depends(verify_admin_session)):
    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    
    if is_db_connected():
        db = get_database()
        await db.events.update_one(
            {"$or": [{"_id": event_id}, {"id": event_id}]},
            {"$set": update_data}
        )
        doc = await db.events.find_one({"$or": [{"_id": event_id}, {"id": event_id}]})
        if doc:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            events_store[event_id] = doc
            return doc

    if event_id in events_store:
        events_store[event_id].update(update_data)
        return events_store[event_id]
    
    raise HTTPException(status_code=404, detail="Event not found")

@router.delete("")
async def clear_all_events(_authorized: bool = Depends(verify_admin_session)):
    deleted_count = 0
    if is_db_connected():
        db = get_database()
        res = await db.events.delete_many({})
        deleted_count = res.deleted_count
    events_store.clear()
    return {"success": True, "deleted_count": deleted_count, "message": "All events cleared"}

@router.delete("/{event_id}")
async def delete_event(event_id: str, _authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        db = get_database()
        res = await db.events.delete_one({"$or": [{"_id": event_id}, {"id": event_id}]})
        if res.deleted_count > 0:
            events_store.pop(event_id, None)
            return {"message": "Event deleted successfully", "id": event_id}
    if event_id in events_store:
        del events_store[event_id]
        return {"message": "Event deleted successfully", "id": event_id}
    raise HTTPException(status_code=404, detail="Event not found")

@router.post("/rsvp", status_code=201)
async def rsvp_to_event(rsvp: EventRsvpCreate):
    rsvp_dict = rsvp.model_dump()
    rsvp_dict["id"] = f"rsvp-{uuid.uuid4().hex[:8]}"
    rsvp_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        await db.event_rsvps.insert_one({**rsvp_dict, "_id": rsvp_dict["id"]})

    rsvps_store.append(rsvp_dict)
    return {
        "message": "Thank you! Your RSVP has been confirmed. See you there!",
        "rsvp": rsvp_dict
    }

@router.get("/rsvps/all")
async def get_all_rsvps(_authorized: bool = Depends(verify_admin_session)):
    if is_db_connected():
        db = get_database()
        results = []
        cursor = db.event_rsvps.find({}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results
    return rsvps_store
