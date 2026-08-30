import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="PATIENT")  # PATIENT, PHARMACIST, ADMIN
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    pharmacies = relationship("Pharmacy", back_populates="owner")
    prescriptions = relationship("Prescription", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("PharmacyReview", back_populates="user")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    verification_status = Column(String(50), default="VERIFIED")  # PENDING, VERIFIED, REJECTED
    opening_time = Column(String(20), default="08:00 AM")
    closing_time = Column(String(20), default="10:00 PM")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="pharmacies")
    inventory_items = relationship("Inventory", back_populates="pharmacy", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="pharmacy")
    reviews = relationship("PharmacyReview", back_populates="pharmacy")
    events = relationship("InventoryEvent", back_populates="pharmacy")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    generic_name = Column(String(255), index=True, nullable=False)
    strength = Column(String(100), nullable=False)
    dosage_form = Column(String(100), nullable=False)  # Tablet, Syrup, Injection, Capsule, Drops, Inhaler, Sachet
    manufacturer = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    inventory_entries = relationship("Inventory", back_populates="medicine")
    reservation_items = relationship("ReservationItem", back_populates="medicine")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    batch_number = Column(String(100), nullable=True, default="BATCH-2026")
    expiry_date = Column(String(50), nullable=True, default="2027-12")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    status = Column(String(50), default="AVAILABLE")  # AVAILABLE, LOW_STOCK, OUT_OF_STOCK

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="inventory_items")
    medicine = relationship("Medicine", back_populates="inventory_entries")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    ocr_text = Column(Text, nullable=True)
    status = Column(String(50), default="PROCESSED")  # UPLOADED, PROCESSED, CONFIRMED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=True)
    raw_name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False)
    strength = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1)
    confidence_score = Column(Float, default=0.95)
    verification_status = Column(String(50), default="PENDING")  # PENDING, CONFIRMED, EDITED

    # Relationships
    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)
    status = Column(String(50), default="PENDING")  # PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED, EXPIRED
    reservation_code = Column(String(50), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reservations")
    pharmacy = relationship("Pharmacy", back_populates="reservations")
    items = relationship("ReservationItem", back_populates="reservation", cascade="all, delete-orphan")


class ReservationItem(Base):
    __tablename__ = "reservation_items"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, default=0.0, nullable=False)

    # Relationships
    reservation = relationship("Reservation", back_populates="items")
    medicine = relationship("Medicine", back_populates="reservation_items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO")  # INFO, SUCCESS, WARNING, RESERVATION, SHORTAGE
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class PharmacyReview(Base):
    __tablename__ = "pharmacy_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
    pharmacy = relationship("Pharmacy", back_populates="reviews")


class InventoryEvent(Base):
    __tablename__ = "inventory_events"

    id = Column(Integer, primary_key=True, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    old_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)  # RESTOCK, RESERVATION_HOLD, SALE, ADJUSTMENT
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    pharmacy = relationship("Pharmacy", back_populates="events")
    medicine = relationship("Medicine")
