from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# ================= AUTH SCHEMAS =================
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "PATIENT"  # PATIENT, PHARMACIST, ADMIN

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ================= MEDICINE SCHEMAS =================
class MedicineBase(BaseModel):
    name: str
    generic_name: str
    strength: str
    dosage_form: str
    manufacturer: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ================= INVENTORY SCHEMAS =================
class InventoryBase(BaseModel):
    medicine_id: int
    quantity: int
    price: float
    batch_number: Optional[str] = "BATCH-2026"
    expiry_date: Optional[str] = "2027-12"
    status: Optional[str] = "AVAILABLE"

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    price: Optional[float] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = None

class InventoryResponse(BaseModel):
    id: int
    pharmacy_id: int
    medicine_id: int
    quantity: int
    price: float
    batch_number: Optional[str] = "BATCH-2026"
    expiry_date: Optional[str] = "2027-12"
    last_updated: datetime
    status: str
    medicine: Optional[MedicineResponse] = None

    class Config:
        from_attributes = True

class MedicineSubstituteResponse(BaseModel):
    original_medicine: MedicineResponse
    substitute_medicine: MedicineResponse
    savings_percentage: float
    price_difference: float
    is_generic: bool
    safety_disclaimer: str = "Pharmacist-verified bioequivalent formulation with identical active drug & strength."



# ================= PHARMACY SCHEMAS =================
class PharmacyBase(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    latitude: float
    longitude: float
    opening_time: Optional[str] = "08:00 AM"
    closing_time: Optional[str] = "10:00 PM"

class PharmacyCreate(PharmacyBase):
    pass

class PharmacyUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    verification_status: Optional[str] = None

class PharmacyResponse(PharmacyBase):
    id: int
    owner_id: Optional[int] = None
    verification_status: str
    created_at: datetime
    inventory_items: Optional[List[InventoryResponse]] = []

    class Config:
        from_attributes = True

class PharmacyRankedResponse(BaseModel):
    pharmacy: PharmacyResponse
    distance_km: float
    available_units: int
    unit_price: float
    inventory_status: str
    last_stock_update_minutes_ago: int
    trust_score: int
    final_score: float
    match_tag: str  # "BEST MATCH", "FASTEST AVAILABLE", "HIGHEST TRUST", "BEST PRICE"
    match_reasons: List[str]
    is_open: bool

class BasketItemRequest(BaseModel):
    medicine_id: int
    quantity: int = 1

class BasketPharmacyFulfillment(BaseModel):
    pharmacy: PharmacyResponse
    distance_km: float
    is_full_match: bool
    matched_items_count: int
    total_items_count: int
    total_basket_price: float
    trust_score: int
    final_score: float
    item_availability: List[dict]



# ================= PRESCRIPTION SCHEMAS =================
class PrescriptionItemCreate(BaseModel):
    raw_name: str
    normalized_name: str
    strength: Optional[str] = None
    quantity: Optional[int] = 1
    confidence_score: Optional[float] = 0.95
    medicine_id: Optional[int] = None

class PrescriptionItemResponse(BaseModel):
    id: int
    prescription_id: int
    medicine_id: Optional[int] = None
    raw_name: str
    normalized_name: str
    strength: Optional[str] = None
    quantity: int
    confidence_score: float
    verification_status: str
    medicine: Optional[MedicineResponse] = None

    class Config:
        from_attributes = True

class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    ocr_text: Optional[str] = None
    status: str
    created_at: datetime
    items: List[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True

class PrescriptionConfirmRequest(BaseModel):
    items: List[PrescriptionItemCreate]


# ================= RESERVATION SCHEMAS =================
class ReservationItemCreate(BaseModel):
    medicine_id: int
    quantity: int

class ReservationCreate(BaseModel):
    pharmacy_id: int
    items: List[ReservationItemCreate]

class ReservationItemResponse(BaseModel):
    id: int
    medicine_id: int
    quantity: int
    price: float
    medicine: Optional[MedicineResponse] = None

    class Config:
        from_attributes = True

class ReservationResponse(BaseModel):
    id: int
    user_id: int
    pharmacy_id: int
    status: str
    reservation_code: str
    expires_at: datetime
    created_at: datetime
    pharmacy: Optional[PharmacyResponse] = None
    items: List[ReservationItemResponse] = []

    class Config:
        from_attributes = True

class ReservationStatusUpdate(BaseModel):
    status: str  # CONFIRMED, REJECTED, COMPLETED, CANCELLED


# ================= NOTIFICATION SCHEMAS =================
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ================= ANALYTICS & SHORTAGE SCHEMAS =================
class ShortageAlertResponse(BaseModel):
    medicine_id: int
    medicine_name: str
    generic_name: str
    area: str
    shortage_risk: str  # LOW, MEDIUM, HIGH
    risk_score: float
    demand_growth_pct: float
    inventory_drop_pct: float
    search_volume: int
    available_stock: int
    reason: str
    recommendation: str

class AdminStatsResponse(BaseModel):
    total_users: int
    total_patients: int
    total_pharmacies: int
    verified_pharmacies: int
    total_medicines: int
    active_reservations: int
    total_reservations: int
    low_stock_alerts_count: int
    shortage_alerts: List[ShortageAlertResponse]
    demand_trends: List[dict]
    pharmacy_activity: List[dict]
    area_availability: List[dict]


# ================= DOCTOR E-PRESCRIPTION SCHEMAS =================
class DoctorPrescriptionItem(BaseModel):
    name: str
    generic_name: Optional[str] = None
    dosage: str
    frequency: str  # e.g. "1-0-1 after food"
    duration_days: int
    quantity: int = 1

class DoctorPrescriptionPushRequest(BaseModel):
    doctor_name: str
    clinic_name: str
    doctor_license: str
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    diagnosis: str
    notes: Optional[str] = None
    items: List[DoctorPrescriptionItem]

class DoctorPrescriptionResponse(BaseModel):
    id: int
    prescription_code: str
    doctor_name: str
    clinic_name: str
    doctor_license: str
    patient_name: str
    diagnosis: str
    notes: Optional[str] = None
    created_at: datetime
    status: str
    items: List[dict]


# ================= DELIVERY COURIER SCHEMAS =================
class DeliveryQuoteRequest(BaseModel):
    pharmacy_id: int
    delivery_latitude: float
    delivery_longitude: float
    delivery_address: str

class DeliveryQuoteResponse(BaseModel):
    courier_partner: str
    estimated_minutes: int
    delivery_fee: float
    distance_km: float
    is_serviceable: bool
    rider_tracking_available: bool


# ================= GENERIC RESPONSE =================
class GenericResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
