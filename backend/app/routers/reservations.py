import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Reservation, ReservationItem, Inventory, Pharmacy, Medicine, Notification, User, InventoryEvent
from app.schemas import (
    ReservationCreate,
    ReservationResponse,
    ReservationStatusUpdate,
    GenericResponse
)
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/reservations", tags=["Reservations"])

def generate_reservation_code() -> str:
    digits = ''.join(random.choices(string.digits, k=5))
    return f"MR-{digits}"

@router.post("", response_model=ReservationResponse)
def create_reservation(
    res_in: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == res_in.pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    if not res_in.items:
        raise HTTPException(status_code=400, detail="Reservation must contain at least one medicine")

    # Verify inventory and compute pricing
    total_price = 0.0
    reservation_items_to_create = []

    for item in res_in.items:
        inv = db.query(Inventory).filter(
            Inventory.pharmacy_id == res_in.pharmacy_id,
            Inventory.medicine_id == item.medicine_id
        ).first()

        if not inv or inv.quantity < item.quantity:
            med = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
            med_name = med.name if med else "Medicine"
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for {med_name}. Only {inv.quantity if inv else 0} available."
            )

        unit_price = inv.price
        reservation_items_to_create.append({
            "medicine_id": item.medicine_id,
            "quantity": item.quantity,
            "price": unit_price
        })

    # Create reservation with 2 hour expiration hold
    code = generate_reservation_code()
    expires_at = datetime.utcnow() + timedelta(hours=2)

    reservation = Reservation(
        user_id=current_user.id,
        pharmacy_id=res_in.pharmacy_id,
        status="PENDING",
        reservation_code=code,
        expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    for item_data in reservation_items_to_create:
        res_item = ReservationItem(
            reservation_id=reservation.id,
            medicine_id=item_data["medicine_id"],
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(res_item)

    # Add notification for the pharmacy owner
    if pharmacy.owner_id:
        notif = Notification(
            user_id=pharmacy.owner_id,
            title="New Reservation Request",
            message=f"New reservation #{code} received from {current_user.name}.",
            type="RESERVATION"
        )
        db.add(notif)

    db.commit()
    db.refresh(reservation)
    return reservation

@router.get("/my", response_model=List[ReservationResponse])
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservations = db.query(Reservation).filter(
        Reservation.user_id == current_user.id
    ).order_by(Reservation.created_at.desc()).all()
    return reservations

@router.get("/pharmacy/{pharmacy_id}", response_model=List[ReservationResponse])
def get_pharmacy_reservations(
    pharmacy_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    reservations = db.query(Reservation).filter(
        Reservation.pharmacy_id == pharmacy_id
    ).order_by(Reservation.created_at.desc()).all()
    return reservations

@router.get("/verify-code/{code}", response_model=ReservationResponse)
def verify_reservation_code(code: str, db: Session = Depends(get_db)):
    """
    Counter check for pharmacist barcode/QR scanner.
    """
    code_clean = code.strip().upper()
    reservation = db.query(Reservation).filter(Reservation.reservation_code == code_clean).first()
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reservation code {code_clean} not found.")
    return reservation

@router.post("/verify-code/{code}/fulfill", response_model=ReservationResponse)
def fulfill_reservation_code(
    code: str,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    """
    1-click dispense & fulfillment at pharmacy counter.
    """
    code_clean = code.strip().upper()
    reservation = db.query(Reservation).filter(Reservation.reservation_code == code_clean).first()
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reservation code {code_clean} not found.")

    reservation.status = "COMPLETED"
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == reservation.pharmacy_id).first()
    pharmacy_name = pharmacy.name if pharmacy else "Pharmacy"

    # Notify Patient
    notif = Notification(
        user_id=reservation.user_id,
        title="Medicine Dispensed & Fulfilled ✅",
        message=f"Your reservation {reservation.reservation_code} was fulfilled at {pharmacy_name}. Thank you!",
        type="SUCCESS"
    )
    db.add(notif)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.get("/{id}", response_model=ReservationResponse)
def get_reservation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation = db.query(Reservation).filter(Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

@router.put("/{id}/status", response_model=ReservationResponse)
def update_reservation_status(
    id: int,
    status_in: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN", "PATIENT"]))
):
    reservation = db.query(Reservation).filter(Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    old_status = reservation.status
    new_status = status_in.status.upper()
    reservation.status = new_status

    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == reservation.pharmacy_id).first()
    pharmacy_name = pharmacy.name if pharmacy else "Pharmacy"

    # If confirmed, deduct inventory units
    if new_status == "CONFIRMED" and old_status != "CONFIRMED":
        for item in reservation.items:
            inv = db.query(Inventory).filter(
                Inventory.pharmacy_id == reservation.pharmacy_id,
                Inventory.medicine_id == item.medicine_id
            ).first()
            if inv:
                old_qty = inv.quantity
                inv.quantity = max(0, inv.quantity - item.quantity)
                if inv.quantity <= 0:
                    inv.status = "OUT_OF_STOCK"
                elif inv.quantity < 10:
                    inv.status = "LOW_STOCK"
                inv.last_updated = datetime.utcnow()
                
                event = InventoryEvent(
                    pharmacy_id=reservation.pharmacy_id,
                    medicine_id=item.medicine_id,
                    old_quantity=old_qty,
                    new_quantity=inv.quantity,
                    event_type="RESERVATION_HOLD"
                )
                db.add(event)

        # Notify Patient
        notif = Notification(
            user_id=reservation.user_id,
            title="Reservation Confirmed! 🎉",
            message=f"Your reservation {reservation.reservation_code} has been confirmed by {pharmacy_name}. Ready for pickup!",
            type="SUCCESS"
        )
        db.add(notif)

    elif new_status == "REJECTED":
        # Notify Patient
        notif = Notification(
            user_id=reservation.user_id,
            title="Reservation Update",
            message=f"Your reservation request {reservation.reservation_code} could not be fulfilled by {pharmacy_name}.",
            type="WARNING"
        )
        db.add(notif)

    elif new_status == "COMPLETED":
        notif = Notification(
            user_id=reservation.user_id,
            title="Medicine Picked Up",
            message=f"Thank you for picking up your reservation {reservation.reservation_code} from {pharmacy_name}.",
            type="SUCCESS"
        )
        db.add(notif)

    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/{id}/whatsapp-link")
def get_reservation_whatsapp_link(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates real-time pre-formatted WhatsApp Web & SMS deep link with pickup code and live Google Maps directions.
    """
    import urllib.parse
    reservation = db.query(Reservation).filter(Reservation.id == id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == reservation.pharmacy_id).first()
    pharmacy_name = pharmacy.name if pharmacy else "Local Pharmacy"
    pharmacy_address = f"{pharmacy.address}, {pharmacy.city}" if pharmacy else "City Center"
    maps_link = f"https://www.google.com/maps/dir/?api=1&destination={pharmacy.latitude},{pharmacy.longitude}" if pharmacy else "https://maps.google.com"

    items_str = ", ".join([f"{it.quantity}x {it.medicine.name if it.medicine else 'Medicine'}" for it in reservation.items])
    expires_str = reservation.expires_at.strftime("%I:%M %p")

    message_text = (
        f"🏥 *MedReach AI — Medicine Pickup Voucher*\n\n"
        f"🔑 *Pickup Code*: `{reservation.reservation_code}`\n"
        f"📍 *Pharmacy*: {pharmacy_name}\n"
        f"🏢 *Address*: {pharmacy_address}\n"
        f"📦 *Medicines*: {items_str}\n"
        f"⏰ *Hold Valid Until*: {expires_str}\n\n"
        f"🗺️ *Google Maps GPS*: {maps_link}\n\n"
        f"Show this code at the pharmacy counter for instant handover."
    )

    encoded_msg = urllib.parse.quote(message_text)
    whatsapp_url = f"https://wa.me/?text={encoded_msg}"
    sms_url = f"sms:?body={encoded_msg}"

    return {
        "reservation_code": reservation.reservation_code,
        "message": message_text,
        "whatsapp_url": whatsapp_url,
        "sms_url": sms_url,
        "maps_link": maps_link
    }


@router.post("/delivery/quote")
def get_delivery_quote(
    pharmacy_id: int,
    distance_km: float = 1.2
):
    """
    Real-time simulated Courier API (Dunzo / Shadowfax / Blinkit Express) calculation.
    """
    base_fee = 35.0
    per_km = 8.0
    calc_fee = round(base_fee + (distance_km * per_km), 2)
    est_mins = max(15, min(40, round(12 + distance_km * 4)))

    return {
        "courier_partner": "Shadowfax Express / Dunzo Delivery",
        "estimated_minutes": est_mins,
        "delivery_fee": calc_fee,
        "distance_km": distance_km,
        "is_serviceable": True,
        "rider_tracking_available": True,
        "rider": {
            "name": "Amit Sharma",
            "vehicle": "Hero Splendor (MH-19-BK-4921)",
            "phone": "+91 98230 11223",
            "rating": 4.9
        }
    }

