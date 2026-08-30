import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Prescription, PrescriptionItem, User, Medicine
from app.schemas import PrescriptionResponse, PrescriptionConfirmRequest, GenericResponse
from app.deps import get_current_user
from app.services.ai_service import ai_service
from app.config import settings

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/upload", response_model=PrescriptionResponse)
async def upload_prescription(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    file_bytes = await file.read()
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Perform AI OCR Text extraction
    ocr_text = ai_service.perform_ocr(file_bytes, filename=file.filename)

    # Create prescription record
    prescription = Prescription(
        user_id=current_user.id,
        image_path=f"/uploads/prescriptions/{unique_filename}",
        ocr_text=ocr_text,
        status="PROCESSED"
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    # Extract structured candidate medicines
    extracted = ai_service.extract_medicines(ocr_text, db)
    for item in extracted:
        p_item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_id=item.get("medicine_id"),
            raw_name=item["raw_name"],
            normalized_name=item["normalized_name"],
            strength=item.get("strength"),
            quantity=item.get("quantity", 1),
            confidence_score=item.get("confidence_score", 0.95),
            verification_status="PENDING"
        )
        db.add(p_item)

    db.commit()
    db.refresh(prescription)
    return prescription

@router.get("/inbox/my")
def get_my_doctor_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Patient receives all verified digital prescriptions pushed by doctors.
    """
    return _DOCTOR_PRESCRIPTIONS

@router.get("/{id}", response_model=PrescriptionResponse)
def get_prescription(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescription = db.query(Prescription).filter(Prescription.id == id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.post("/{id}/confirm", response_model=PrescriptionResponse)
def confirm_prescription_medicines(
    id: int,
    confirm_in: PrescriptionConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prescription = db.query(Prescription).filter(Prescription.id == id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Clear previous items and add user-confirmed medicines
    db.query(PrescriptionItem).filter(PrescriptionItem.prescription_id == id).delete()

    for item in confirm_in.items:
        # Match against medicine DB if not matched
        med_id = item.medicine_id
        if not med_id:
            found_med = db.query(Medicine).filter(
                (Medicine.name.ilike(f"%{item.normalized_name}%")) |
                (Medicine.generic_name.ilike(f"%{item.normalized_name}%"))
            ).first()
            if found_med:
                med_id = found_med.id

        new_item = PrescriptionItem(
            prescription_id=id,
            medicine_id=med_id,
            raw_name=item.raw_name,
            normalized_name=item.normalized_name,
            strength=item.strength,
            quantity=item.quantity or 1,
            confidence_score=item.confidence_score or 1.0,
            verification_status="CONFIRMED"
        )
        db.add(new_item)

    prescription.status = "CONFIRMED"
    db.commit()
    db.refresh(prescription)
    return prescription


# In-memory store for doctor digital e-prescriptions pushed in demo environment
_DOCTOR_PRESCRIPTIONS = [
    {
        "id": 101,
        "prescription_code": "RX-DOC-98214",
        "doctor_name": "Dr. Rajesh Kulkarni, MD",
        "clinic_name": "City Care Heart & Diabetes Clinic",
        "doctor_license": "MCI-482910-MH",
        "patient_name": "Rahul Patel",
        "patient_email": "patient@medreach.ai",
        "diagnosis": "Type 2 Diabetes Mellitus with Mild Hypertension",
        "notes": "Monitor fasting blood glucose twice weekly. Take medicines strictly post breakfast.",
        "created_at": "2026-08-22T10:30:00Z",
        "status": "ACTIVE",
        "items": [
            {
                "name": "Metformin 500",
                "generic_name": "Metformin Hydrochloride",
                "dosage": "500mg",
                "frequency": "1-0-1 (After Food)",
                "duration_days": 30,
                "quantity": 60,
                "medicine_id": 4
            },
            {
                "name": "Telmisartan 40",
                "generic_name": "Telmisartan",
                "dosage": "40mg",
                "frequency": "1-0-0 (Morning)",
                "duration_days": 30,
                "quantity": 30,
                "medicine_id": 5
            }
        ]
    }
]

@router.post("/doctor-push")
def doctor_push_prescription(
    req: dict,
    db: Session = Depends(get_db)
):
    """
    Clinic/Hospital endpoint: Doctors push digital e-prescriptions straight to patient MedReach account.
    """
    new_id = len(_DOCTOR_PRESCRIPTIONS) + 101
    rx_code = f"RX-DOC-{random_digits(5)}"
    doc_rx = {
        "id": new_id,
        "prescription_code": rx_code,
        "doctor_name": req.get("doctor_name", "Dr. Rajesh Kulkarni, MD"),
        "clinic_name": req.get("clinic_name", "Metro Polyclinic"),
        "doctor_license": req.get("doctor_license", "MCI-882194-IND"),
        "patient_name": req.get("patient_name", "Rahul Patel"),
        "patient_email": req.get("patient_email", "patient@medreach.ai"),
        "diagnosis": req.get("diagnosis", "Acute Seasonal Infection & Fever"),
        "notes": req.get("notes", "Rest well and complete 5-day course."),
        "created_at": "2026-08-22T12:00:00Z",
        "status": "ACTIVE",
        "items": req.get("items", [
            {
                "name": "Azithromycin 500",
                "generic_name": "Azithromycin",
                "dosage": "500mg",
                "frequency": "1-0-0 (1 hour before lunch)",
                "duration_days": 5,
                "quantity": 5,
                "medicine_id": 2
            },
            {
                "name": "Paracetamol 650",
                "generic_name": "Paracetamol",
                "dosage": "650mg",
                "frequency": "1-0-1 (SOS fever)",
                "duration_days": 5,
                "quantity": 10,
                "medicine_id": 1
            }
        ])
    }
    _DOCTOR_PRESCRIPTIONS.insert(0, doc_rx)
    return {"success": True, "prescription": doc_rx}

def random_digits(k: int = 5) -> str:
    import random, string
    return ''.join(random.choices(string.digits, k=k))

