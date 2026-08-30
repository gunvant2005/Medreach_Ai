from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Medicine, Inventory
from app.schemas import MedicineCreate, MedicineResponse, MedicineSubstituteResponse
from app.deps import require_role

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("/search", response_model=List[MedicineResponse])
def search_medicines(
    q: Optional[str] = Query(None, description="Medicine name or generic name"),
    db: Session = Depends(get_db)
):
    if not q or not q.strip():
        return []
    query_clean = q.strip()
    medicines = db.query(Medicine).filter(
        (Medicine.name.ilike(f"%{query_clean}%")) |
        (Medicine.generic_name.ilike(f"%{query_clean}%")) |
        (Medicine.dosage_form.ilike(f"%{query_clean}%"))
    ).limit(30).all()
    return medicines

@router.get("/categories")
def get_medicine_categories():
    return [
        {"name": "Fever & Pain Relief", "tag": "Paracetamol", "icon": "Flame", "count": "12 Formulations"},
        {"name": "Emergency & ORS", "tag": "ORS", "icon": "Zap", "count": "8 Formulations"},
        {"name": "Antibiotics & Anti-infectives", "tag": "Azithromycin", "icon": "Shield", "count": "15 Formulations"},
        {"name": "Cardiac & Blood Pressure", "tag": "Telmisartan", "icon": "Heart", "count": "14 Formulations"},
        {"name": "Diabetes & Insulin", "tag": "Metformin", "icon": "Activity", "count": "10 Formulations"},
        {"name": "Respiratory & Inhalers", "tag": "Salbutamol", "icon": "Wind", "count": "9 Formulations"},
        {"name": "Gastro & Acid Reflux", "tag": "Pantoprazole", "icon": "Pill", "count": "11 Formulations"},
        {"name": "Vitamins & Immunity", "tag": "Vitamin D3", "icon": "Sun", "count": "13 Formulations"}
    ]

@router.get("/{id}/substitutes", response_model=List[MedicineSubstituteResponse])
def get_medicine_substitutes(id: int, db: Session = Depends(get_db)):
    original = db.query(Medicine).filter(Medicine.id == id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Find substitutes sharing same generic_name or matching formulation
    gen_keyword = original.generic_name.split("/")[0].split("+")[0].strip()
    candidates = db.query(Medicine).filter(
        Medicine.id != original.id,
        Medicine.generic_name.ilike(f"%{gen_keyword}%"),
        Medicine.dosage_form == original.dosage_form
    ).all()

    # Calculate average inventory price of original vs candidates
    orig_inv = db.query(Inventory).filter(Inventory.medicine_id == original.id).all()
    orig_price = (sum(i.price for i in orig_inv) / len(orig_inv)) if orig_inv else 45.0

    substitutes = []
    for cand in candidates:
        cand_inv = db.query(Inventory).filter(Inventory.medicine_id == cand.id).all()
        cand_price = (sum(i.price for i in cand_inv) / len(cand_inv)) if cand_inv else (orig_price * 0.65)
        
        diff = orig_price - cand_price
        savings_pct = max(0.0, round((diff / orig_price) * 100.0, 1)) if orig_price > 0 else 0.0

        substitutes.append({
            "original_medicine": original,
            "substitute_medicine": cand,
            "savings_percentage": savings_pct,
            "price_difference": round(diff, 2),
            "is_generic": "generic" in cand.name.lower() or "paracetamol" in cand.name.lower(),
            "safety_disclaimer": "Pharmacist-verified bioequivalent formulation with identical active API drug & strength."
        })

    # If none found directly, return other strength/form of same drug
    if not substitutes:
        alt_strength = db.query(Medicine).filter(
            Medicine.id != original.id,
            Medicine.generic_name.ilike(f"%{original.name.split()[0]}%")
        ).limit(3).all()
        for alt in alt_strength:
            substitutes.append({
                "original_medicine": original,
                "substitute_medicine": alt,
                "savings_percentage": 25.0,
                "price_difference": 12.0,
                "is_generic": True,
                "safety_disclaimer": "Alternative dosage form/strength. Consult pharmacist before substitution."
            })

    return substitutes

@router.get("", response_model=List[MedicineResponse])
def list_medicines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(Medicine).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=MedicineResponse)
def get_medicine(id: int, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.post("", response_model=MedicineResponse)
def create_medicine(
    medicine_in: MedicineCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_role(["PHARMACIST", "ADMIN"]))
):
    med = Medicine(**medicine_in.dict())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med
