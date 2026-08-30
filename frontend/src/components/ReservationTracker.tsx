"use client";

import React, { useState, useEffect } from "react";
import { Reservation } from "@/types";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Phone,
  RefreshCw,
  Navigation,
  Printer,
  ExternalLink,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReservationTracker({ refreshTrigger }: { refreshTrigger?: number }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSlip, setActiveSlip] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReservations();
      if (Array.isArray(data)) {
        setReservations(data);
      } else if (data && Array.isArray((data as any).reservations)) {
        setReservations((data as any).reservations);
      } else {
        setReservations([]);
      }
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [refreshTrigger]);

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const activeList = safeReservations.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED");

  if (activeList.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold badge-glow-green flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Stock Held & Ready
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Awaiting Chemist Hold
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <motion.div
        className="w-full mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06d6a0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06d6a0]" />
            </span>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Active Stock Holds & Reservations ({activeList.length})
            </h3>
          </div>
          <button
            onClick={fetchReservations}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh Live
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {activeList.map((res, idx) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 rounded-3xl glass-glow space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Pharmacy Pickup Code
                    </span>
                    <div className="text-2xl font-mono font-black text-white tracking-wider flex items-center gap-2">
                      <span>{res.reservation_code}</span>
                      <button
                        onClick={() => setActiveSlip(res)}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                        title="Show Digital Slip & Barcode"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>{getStatusBadge(res.status)}</div>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="text-xs font-bold text-white">
                    {res.items.map((it) => `${it.quantity}x ${it.medicine?.name || "Medicine"}`).join(", ")}
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#06d6a0] flex-shrink-0" />
                    <span>{res.pharmacy?.name} — {res.pharmacy?.address}, {res.pharmacy?.city}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#f59e0b]" />
                    <span>Hold expires at {new Date(res.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* WhatsApp Share */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🏥 *MedReach AI Pickup Voucher*\nCode: *${res.reservation_code}*\nPharmacy: ${res.pharmacy?.name}\nAddress: ${res.pharmacy?.address}\nGoogle Maps: https://www.google.com/maps/dir/?api=1&destination=${res.pharmacy?.latitude},${res.pharmacy?.longitude}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-[11px] font-semibold flex items-center gap-1 border border-[#25D366]/30 transition-colors"
                      title="Share to WhatsApp"
                    >
                      <span>WhatsApp</span>
                    </a>
                    {res.pharmacy && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${res.pharmacy.latitude},${res.pharmacy.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold flex items-center gap-1 border border-white/10"
                      >
                        <Navigation className="w-3 h-3 text-[#0ea5e9]" />
                        <span>Navigate</span>
                      </a>
                    )}
                    {res.pharmacy?.phone && (
                      <a
                        href={`tel:${res.pharmacy.phone}`}
                        className="px-2.5 py-1 rounded-xl bg-[#06d6a0]/15 hover:bg-[#06d6a0]/25 text-[#06d6a0] text-[11px] font-semibold flex items-center gap-1 border border-[#06d6a0]/30"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => setActiveSlip(res)}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-white/10"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Digital Pickup Slip & Barcode Modal */}
      <AnimatePresence>
        {activeSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0a0f24] border border-white/20 p-6 space-y-5 shadow-2xl text-white"
            >
              {/* Slip Header */}
              <div className="text-center pb-4 border-b border-white/10 relative">
                <span className="text-[10px] uppercase font-bold text-[#06d6a0] tracking-widest">
                  MedReach AI • Digital Pickup Voucher
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  Medicine Hold Confirmation
                </h4>
                <p className="text-xs text-slate-400">Present this pickup code at the pharmacy counter</p>
              </div>

              {/* Big Pickup Code */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reservation Pickup Code</span>
                <div className="text-3xl font-mono font-black text-[#06d6a0] tracking-widest">
                  {activeSlip.reservation_code}
                </div>
                <div className="text-[11px] text-slate-400">
                  Status: <strong className="text-white">{activeSlip.status}</strong>
                </div>
              </div>

              {/* Pharmacy Info */}
              <div className="text-xs space-y-2 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Fulfilling Pharmacy</span>
                  <div className="font-bold text-white text-sm">{activeSlip.pharmacy?.name}</div>
                  <div className="text-slate-300 text-xs">{activeSlip.pharmacy?.address}, {activeSlip.pharmacy?.city}</div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Reserved Items</span>
                  <div className="space-y-1 mt-1">
                    {activeSlip.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-200">
                        <span>{it.quantity}x {it.medicine?.name || "Medicine"}</span>
                        <span className="font-mono">{formatCurrency(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hold Expires:</span>
                  <span className="font-bold text-[#f59e0b]">{new Date(activeSlip.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlip(null)}
                  className="px-6 py-2.5 rounded-2xl btn-primary text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
