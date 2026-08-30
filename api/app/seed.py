from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    User,
    Pharmacy,
    Medicine,
    Inventory,
    Reservation,
    ReservationItem,
    Notification,
    PharmacyReview,
    InventoryEvent
)
from app.security import get_password_hash

def seed_database(db: Session = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    if db is None:
        db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already contains data. Refreshing demo records...")
        # Clear existing to ensure fresh demo data
        db.query(InventoryEvent).delete()
        db.query(PharmacyReview).delete()
        db.query(Notification).delete()
        db.query(ReservationItem).delete()
        db.query(Reservation).delete()
        db.query(Inventory).delete()
        db.query(Pharmacy).delete()
        db.query(Medicine).delete()
        db.query(User).delete()
        db.commit()

    print("Seeding MedReach AI database...")

    # 1. Seed Users (Admins, Pharmacists, Patients)
    default_password = get_password_hash("password123")

    users_data = [
        # Admins
        {"name": "Admin Officer", "email": "admin@medreach.ai", "phone": "+91 98200 11223", "role": "ADMIN"},
        {"name": "Supply Auditor", "email": "auditor@medreach.ai", "phone": "+91 98200 11224", "role": "ADMIN"},
        {"name": "Health Coordinator", "email": "health@medreach.ai", "phone": "+91 98200 11225", "role": "ADMIN"},
        
        # Pharmacists
        {"name": "Rajesh Sharma (Pharmacist)", "email": "pharmacist@medreach.ai", "phone": "+91 98230 44556", "role": "PHARMACIST"},
        {"name": "Dr. Sunita Deshmukh", "email": "sunita@apollo.com", "phone": "+91 98230 44557", "role": "PHARMACIST"},
        {"name": "Amit Patel", "email": "amit@medplus.com", "phone": "+91 98230 44558", "role": "PHARMACIST"},
        {"name": "Pooja Verma", "email": "pooja@wellness.com", "phone": "+91 98230 44559", "role": "PHARMACIST"},

        # Patients
        {"name": "Aarav Gupta (Demo Patient)", "email": "patient@medreach.ai", "phone": "+91 98765 00111", "role": "PATIENT"},
        {"name": "Neha Joshi", "email": "neha@gmail.com", "phone": "+91 98765 00112", "role": "PATIENT"},
        {"name": "Rohan Kulkarni", "email": "rohan@gmail.com", "phone": "+91 98765 00113", "role": "PATIENT"},
        {"name": "Priya Nair", "email": "priya@gmail.com", "phone": "+91 98765 00114", "role": "PATIENT"},
        {"name": "Vikram Singh", "email": "vikram@gmail.com", "phone": "+91 98765 00115", "role": "PATIENT"},
        {"name": "Ananya Roy", "email": "ananya@gmail.com", "phone": "+91 98765 00116", "role": "PATIENT"},
        {"name": "Karan Malhotra", "email": "karan@gmail.com", "phone": "+91 98765 00117", "role": "PATIENT"},
        {"name": "Siddharth Rao", "email": "sid@gmail.com", "phone": "+91 98765 00118", "role": "PATIENT"},
        {"name": "Meera Iyer", "email": "meera@gmail.com", "phone": "+91 98765 00119", "role": "PATIENT"},
        {"name": "Deepak Patil", "email": "deepak@gmail.com", "phone": "+91 98765 00120", "role": "PATIENT"},
    ]

    created_users = {}
    for u in users_data:
        user = User(
            name=u["name"],
            email=u["email"],
            phone=u["phone"],
            password_hash=default_password,
            role=u["role"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created_users[u["email"]] = user

    # 2. Seed Pharmacies
    pharmacies_data = [
        {
            "name": "Sharma Medical & Chemist",
            "owner_email": "pharmacist@medreach.ai",
            "phone": "+91 98230 44556",
            "address": "Shop 4, Court Road, Near District Hospital",
            "city": "Jalgaon",
            "latitude": 21.0025,
            "longitude": 75.5645,
            "verification_status": "VERIFIED",
            "opening_time": "08:00 AM",
            "closing_time": "11:00 PM"
        },
        {
            "name": "Apollo 24/7 Pharmacy",
            "owner_email": "sunita@apollo.com",
            "phone": "+91 98230 44557",
            "address": "Plot 12, Station Road, Opposite Central Mall",
            "city": "Jalgaon",
            "latitude": 21.0080,
            "longitude": 75.5680,
            "verification_status": "VERIFIED",
            "opening_time": "00:00 AM",
            "closing_time": "11:59 PM"
        },
        {
            "name": "MedPlus Health Hub",
            "owner_email": "amit@medplus.com",
            "phone": "+91 98230 44558",
            "address": "15/B Ring Road, Near Shivaji Park",
            "city": "Jalgaon",
            "latitude": 20.9950,
            "longitude": 75.5530,
            "verification_status": "VERIFIED",
            "opening_time": "08:30 AM",
            "closing_time": "10:30 PM"
        },
        {
            "name": "Wellness Forever Chemist",
            "owner_email": "pooja@wellness.com",
            "phone": "+91 98230 44559",
            "address": "G-2, Akash Heights, Old Agra Highway",
            "city": "Jalgaon",
            "latitude": 21.0150,
            "longitude": 75.5750,
            "verification_status": "VERIFIED",
            "opening_time": "08:00 AM",
            "closing_time": "11:00 PM"
        },
        {
            "name": "Lifecare 24x7 Drug Store",
            "owner_email": "pharmacist@medreach.ai",
            "phone": "+91 98230 44560",
            "address": "Shop 10, Civil Lines",
            "city": "Jalgaon",
            "latitude": 20.9890,
            "longitude": 75.5480,
            "verification_status": "VERIFIED",
            "opening_time": "08:00 AM",
            "closing_time": "10:00 PM"
        },
        {
            "name": "City Care Pharmacy",
            "owner_email": "pharmacist@medreach.ai",
            "phone": "+91 98230 44561",
            "address": "Main Market, MG Road",
            "city": "Jalgaon",
            "latitude": 21.0120,
            "longitude": 75.5610,
            "verification_status": "PENDING",
            "opening_time": "09:00 AM",
            "closing_time": "09:30 PM"
        },
        {
            "name": "Sanjeevani Medicals",
            "owner_email": "pharmacist@medreach.ai",
            "phone": "+91 98230 44562",
            "address": "Opposite Civil Hospital, Hospital Road",
            "city": "Jalgaon",
            "latitude": 21.0040,
            "longitude": 75.5620,
            "verification_status": "VERIFIED",
            "opening_time": "07:30 AM",
            "closing_time": "11:30 PM"
        },
        {
            "name": "National Drug House",
            "owner_email": "pharmacist@medreach.ai",
            "phone": "+91 98230 44563",
            "address": "45 Nehru Market",
            "city": "Jalgaon",
            "latitude": 21.0200,
            "longitude": 75.5790,
            "verification_status": "VERIFIED",
            "opening_time": "08:00 AM",
            "closing_time": "10:00 PM"
        }
    ]

    created_pharmacies = []
    for p in pharmacies_data:
        owner = created_users.get(p["owner_email"])
        pharmacy = Pharmacy(
            owner_id=owner.id if owner else None,
            name=p["name"],
            phone=p["phone"],
            address=p["address"],
            city=p["city"],
            latitude=p["latitude"],
            longitude=p["longitude"],
            verification_status=p["verification_status"],
            opening_time=p["opening_time"],
            closing_time=p["closing_time"],
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(pharmacy)
        db.commit()
        db.refresh(pharmacy)
        created_pharmacies.append(pharmacy)

    # 3. Seed 50+ Medicines
    medicines_catalog = [
        ("Paracetamol", "Paracetamol / Acetaminophen", "650mg", "Tablet", "Micro Labs (Dolo)"),
        ("Paracetamol 500", "Paracetamol", "500mg", "Tablet", "GlaxoSmithKline"),
        ("Azithromycin", "Azithromycin", "500mg", "Tablet", "Alembic Pharma"),
        ("Azithromycin 250", "Azithromycin", "250mg", "Tablet", "Cipla Ltd"),
        ("Amoxicillin", "Amoxicillin Trihydrate", "500mg", "Capsule", "Mankind Pharma"),
        ("Augmentin 625 Duo", "Amoxicillin + Clavulanic Acid", "625mg", "Tablet", "GlaxoSmithKline"),
        ("Oral Rehydration Salts (ORS)", "Sodium Chloride + Dextrose", "21.8g", "Sachet", "FDC Ltd (Electral)"),
        ("Metformin", "Metformin Hydrochloride", "500mg", "Tablet", "USV Pvt Ltd (Glycomet)"),
        ("Metformin SR 1000", "Metformin Sustained Release", "1000mg", "Tablet", "Sun Pharma"),
        ("Telmisartan", "Telmisartan", "40mg", "Tablet", "Glenmark (Telma)"),
        ("Telmisartan 80", "Telmisartan", "80mg", "Tablet", "Glenmark (Telma)"),
        ("Amlodipine", "Amlodipine Besylate", "5mg", "Tablet", "Pfizer Ltd (Norvasc)"),
        ("Atorvastatin", "Atorvastatin Calcium", "10mg", "Tablet", "Zydus Cadila"),
        ("Atorvastatin 20", "Atorvastatin Calcium", "20mg", "Tablet", "Cipla Ltd"),
        ("Pantoprazole", "Pantoprazole Sodium", "40mg", "Tablet", "Alkem Labs (Pan 40)"),
        ("Pan-D", "Pantoprazole + Domperidone", "40mg/30mg", "Capsule", "Alkem Labs"),
        ("Omeprazole", "Omeprazole", "20mg", "Capsule", "Dr. Reddy's Labs (Omez)"),
        ("Rabeprazole", "Rabeprazole Sodium", "20mg", "Tablet", "Lupin Ltd (Rablet)"),
        ("Cetirizine", "Cetirizine Dihydrochloride", "10mg", "Tablet", "Dr. Reddy's (Cetzine)"),
        ("Levocetirizine", "Levocetirizine", "5mg", "Tablet", "Mankind Pharma (Levocet)"),
        ("Montelukast + Levocetirizine", "Montelukast + Levocetirizine", "10mg/5mg", "Tablet", "Sun Pharma (Montair LC)"),
        ("Ascoril-D", "Dextromethorphan + Phenylephrine", "100ml", "Syrup", "Glenmark Pharma"),
        ("Benadryl Cough Formula", "Diphenhydramine + Ammonium", "100ml", "Syrup", "Johnson & Johnson"),
        ("Insulin Glargine", "Recombinant Human Insulin", "100IU/ml", "Injection", "Sanofi (Lantus)"),
        ("Human Mixtard 30/70", "Isophane Insulin Suspension", "40IU/ml", "Injection", "Novo Nordisk"),
        ("Ciprofloxacin", "Ciprofloxacin", "500mg", "Tablet", "Cipla Ltd (Ciplox)"),
        ("Ofloxacin + Ornidazole", "Ofloxacin + Ornidazole", "200mg/500mg", "Tablet", "FDC Ltd (Oflox-OZ)"),
        ("Ibuprofen", "Ibuprofen", "400mg", "Tablet", "Abbott (Brufen)"),
        ("Combiflam", "Ibuprofen + Paracetamol", "400mg/325mg", "Tablet", "Sanofi India"),
        ("Tramadol", "Tramadol Hydrochloride", "50mg", "Capsule", "Torrent Pharma"),
        ("Diclofenac Gel", "Diclofenac Diethylamine", "30g", "Gel", "Novartis (Volini)"),
        ("Vitamin D3 (Cholecalciferol)", "Cholecalciferol 60K", "60000IU", "Capsule", "Cadila (Calcirol)"),
        ("Shelcal 500", "Calcium Carbonate + Vit D3", "500mg", "Tablet", "Torrent Pharma"),
        ("Becosules Z", "B-Complex + Vitamin C + Zinc", "Standard", "Capsule", "Pfizer Ltd"),
        ("Limcee 500", "Vitamin C (Ascorbic Acid)", "500mg", "Chewable Tablet", "Abbott"),
        ("Zincovit", "Multivitamins + Minerals + Zinc", "Standard", "Tablet", "Apex Labs"),
        ("Thyronorm 50", "Thyroxine Sodium", "50mcg", "Tablet", "Abbott India"),
        ("Thyronorm 100", "Thyroxine Sodium", "100mcg", "Tablet", "Abbott India"),
        ("Ecosprin 75", "Aspirin (Acetylsalicylic Acid)", "75mg", "Tablet", "USV Pvt Ltd"),
        ("Clopidogrel", "Clopidogrel Bisulfate", "75mg", "Tablet", "Sun Pharma (Clopilet)"),
        ("Salbutamol Inhaler", "Salbutamol", "100mcg/dose", "Inhaler", "Cipla Ltd (Asthalin)"),
        ("Budecort 200 Inhaler", "Budesonide", "200mcg/dose", "Inhaler", "Cipla Ltd"),
        ("Foracort 200 Rotacaps", "Formoterol + Budesonide", "6mcg/200mcg", "Capsule", "Cipla Ltd"),
        ("Gelusil Antacid", "Aluminium Hydroxide + Magnesium", "200ml", "Syrup", "Pfizer Ltd"),
        ("Digene Gel", "Dried Aluminium Hydroxide", "200ml", "Syrup", "Abbott"),
        ("Betadine Ointment", "Povidone Iodine 5% w/w", "20g", "Ointment", "Win-Medicare"),
        ("Soframycin Skin Cream", "Framycetin Sulphate 1%", "30g", "Cream", "Sanofi"),
        ("Neosporin Ointment", "Bacitracin + Neomycin + Polymyxin", "20g", "Ointment", "GSK"),
        ("Ciplox Eye Drops", "Ciprofloxacin 0.3%", "10ml", "Drops", "Cipla Ltd"),
        ("Refresh Tears Eye Drops", "Carboxymethylcellulose 0.5%", "10ml", "Drops", "Allergan"),
        ("Allegra 120", "Fexofenadine Hydrochloride", "120mg", "Tablet", "Sanofi"),
        ("Loperamide", "Loperamide Hydrochloride", "2mg", "Capsule", "Johnson & Johnson (Imodium)")
    ]

    created_medicines = []
    for name, gen, strength, form, mfg in medicines_catalog:
        med = Medicine(
            name=name,
            generic_name=gen,
            strength=strength,
            dosage_form=form,
            manufacturer=mfg
        )
        db.add(med)
        db.commit()
        db.refresh(med)
        created_medicines.append(med)

    # 4. Seed Inventory across pharmacies (150+ records)
    # Give Sharma Medical & Apollo high stock for Paracetamol 650, ORS, etc. for demo flow
    for idx, pharm in enumerate(created_pharmacies):
        for med_idx, med in enumerate(created_medicines):
            # Deterministic yet diverse realistic inventory distribution
            if med.name == "Paracetamol" and pharm.name.startswith("Sharma"):
                qty = 28
                price = 32.50
                status_val = "AVAILABLE"
                last_up = datetime.utcnow() - timedelta(minutes=4)
            elif med.name == "Paracetamol" and pharm.name.startswith("Apollo"):
                qty = 54
                price = 34.00
                status_val = "AVAILABLE"
                last_up = datetime.utcnow() - timedelta(minutes=18)
            elif med.name == "Oral Rehydration Salts (ORS)" and pharm.name.startswith("Sharma"):
                qty = 15
                price = 22.00
                status_val = "AVAILABLE"
                last_up = datetime.utcnow() - timedelta(minutes=2)
            elif med.name == "Insulin Glargine" and idx in [0, 1]:
                qty = 3
                price = 680.00
                status_val = "LOW_STOCK"
                last_up = datetime.utcnow() - timedelta(hours=3)
            elif med.name == "Azithromycin" and idx == 0:
                qty = 19
                price = 118.00
                status_val = "AVAILABLE"
                last_up = datetime.utcnow() - timedelta(minutes=10)
            elif (idx + med_idx) % 7 == 0:
                qty = 0
                price = round(random.uniform(20.0, 150.0), 2)
                status_val = "OUT_OF_STOCK"
                last_up = datetime.utcnow() - timedelta(days=2)
            elif (idx + med_idx) % 5 == 0:
                qty = random.randint(3, 8)
                price = round(random.uniform(25.0, 180.0), 2)
                status_val = "LOW_STOCK"
                last_up = datetime.utcnow() - timedelta(hours=random.randint(1, 12))
            else:
                qty = random.randint(15, 60)
                price = round(random.uniform(30.0, 220.0), 2)
                status_val = "AVAILABLE"
                last_up = datetime.utcnow() - timedelta(minutes=random.randint(5, 180))

            inv = Inventory(
                pharmacy_id=pharm.id,
                medicine_id=med.id,
                quantity=qty,
                price=price,
                status=status_val,
                last_updated=last_up
            )
            db.add(inv)

    db.commit()

    # 5. Seed Reviews for trust scoring
    reviews_data = [
        (created_pharmacies[0].id, created_users["patient@medreach.ai"].id, 5.0, "Always has emergency fever medicines in stock. Very courteous staff!"),
        (created_pharmacies[0].id, created_users["neha@gmail.com"].id, 4.8, "Fast pickup service. Reserved medicine via MedReach and got it in 2 mins."),
        (created_pharmacies[1].id, created_users["rohan@gmail.com"].id, 4.9, "Open 24/7. Verified inventory was 100% accurate."),
        (created_pharmacies[2].id, created_users["priya@gmail.com"].id, 4.7, "Great digital billing and transparent prices."),
        (created_pharmacies[3].id, created_users["vikram@gmail.com"].id, 4.6, "Very organized layout and prompt counter service.")
    ]

    for p_id, u_id, rating, comment in reviews_data:
        review = PharmacyReview(
            pharmacy_id=p_id,
            user_id=u_id,
            rating=rating,
            comment=comment,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
        )
        db.add(review)

    # 6. Seed Sample Reservations
    demo_patient = created_users["patient@medreach.ai"]
    res1 = Reservation(
        user_id=demo_patient.id,
        pharmacy_id=created_pharmacies[0].id,
        status="CONFIRMED",
        reservation_code="MR-82914",
        expires_at=datetime.utcnow() + timedelta(hours=1, minutes=45),
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db.add(res1)
    db.commit()
    db.refresh(res1)

    db.add(ReservationItem(
        reservation_id=res1.id,
        medicine_id=created_medicines[0].id,  # Paracetamol 650
        quantity=2,
        price=32.50
    ))

    # Add initial notification for demo patient
    db.add(Notification(
        user_id=demo_patient.id,
        title="Welcome to MedReach AI 👋",
        message="Search any medicine or upload your prescription to find verified nearby stock in seconds.",
        type="INFO",
        read=False,
        created_at=datetime.utcnow() - timedelta(minutes=30)
    ))
    db.add(Notification(
        user_id=demo_patient.id,
        title="Reservation Confirmed! 🎉",
        message="Your reservation MR-82914 for Paracetamol 650mg is confirmed at Sharma Medical. Ready for pickup!",
        type="SUCCESS",
        read=False,
        created_at=datetime.utcnow() - timedelta(minutes=14)
    ))

    db.commit()
    print("Database successfully seeded with realistic hackathon demo data!")

if __name__ == "__main__":
    seed_database()
