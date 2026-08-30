export type UserRole = "PATIENT" | "PHARMACIST" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  manufacturer?: string;
  created_at: string;
}

export interface MedicineSubstitute {
  original_medicine: Medicine;
  substitute_medicine: Medicine;
  savings_percentage: number;
  price_difference: number;
  is_generic: boolean;
  safety_disclaimer: string;
}

export interface InventoryItem {
  id: number;
  pharmacy_id: number;
  medicine_id: number;
  quantity: number;
  price: number;
  batch_number?: string;
  expiry_date?: string;
  last_updated: string;
  status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  medicine?: Medicine;
}

export interface Pharmacy {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  verification_status: "VERIFIED" | "PENDING" | "REJECTED";
  opening_time: string;
  closing_time: string;
  created_at: string;
  inventory_items?: InventoryItem[];
}

export interface RankedPharmacy {
  pharmacy: Pharmacy;
  distance_km: number;
  available_units: number;
  unit_price: number;
  inventory_status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
  last_stock_update_minutes_ago: number;
  trust_score: number;
  final_score: number;
  match_tag: string;
  match_reasons: string[];
  is_open: boolean;
}

export interface BasketItem {
  medicine_id: number;
  medicine_name: string;
  generic_name: string;
  strength: string;
  quantity: number;
}

export interface BasketPharmacyFulfillment {
  pharmacy: Pharmacy;
  distance_km: number;
  is_full_match: boolean;
  matched_items_count: number;
  total_items_count: number;
  total_basket_price: number;
  trust_score: number;
  final_score: number;
  item_availability: Array<{
    medicine_id: number;
    medicine_name: string;
    generic_name: string;
    requested_quantity: number;
    available_quantity: number;
    unit_price: number;
    in_stock: boolean;
  }>;
}

export interface PrescriptionItem {
  id?: number;
  prescription_id?: number;
  medicine_id?: number;
  raw_name: string;
  normalized_name: string;
  strength?: string;
  quantity: number;
  confidence_score: number;
  verification_status?: "PENDING" | "CONFIRMED" | "EDITED";
  medicine?: Medicine;
}

export interface Prescription {
  id: number;
  user_id: number;
  image_path: string;
  ocr_text?: string;
  status: "UPLOADED" | "PROCESSED" | "CONFIRMED" | "REJECTED";
  created_at: string;
  items: PrescriptionItem[];
}

export interface ReservationItem {
  id?: number;
  medicine_id: number;
  quantity: number;
  price: number;
  medicine?: Medicine;
}

export interface Reservation {
  id: number;
  user_id: number;
  pharmacy_id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "EXPIRED";
  reservation_code: string;
  expires_at: string;
  created_at: string;
  pharmacy?: Pharmacy;
  items: ReservationItem[];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "RESERVATION" | "SHORTAGE";
  read: boolean;
  created_at: string;
}

export interface ShortageAlert {
  medicine_id: number;
  medicine_name: string;
  generic_name: string;
  area: string;
  shortage_risk: "LOW" | "MEDIUM" | "HIGH";
  risk_score: number;
  demand_growth_pct: number;
  inventory_drop_pct: number;
  search_volume: number;
  available_stock: number;
  reason: string;
  recommendation: string;
}

export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_pharmacies: number;
  verified_pharmacies: number;
  total_medicines: number;
  active_reservations: number;
  total_reservations: number;
  low_stock_alerts_count: number;
  shortage_alerts: ShortageAlert[];
  demand_trends: Array<{ name: string; [key: string]: string | number }>;
  pharmacy_activity: Array<{ name: string; reservations: number; fulfilled: number; stock: number }>;
  area_availability: Array<{ area: string; available: number; shortage_risk: string; score: number }>;
}
