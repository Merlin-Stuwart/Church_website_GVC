from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.email_service import (
    notify_prayer_request,
    notify_testimony,
    notify_contact_message,
    send_notification_email,
    get_notification_recipient
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class NotificationRequest(BaseModel):
    type: str  # "prayer", "testimony", "contact"
    data: Dict[str, Any]
    recipient: Optional[str] = None

@router.get("/config")
async def get_notification_config():
    return {
        "admin_notification_email": get_notification_recipient(),
        "status": "active"
    }

@router.post("/notify")
async def trigger_notification(payload: NotificationRequest, background_tasks: BackgroundTasks):
    recip = payload.recipient or get_notification_recipient()
    t = payload.type.lower()

    if t in ["prayer", "prayer_request"]:
        background_tasks.add_task(notify_prayer_request, payload.data, recip)
    elif t in ["testimony", "testimonies"]:
        background_tasks.add_task(notify_testimony, payload.data, recip)
    elif t in ["contact", "inquiry", "serve"]:
        background_tasks.add_task(notify_contact_message, payload.data, recip)
    else:
        subject = f"[GVC NOTIFICATION] New Submission ({t})"
        body = str(payload.data)
        background_tasks.add_task(send_notification_email, subject, f"<pre>{body}</pre>", body, recip)

    return {
        "success": True,
        "message": f"Notification dispatched to {recip}",
        "type": payload.type
    }
