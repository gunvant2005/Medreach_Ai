"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import MedicineSearch from "@/components/MedicineSearch";
import PharmacyResults from "@/components/PharmacyResults";
import PrescriptionUploadModal from "@/components/PrescriptionUploadModal";
import ReservationModal from "@/components/ReservationModal";
import ReservationTracker from "@/components/ReservationTracker";
import InteractiveMap from "@/components/InteractiveMap";
import GenericSubstitutesModal from "@/components/GenericSubstitutesModal";
import PrescriptionBasketView from "@/components/PrescriptionBasketView";
import LocationPicker, { LocationData } from "@/components/LocationPicker";
import AiAssistantWidget from "@/components/AiAssistantWidget";
import { motion } from "framer-motion";
import {
  Medicine,
  RankedPharmacy,
  PrescriptionItem,
  Reservation,
  BasketItem,
  BasketPharmacyFulfillment,
} from "@/types";
import { api } from "@/lib/api";
import {
  Map,
  Camera,
  Zap,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Layers,
  Flame,
  Heart,
  Activity,
  Wind,
  Sun,
  Shield,
} from "lucide-react";

const CATEGORY_ITEMS = [
  { name: "Fever & Pain", query: "Paracetamol", icon: Flame, color: "text-amber-400" },
  { name: "Emergency ORS", query: "ORS", icon: Zap, color: "text-rose-400" },
  { name: "Antibiotics", query: "Azithromycin", icon: Shield, color: "text-[#06d6a0]" },
  { name: "Diabetes & Insulin", query: "Metformin", icon: Activity, color: "text-[#0ea5e9]" },
  { name: "Cardiac & BP", query: "Telmisartan", icon: Heart, color: "text-[#a855f7]" },
  { name: "Respiratory & Asthma", query: "Salbutamol", icon: Wind, color: "text-teal-400" },
  { name: "Vitamins & Minerals", query: "Vitamin D3", icon: Sun, color: "text-yellow-400" },
];

export default function PatientPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData>({
    city: "Jalgaon Central",
    latitude: 21.0,
    longitude: 75.56,
    isGps: false,
  });

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("Paracetamol");
  const [urgentMode, setUrgentMode] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(15);

  const [pharmacyResults, setPharmacyResults] = useState<RankedPharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Multi-item Prescription Basket State
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSubstitutesOpen, setIsSubstitutesOpen] = useState(false);
  const [selectedPharmacyForReserve, setSelectedPharmacyForReserve] =
    useState<RankedPharmacy | null>(null);
  const [selectedPharmacyForMap, setSelectedPharmacyForMap] =
    useState<RankedPharmacy | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const fetchNearbyPharmacies = async (
    medId?: number,
    medName?: string,
    urgent: boolean = urgentMode
  ) => {
    setLoading(true);
    try {
      const data = await api.getNearbyPharmacies({
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        medicine_id: medId,
        medicine_name:
          medName || (selectedMedicine ? selectedMedicine.name : searchQuery),
        urgent_mode: urgent,
        quantity: 1,
      });
      setPharmacyResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPharmacyResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyPharmacies(selectedMedicine?.id, searchQuery, urgentMode);
  }, [urgentMode, radius, location]);

  const handleSelectMedicine = (med: Medicine | null, queryText?: string) => {
    setSelectedMedicine(med);
    const query = med ? med.name : queryText || "";
    setSearchQuery(query);
    fetchNearbyPharmacies(med?.id, query, urgentMode);
  };

  const handlePrescriptionConfirmed = (items: PrescriptionItem[]) => {
    if (items.length > 0) {
      const newBasket: BasketItem[] = items.map((it) => ({
        medicine_id: it.medicine_id || 1,
        medicine_name: it.normalized_name,
        generic_name: it.raw_name,
        strength: it.strength || "Standard",
        quantity: it.quantity || 1,
      }));
      setBasketItems(newBasket);

      const firstItem = items[0];
      setSearchQuery(firstItem.normalized_name);
      fetchNearbyPharmacies(
        firstItem.medicine_id,
        firstItem.normalized_name,
        urgentMode
      );
    }
  };

  const handleAddToBasket = (med: Medicine | null) => {
    if (!med) return;
    setBasketItems((prev) => {
      const exists = prev.find((b) => b.medicine_id === med.id);
      if (exists) {
        return prev.map((b) =>
          b.medicine_id === med.id ? { ...b, quantity: b.quantity + 1 } : b
        );
      }
      return [
        ...prev,
        {
          medicine_id: med.id,
          medicine_name: med.name,
          generic_name: med.generic_name,
          strength: med.strength,
          quantity: 1,
        },
      ];
    });
  };

  const handleRemoveBasketItem = (id: number) => {
    setBasketItems((prev) => prev.filter((b) => b.medicine_id !== id));
  };

  const handleUpdateBasketQty = (id: number, delta: number) => {
    setBasketItems((prev) =>
      prev
        .map((b) => {
          if (b.medicine_id === id) {
            const newQty = Math.max(1, b.quantity + delta);
            return { ...b, quantity: newQty };
          }
          return b;
        })
        .filter((b) => b.quantity > 0)
    );
  };

  const handleOpenReserve = (pharm: RankedPharmacy) => {
    setSelectedPharmacyForReserve(pharm);
    setIsReservationOpen(true);
  };

  const handleReserveBasketAtPharmacy = async (
    ful: BasketPharmacyFulfillment
  ) => {
    try {
      const itemsToBook = basketItems.map((b) => ({
        medicine_id: b.medicine_id,
        quantity: b.quantity,
      }));
      const res = await api.createReservation(ful.pharmacy.id, itemsToBook);
      setRefreshTrigger((prev) => prev + 1);
      setBasketItems([]);
      alert(
        `Success! Multi-medicine reservation placed with code: ${res.reservation_code}`
      );
    } catch (err: any) {
      alert(err.message || "Failed to create basket reservation");
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Patient Header & Location Picker */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#06d6a0] uppercase tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06d6a0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06d6a0]" />
              </span>
              Live Healthcare Network
            </span>
            <LocationPicker
              currentLocation={location}
              onLocationChange={setLocation}
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Find the medicine you need.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time pharmacy inventory routing, bioequivalent alternatives,
            and instant pickup reservations.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMapOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <Map className="w-4 h-4 text-[#0ea5e9]" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-2.5 rounded-2xl btn-primary text-xs flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>AI Prescription Scanner</span>
          </button>
        </div>
      </motion.div>

      {/* Active Reservations Tracker Banner */}
      <ReservationTracker refreshTrigger={refreshTrigger} />

      {/* Multi-Item Prescription Basket View */}
      <PrescriptionBasketView
        basketItems={basketItems}
        onRemoveItem={handleRemoveBasketItem}
        onUpdateQty={handleUpdateBasketQty}
        onClearBasket={() => setBasketItems([])}
        latitude={location.latitude}
        longitude={location.longitude}
        onReserveBasketAtPharmacy={handleReserveBasketAtPharmacy}
      />

      {/* Main Medicine Search Bar & Filter Options */}
      <motion.div
        className="p-6 sm:p-8 rounded-3xl liquid-glass-dark border border-white/10 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MedicineSearch
          onSelectMedicine={handleSelectMedicine}
          onOpenPrescriptionScanner={() => setIsScannerOpen(true)}
          urgentMode={urgentMode}
          onToggleUrgentMode={(val) => {
            setUrgentMode(val);
            fetchNearbyPharmacies(selectedMedicine?.id, searchQuery, val);
          }}
        />

        {/* Therapeutic Categories Carousel */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Browse by Therapeutic Category:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORY_ITEMS.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleSelectMedicine(null, cat.query)}
                  className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap group duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComp className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span className="font-medium">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search status & Radius Selector */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400">
            Showing nearby stock for:{" "}
            <strong className="text-white">
              &quot;{searchQuery || "All Formulations"}&quot;
            </strong>{" "}
            near{" "}
            <span className="text-[#06d6a0]">{location.city}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-white/5 text-white rounded-xl px-2.5 py-1 text-xs border border-white/10 focus:outline-none focus:border-[#06d6a0]/50"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km (Standard)</option>
              <option value={25}>25 km (Regional)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Smart Ranked Pharmacy Results */}
      <PharmacyResults
        results={pharmacyResults}
        loading={loading}
        selectedMedicine={selectedMedicine}
        searchQuery={searchQuery}
        onReserve={handleOpenReserve}
        onViewOnMap={(pharm) => {
          setSelectedPharmacyForMap(pharm);
          setIsMapOpen(true);
        }}
        onOpenSubstitutes={(med) => {
          setIsSubstitutesOpen(true);
        }}
        onAddToBasket={(med) => {
          if (med) {
            handleAddToBasket(med);
          } else if (pharmacyResults[0]) {
            handleAddToBasket({
              id: 1,
              name: searchQuery || "Paracetamol 650",
              generic_name: "Paracetamol",
              strength: "650mg",
              dosage_form: "Tablet",
              created_at: new Date().toISOString(),
            });
          }
        }}
      />

      {/* Modals */}
      <PrescriptionUploadModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onConfirmMedicines={handlePrescriptionConfirmed}
      />

      <GenericSubstitutesModal
        isOpen={isSubstitutesOpen}
        onClose={() => setIsSubstitutesOpen(false)}
        medicine={
          selectedMedicine || {
            id: 1,
            name: searchQuery || "Paracetamol 650",
            generic_name: "Paracetamol",
            strength: "650mg",
            dosage_form: "Tablet",
            created_at: new Date().toISOString(),
          }
        }
        onSelectSubstitute={(sub) => {
          setSelectedMedicine(sub);
          setSearchQuery(sub.name);
          fetchNearbyPharmacies(sub.id, sub.name, urgentMode);
        }}
      />

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        pharmacyData={selectedPharmacyForReserve}
        selectedMedicine={
          selectedMedicine ||
          (pharmacyResults[0]
            ? {
                id: 1,
                name: searchQuery || "Paracetamol 650",
                generic_name: "Paracetamol",
                strength: "650mg",
                dosage_form: "Tablet",
                created_at: new Date().toISOString(),
              }
            : null)
        }
        onReservationCreated={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <InteractiveMap
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        pharmacies={pharmacyResults}
        selectedPharmacy={selectedPharmacyForMap}
        onSelectPharmacy={(p) => setSelectedPharmacyForMap(p)}
        onReservePharmacy={handleOpenReserve}
      />

      <AiAssistantWidget onSearchQuery={(q) => handleSelectMedicine(null, q)} />
    </motion.div>
  );
}
