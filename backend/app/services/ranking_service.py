import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Pharmacy, Inventory, Medicine, PharmacyReview, Reservation

class RankingService:
    EARTH_RADIUS_KM = 6371.0

    @classmethod
    def calculate_haversine_distance(
        cls,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Computes great-circle distance between two GPS coordinates using Haversine formula.
        """
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(cls.EARTH_RADIUS_KM * c, 2)

    @classmethod
    def calculate_freshness_score(cls, last_updated: Optional[datetime]) -> tuple[float, int]:
        """
        Calculates freshness score (0-100) and minutes elapsed since last stock update.
        """
        if not last_updated:
            return 40.0, 1440

        now = datetime.utcnow()
        elapsed_seconds = (now - last_updated).total_seconds()
        elapsed_minutes = max(1, int(elapsed_seconds / 60))

        if elapsed_minutes <= 15:
            score = 100.0
        elif elapsed_minutes <= 60:
            score = 90.0
        elif elapsed_minutes <= 180:
            score = 75.0
        elif elapsed_minutes <= 720:
            score = 60.0
        elif elapsed_minutes <= 1440:
            score = 45.0
        else:
            score = 25.0

        return score, elapsed_minutes

    @classmethod
    def calculate_trust_score(cls, pharmacy: Pharmacy, db: Session) -> int:
        """
        Calculates reliability/trust score (0-100) based on verification, reviews, and completed orders.
        """
        base_score = 70 if pharmacy.verification_status == "VERIFIED" else 40

        # Review ratings bonus
        reviews = db.query(PharmacyReview).filter(PharmacyReview.pharmacy_id == pharmacy.id).all()
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            review_bonus = (avg_rating / 5.0) * 20
        else:
            review_bonus = 15

        # Completed reservations bonus
        completed_count = db.query(Reservation).filter(
            Reservation.pharmacy_id == pharmacy.id,
            Reservation.status == "COMPLETED"
        ).count()
        reservation_bonus = min(10, completed_count * 2)

        total_trust = int(min(99, base_score + review_bonus + reservation_bonus))
        return max(50, total_trust)

    @classmethod
    def rank_pharmacies(
        cls,
        user_lat: float,
        user_lon: float,
        medicine_id: Optional[int] = None,
        medicine_name: Optional[str] = None,
        radius_km: float = 15.0,
        urgent_mode: bool = False,
        required_quantity: int = 1,
        db: Session = None
    ) -> List[Dict[str, Any]]:
        """
        Finds nearby pharmacies within radius, calculates multi-factor ranking scores,
        and provides transparent reason tags.
        """
        pharmacies = db.query(Pharmacy).all()
        results = []

        # Find target medicine if only name provided
        target_med_id = medicine_id
        if not target_med_id and medicine_name:
            med = db.query(Medicine).filter(
                (Medicine.name.ilike(f"%{medicine_name}%")) |
                (Medicine.generic_name.ilike(f"%{medicine_name}%"))
            ).first()
            if med:
                target_med_id = med.id

        for pharmacy in pharmacies:
            distance = cls.calculate_haversine_distance(
                user_lat, user_lon, pharmacy.latitude, pharmacy.longitude
            )
            if distance > radius_km:
                continue

            # Fetch inventory for medicine
            inventory_item = None
            if target_med_id:
                inventory_item = db.query(Inventory).filter(
                    Inventory.pharmacy_id == pharmacy.id,
                    Inventory.medicine_id == target_med_id
                ).first()

            available_units = inventory_item.quantity if inventory_item else 0
            unit_price = inventory_item.price if inventory_item else 0.0
            last_updated = inventory_item.last_updated if inventory_item else pharmacy.created_at

            # Component scores (0 - 100)
            # 1. Availability Score (40%)
            if available_units >= required_quantity:
                availability_score = 100.0
                status_str = "AVAILABLE"
            elif available_units > 0:
                availability_score = (available_units / max(1, required_quantity)) * 70.0
                status_str = "LOW_STOCK"
            else:
                availability_score = 0.0
                status_str = "OUT_OF_STOCK"

            # 2. Distance Score (25%)
            distance_score = max(0.0, 100.0 - (distance / max(1.0, radius_km)) * 100.0)

            # 3. Freshness Score (20%)
            freshness_score, minutes_ago = cls.calculate_freshness_score(last_updated)

            # 4. Reliability Score (15%)
            trust_score = cls.calculate_trust_score(pharmacy, db)
            reliability_score = float(trust_score)

            # Calculate Final Score
            if urgent_mode:
                # Urgent mode heavily weights availability + proximity + open status
                final_score = (
                    0.50 * availability_score +
                    0.35 * distance_score +
                    0.10 * freshness_score +
                    0.05 * reliability_score
                )
            else:
                final_score = (
                    0.40 * availability_score +
                    0.25 * distance_score +
                    0.20 * freshness_score +
                    0.15 * reliability_score
                )

            # Rationale match reasons
            reasons = []
            if available_units >= required_quantity:
                reasons.append(f"✓ {available_units} units in stock")
            elif available_units > 0:
                reasons.append(f"⚠ Low stock: {available_units} units left")
            else:
                reasons.append("✕ Currently out of stock")

            if distance < 1.5:
                reasons.append(f"✓ Super close ({distance} km away)")
            elif distance < 5.0:
                reasons.append(f"✓ Close to your location ({distance} km)")
            else:
                reasons.append(f"• {distance} km away")

            if minutes_ago <= 15:
                reasons.append("✓ Stock verified recently (< 15 mins)")
            elif minutes_ago <= 60:
                reasons.append(f"✓ Stock updated {minutes_ago} mins ago")
            else:
                reasons.append(f"• Stock updated {int(minutes_ago / 60)}h ago")

            if trust_score >= 85:
                reasons.append(f"✓ Highly trusted pharmacy ({trust_score}% reliability)")

            # Assign best match tags
            match_tag = "MATCH"
            if urgent_mode and available_units > 0 and distance <= 2.0:
                match_tag = "FASTEST AVAILABLE"
            elif final_score >= 80 and available_units > 0:
                match_tag = "BEST MATCH"
            elif trust_score >= 90:
                match_tag = "HIGHEST TRUST"
            elif unit_price > 0 and unit_price < 50:
                match_tag = "BEST PRICE"

            results.append({
                "pharmacy": pharmacy,
                "distance_km": distance,
                "available_units": available_units,
                "unit_price": unit_price,
                "inventory_status": status_str,
                "last_stock_update_minutes_ago": minutes_ago,
                "trust_score": trust_score,
                "final_score": round(final_score, 1),
                "match_tag": match_tag,
                "match_reasons": reasons,
                "is_open": True
            })

        # Sort by final score descending (or distance if equal)
        results.sort(key=lambda x: (x["final_score"], -x["distance_km"]), reverse=True)
        return results

ranking_service = RankingService()
