from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import uuid
from datetime import datetime
from app.schemas.contact import (
    ContactMessageCreate,
    ContactMessageResponse,
    PlanVisitCreate,
    PlanVisitResponse
)
from app.database import get_database, is_db_connected
from app.services.email_service import notify_contact_message

router = APIRouter(prefix="/api/contact", tags=["Contact & Plan a Visit"])

messages_store = []
visits_store = []

@router.post("", response_model=ContactMessageResponse, status_code=201)
async def submit_contact_message(msg: ContactMessageCreate, background_tasks: BackgroundTasks):
    msg_dict = msg.model_dump()
    msg_dict["id"] = f"msg-{uuid.uuid4().hex[:8]}"
    msg_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        await db.contact_messages.insert_one({**msg_dict, "_id": msg_dict["id"]})

    messages_store.append(msg_dict)

    # Dispatch notification to admin email (madara05112001@gmail.com)
    background_tasks.add_task(notify_contact_message, msg_dict)

    return msg_dict

@router.get("/messages", response_model=List[ContactMessageResponse])
async def get_all_messages():
    if is_db_connected():
        db = get_database()
        results = []
        cursor = db.contact_messages.find({}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results
    return messages_store

@router.delete("/messages/{msg_id}")
async def delete_contact_message(msg_id: str):
    global messages_store
    messages_store = [m for m in messages_store if m.get("id") != msg_id and m.get("_id") != msg_id]
    if is_db_connected():
        db = get_database()
        await db.contact_messages.delete_one({"_id": msg_id})
    return {"success": True, "message": "Inquiry deleted"}

@router.post("/plan-visit", response_model=PlanVisitResponse, status_code=201)
async def submit_plan_visit(visit: PlanVisitCreate):
    visit_dict = visit.model_dump()
    visit_dict["id"] = f"visit-{uuid.uuid4().hex[:8]}"
    visit_dict["status"] = "confirmed"
    visit_dict["created_at"] = datetime.now()

    if is_db_connected():
        db = get_database()
        await db.planned_visits.insert_one({**visit_dict, "_id": visit_dict["id"]})

    visits_store.append(visit_dict)
    return visit_dict

@router.get("/plan-visit/all", response_model=List[PlanVisitResponse])
async def get_all_planned_visits():
    if is_db_connected():
        db = get_database()
        results = []
        cursor = db.planned_visits.find({}).sort("created_at", -1)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            results.append(doc)
        return results
    return visits_store
