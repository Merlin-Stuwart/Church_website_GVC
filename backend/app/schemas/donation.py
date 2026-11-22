from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    donor_name: str
    email: str
    phone: Optional[str] = ""
    amount: float
    cause: str = "Tithes & General Offerings"
    payment_method: str = "UPI"
    transaction_id: Optional[str] = ""
    notes: Optional[str] = ""
    status: Optional[str] = "Completed"

class DonationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    donor_name: str
    email: str
    phone: Optional[str] = ""
    amount: float
    cause: str = "Tithes & General Offerings"
    payment_method: str = "UPI"
    transaction_id: Optional[str] = ""
    notes: Optional[str] = ""
    status: Optional[str] = "Completed"
    receipt_number: str
    created_at: Optional[datetime] = None

class PaymentOrderCreate(BaseModel):
    amount: float
    donor_name: str
    email: str
    phone: Optional[str] = ""
    cause: Optional[str] = "Tithes & General Offerings"
    notes: Optional[str] = ""

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str
    church_name: str
    is_test_mode: Optional[bool] = False

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    donor_name: str
    email: str
    phone: Optional[str] = ""
    amount: float
    cause: Optional[str] = "Tithes & General Offerings"
    notes: Optional[str] = ""
