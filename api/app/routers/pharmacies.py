import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Pharmacy, Inventory, Medicine, InventoryEvent, User
from app.schemas import (
    PharmacyCreate,
    PharmacyUpdate,
    PharmacyResponse,
    PharmacyRankedResponse,
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    BasketItemRequest,
    BasketPharmacyFulfillment,
    GenericResponse
)
from app.deps import get_current_user, require_role
from app.services.ranking_service import ranking_service

router = APIRouter(prefix="/pharmacies", tags=["Pharmacies"])

@router.get("/nearby", response_model=List[PharmacyRankedResponse])
def get_nearby_pharmacies(
    latitude: float = Query(21.0000, description="User GPS latitude"),
    longitude: float = Query(75.5600, description="User GPS longitude"),
    radius: float = Query(15.0, description="Search radius in kilometers"),
    medicine_id: Optional[int] = Query(None, description="Filter by medicine ID"),
    medicine_name: Optional[str] = Query(None, description="Filter by medicine name"),
    urgent_mode: bool = Query(False, description="Prioritize fastest speed & availability"),
    quantity: int = Query(1, description="Required medicine units"),
    db: Session = Depends(get_db)
):
    ranked = ranking_service.rank_pharmacies(
        user_lat=latitude,
        user_lon=longitude,
        medicine_id=medicine_id,
        medicine_name=medicine_name,
        radius_km=radius,
        urgent_mode=urgent_mode,
        required_quantity=quantity,
        db=db
    )
    return ranked

@router.post("/basket-availability", response_model=List[BasketPharmacyFulfillment])
def check_prescription_basket_availability(
    items: List[BasketItemRequest],
    latitude: float = Query(21.0000),
    longitude: float = Query(75.5600),
    radius: float = Query(20.0),
    db: Session = Depends(get_db)
):
    """
    Evaluates availability of an entire multi-item prescription basket across nearby pharmacies.
    Ranks stores with 100% full match first, followed by proximity and total basket price.
    """
    pharmacies = db.query(Pharmacy).all()
    fulfillments = []

    for pharmacy in pharmacies:
        dist = ranking_service.calculate_haversine_distance(latitude, longitude, pharmacy.latitude, pharmacy.longitude)
        if dist > radius:
            continue

        matched_count = 0
        total_price = 0.0
        item_details = []

        for req in items:
            inv = db.query(Inventory).filter(
                Inventory.pharmacy_id == pharmacy.id,
                Inventory.medicine_id == req.medicine_id
            ).first()

            med = db.query(Medicine).filter(Medicine.id == req.medicine_id).first()
            is_in_stock = inv is not None and inv.quantity >= req.quantity
            avail_qty = inv.quantity if inv else 0
            unit_price = inv.price if inv else 0.0

            if is_in_stock:
                matched_count += 1
                total_price += (unit_price * req.quantity)

            item_details.append({
                "medicine_id": req.medicine_id,
                "medicine_name": med.name if med else "Medicine",
                "generic_name": med.generic_name if med else "",
                "requested_quantity": req.quantity,
                "available_quantity": avail_qty,
                "unit_price": unit_price,
                "in_stock": is_in_stock
            })

        is_full_match = (matched_count == len(items)) and len(items) > 0
        trust = ranking_service.calculate_trust_score(pharmacy, db)

        # Final ranking score
        match_score = (matched_count / max(1, len(items))) * 50.0
        distance_score = max(0.0, 30.0 - (dist / radius) * 30.0)
        trust_score = (trust / 100.0) * 20.0
        final_score = round(match_score + distance_score + trust_score, 1)

        fulfillments.append({
            "pharmacy": pharmacy,
            "distance_km": dist,
            "is_full_match": is_full_match,
            "matched_items_count": matched_count,
            "total_items_count": len(items),
            "total_basket_price": round(total_price, 2),
            "trust_score": trust,
            "final_score": final_score,
            "item_availability": item_details
        })

    # Sort full matches first, then score descending
    fulfillments.sort(key=lambda x: (1 if x["is_full_match"] else 0, x["final_score"]), reverse=True)
    return fulfillments

@router.get("", response_model=List[PharmacyResponse])
def list_pharmacies(
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Pharmacy)
    if city:
        query = query.filter(Pharmacy.city.ilike(f"%{city}%"))
    return query.all()

@router.get("/my", response_model=PharmacyResponse)
def get_my_pharmacy(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.owner_id == current_user.id).first()
    if not pharmacy:
        pharmacy = db.query(Pharmacy).first()
        if not pharmacy:
            raise HTTPException(status_code=404, detail="No pharmacy associated with this account")
    return pharmacy

@router.get("/{id}", response_model=PharmacyResponse)
def get_pharmacy(id: int, db: Session = Depends(get_db)):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    return pharmacy

@router.post("", response_model=PharmacyResponse)
def create_pharmacy(
    pharmacy_in: PharmacyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    pharmacy = Pharmacy(
        owner_id=current_user.id,
        **pharmacy_in.dict()
    )
    db.add(pharmacy)
    db.commit()
    db.refresh(pharmacy)
    return pharmacy

@router.put("/{id}", response_model=PharmacyResponse)
def update_pharmacy(
    id: int,
    pharmacy_in: PharmacyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    for key, val in pharmacy_in.dict(exclude_unset=True).items():
        setattr(pharmacy, key, val)

    db.commit()
    db.refresh(pharmacy)
    return pharmacy

@router.put("/{id}/verify", response_model=PharmacyResponse)
def toggle_verify_pharmacy(
    id: int,
    status_value: str = Query("VERIFIED"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(["ADMIN"]))
):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    pharmacy.verification_status = status_value
    db.commit()
    db.refresh(pharmacy)
    return pharmacy

# ================= INVENTORY ENDPOINTS =================
@router.get("/{id}/inventory", response_model=List[InventoryResponse])
def get_pharmacy_inventory(id: int, db: Session = Depends(get_db)):
    items = db.query(Inventory).filter(Inventory.pharmacy_id == id).all()
    return items

@router.post("/{id}/inventory", response_model=InventoryResponse)
def add_or_update_inventory(
    id: int,
    item_in: InventoryCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    existing = db.query(Inventory).filter(
        Inventory.pharmacy_id == id,
        Inventory.medicine_id == item_in.medicine_id
    ).first()

    status_calc = "AVAILABLE"
    if item_in.quantity <= 0:
        status_calc = "OUT_OF_STOCK"
    elif item_in.quantity < 10:
        status_calc = "LOW_STOCK"

    if existing:
        old_qty = existing.quantity
        existing.quantity = item_in.quantity
        existing.price = item_in.price
        existing.batch_number = item_in.batch_number or existing.batch_number
        existing.expiry_date = item_in.expiry_date or existing.expiry_date
        existing.status = status_calc
        existing.last_updated = datetime.utcnow()
        
        event = InventoryEvent(
            pharmacy_id=id,
            medicine_id=item_in.medicine_id,
            old_quantity=old_qty,
            new_quantity=item_in.quantity,
            event_type="RESTOCK" if item_in.quantity > old_qty else "ADJUSTMENT"
        )
        db.add(event)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_inv = Inventory(
            pharmacy_id=id,
            medicine_id=item_in.medicine_id,
            quantity=item_in.quantity,
            price=item_in.price,
            batch_number=item_in.batch_number or "BATCH-2026",
            expiry_date=item_in.expiry_date or "2027-12",
            status=status_calc,
            last_updated=datetime.utcnow()
        )
        db.add(new_inv)
        db.commit()
        db.refresh(new_inv)
        return new_inv

@router.put("/{pharmacy_id}/inventory/{inventory_id}", response_model=InventoryResponse)
def update_inventory_item(
    pharmacy_id: int,
    inventory_id: int,
    item_in: InventoryUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    inv = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.pharmacy_id == pharmacy_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    old_qty = inv.quantity
    if item_in.quantity is not None:
        inv.quantity = item_in.quantity
        if inv.quantity <= 0:
            inv.status = "OUT_OF_STOCK"
        elif inv.quantity < 10:
            inv.status = "LOW_STOCK"
        else:
            inv.status = "AVAILABLE"

    if item_in.price is not None:
        inv.price = item_in.price

    if item_in.batch_number is not None:
        inv.batch_number = item_in.batch_number

    if item_in.expiry_date is not None:
        inv.expiry_date = item_in.expiry_date

    if item_in.status is not None:
        inv.status = item_in.status

    inv.last_updated = datetime.utcnow()

    event = InventoryEvent(
        pharmacy_id=pharmacy_id,
        medicine_id=inv.medicine_id,
        old_quantity=old_qty,
        new_quantity=inv.quantity,
        event_type="ADJUSTMENT"
    )
    db.add(event)
    db.commit()
    db.refresh(inv)
    return inv

@router.delete("/{pharmacy_id}/inventory/{inventory_id}", response_model=GenericResponse)
def delete_inventory_item(
    pharmacy_id: int,
    inventory_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    inv = db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.pharmacy_id == pharmacy_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    db.delete(inv)
    db.commit()
    return {"success": True, "message": "Inventory item removed successfully"}

# ================= BULK CSV IMPORT / EXPORT FOR PHARMACY POS =================
@router.post("/{id}/inventory/import-csv", response_model=GenericResponse)
async def import_inventory_csv(
    id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: User = Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    """
    Bulk imports medicines & stock counts from pharmacy POS system CSV.
    Format: medicine_name, generic_name, strength, dosage_form, quantity, price, batch_number, expiry_date
    """
    contents = await file.read()
    decoded = contents.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    imported_count = 0
    for row in reader:
        name = row.get("medicine_name") or row.get("Name")
        if not name:
            continue
        gen = row.get("generic_name") or name
        strength = row.get("strength") or "Standard"
        dosage_form = row.get("dosage_form") or "Tablet"
        qty = int(row.get("quantity") or 20)
        price = float(row.get("price") or 30.0)
        batch = row.get("batch_number") or "BATCH-CSV"
        expiry = row.get("expiry_date") or "2027-12"

        # Check or create medicine
        med = db.query(Medicine).filter(Medicine.name.ilike(name)).first()
        if not med:
            med = Medicine(name=name, generic_name=gen, strength=strength, dosage_form=dosage_form)
            db.add(med)
            db.commit()
            db.refresh(med)

        # Update or create inventory
        inv = db.query(Inventory).filter(Inventory.pharmacy_id == id, Inventory.medicine_id == med.id).first()
        status_calc = "AVAILABLE" if qty >= 10 else ("LOW_STOCK" if qty > 0 else "OUT_OF_STOCK")
        if inv:
            inv.quantity = qty
            inv.price = price
            inv.batch_number = batch
            inv.expiry_date = expiry
            inv.status = status_calc
            inv.last_updated = datetime.utcnow()
        else:
            inv = Inventory(
                pharmacy_id=id,
                medicine_id=med.id,
                quantity=qty,
                price=price,
                batch_number=batch,
                expiry_date=expiry,
                status=status_calc,
                last_updated=datetime.utcnow()
            )
            db.add(inv)
        imported_count += 1

    db.commit()
    return {"success": True, "message": f"Successfully imported {imported_count} inventory records from POS CSV."}

@router.get("/{id}/inventory/export-csv")
def export_inventory_csv(id: int, db: Session = Depends(get_db)):
    """
    Exports full pharmacy inventory to CSV for local backup or POS sync.
    """
    items = db.query(Inventory).filter(Inventory.pharmacy_id == id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["medicine_name", "generic_name", "strength", "dosage_form", "quantity", "price", "batch_number", "expiry_date", "status"])

    for item in items:
        med = item.medicine
        writer.writerow([
            med.name if med else "",
            med.generic_name if med else "",
            med.strength if med else "",
            med.dosage_form if med else "",
            item.quantity,
            item.price,
            item.batch_number,
            item.expiry_date,
            item.status
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=pharmacy_{id}_inventory.csv"}
    )
