"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Send,
  MessageSquare,
  Truck,
  Store,
  Navigation,
  ExternalLink,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { RankedPharmacy, Medicine, Reservation } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyData: RankedPharmacy | null;
  selectedMedicine: Medicine | null;
  onReservationCreated: (res: Reservation) => void;
}

export default function ReservationModal({
  isOpen,
  onClose,
  pharmacyData,
  selectedMedicine,
  onReservationCreated,
}: ReservationModalProps) {
  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("Flat 402, Green Valley Apts, Court Road, Jalgaon");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [whatsappData, setWhatsappData] = useState<{ message: string; whatsapp_url: string; sms_url: string } | null>(null);

  if (!isOpen || !pharmacyData) return null;

  const { pharmacy, available_units, unit_price, distance_km } = pharmacyData;
  const deliveryFee = fulfillmentType === "DELIVERY" ? 39 : 0;
  const subtotal = unit_price * quantity;
  const totalPrice = subtotal + deliveryFee;

  const handleConfirmReservation = async () => {
    if (!selectedMedicine) {
      setError("Please select a specific medicine to reserve.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createReservation(pharmacy.id, [
        { medicine_id: selectedMedicine.id, quantity }
      ]);
      setConfirmedReservation(res);
      onReservationCreated(res);

      // Fetch pre-formatted WhatsApp & SMS links
      try {
        const wa = await api.getReservationWhatsAppLink(res.id);
        setWhatsappData(wa);
      } catch {
        // fallback
        const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
        const msg = `🏥 MedReach AI Pickup Voucher\nCode: ${res.reservation_code}\nPharmacy: ${pharmacy.name}\nAddress: ${pharmacy.address}\nMedicine: ${quantity}x ${selectedMedicine.name}\nMaps: ${mapsLink}`;
        setWhatsappData({
          message: msg,
          whatsapp_url: `https://wa.me/?text=${encodeURIComponent(msg)}`,
          sms_url: `sms:?body=${encodeURIComponent(msg)}`,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create reservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedReservation ? (
          <div className="space-y-5">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30 uppercase">
                Lock Medicine Stock & Dispatch
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Reserve at {pharmacy.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#06d6a0]" />
                <span>{pharmacy.address}, {pharmacy.city} ({distance_km} km away)</span>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#f43f5e]/20 border border-[#f43f5e]/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Fulfillment Mode Toggle */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Select Fulfillment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType("PICKUP")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    fulfillmentType === "PICKUP"
                      ? "bg-[#06d6a0]/15 border-[#06d6a0] text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Store className="w-4 h-4 text-[#06d6a0]" />
                    <span>In-Store Hold</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">FREE • Ready in 5 min</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType("DELIVERY")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    fulfillmentType === "DELIVERY"
                      ? "bg-[#0ea5e9]/15 border-[#0ea5e9] text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Truck className="w-4 h-4 text-[#0ea5e9]" />
                    <span>Express Delivery</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">₹39 • 20-30 min arrival</div>
                </button>
              </div>
            </div>

            {/* Delivery Address Input if Delivery chosen */}
            {fulfillmentType === "DELIVERY" && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 animate-fade-in">
                <label className="text-[10px] uppercase font-bold text-slate-400">Delivery Street Address & Flat</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter full delivery address"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white input-glow focus:outline-none"
                />
                <div className="text-[10px] text-[#0ea5e9] flex items-center gap-1 pt-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Courier Partner: Shadowfax / Dunzo Express Delivery</span>
                </div>
              </div>
            )}

            {/* Medicine Summary Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm text-white">{selectedMedicine?.name || "Selected Medicine"}</div>
                  <div className="text-xs text-slate-400">{selectedMedicine?.generic_name} • {selectedMedicine?.strength}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatCurrency(unit_price)}</div>
                  <div className="text-[10px] text-slate-400">per strip/unit</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="text-xs font-semibold text-white">Quantity to Hold</span>
                <p className="text-[11px] text-slate-400">{available_units} units available at counter</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl liquid-glass border border-white/15 text-white font-bold flex items-center justify-center hover:bg-white/10"
                >
                  -
                </button>
                <span className="font-bold text-base text-white w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(available_units, quantity + 1))}
                  className="w-8 h-8 rounded-xl liquid-glass border border-white/15 text-white font-bold flex items-center justify-center hover:bg-white/10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price & Expiry Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Medicine Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {fulfillmentType === "DELIVERY" && (
                <div className="flex justify-between text-[#0ea5e9]">
                  <span>Express Courier Fee:</span>
                  <span>₹39.00</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-1">
                <span>Total Amount:</span>
                <span className="text-[#06d6a0]">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmReservation}
              className="w-full py-3.5 rounded-2xl btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#06d6a0]/25 transition-all"
            >
              {loading ? (
                "Locking Inventory..."
              ) : (
                <>
                  <span>{fulfillmentType === "DELIVERY" ? "Order Express Delivery" : "Confirm Stock Hold & Voucher"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-2 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-3xl bg-[#06d6a0]/20 border border-[#06d6a0]/40 flex items-center justify-center text-[#06d6a0] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#06d6a0] uppercase tracking-widest">
                {fulfillmentType === "DELIVERY" ? "Express Delivery Dispatched" : "Stock Held & Ready"}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {fulfillmentType === "DELIVERY" ? "Courier Out for Pickup" : "Pickup Voucher Generated"}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {fulfillmentType === "DELIVERY"
                  ? `Shadowfax rider assigned for delivery to ${deliveryAddress}.`
                  : `Present this pickup code at ${pharmacy.name} counter.`}
              </p>
            </div>

            {/* Pickup Code Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-[#06d6a0]/40 my-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Voucher Code</span>
              <div className="text-3xl font-mono font-black text-[#06d6a0] tracking-widest">
                {confirmedReservation.reservation_code}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#f59e0b]" />
                <span>Hold expires at {new Date(confirmedReservation.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Instant WhatsApp / SMS Sharing */}
            {whatsappData && (
              <div className="space-y-2 pt-2 border-t border-white/10 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Send Code & Google Maps to Phone:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappData.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Voucher</span>
                  </a>
                  <a
                    href={whatsappData.sms_url}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0ea5e9]" />
                    <span>Send SMS</span>
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              Done & View Active Holds
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
