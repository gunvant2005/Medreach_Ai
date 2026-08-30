"use client";

import React, { useState } from "react";
import { X, QrCode, Scan, CheckCircle2, AlertTriangle, ArrowRight, Clock, User, Phone, Check } from "lucide-react";
import { Reservation } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface CounterScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFulfilled: () => void;
}

export default function CounterScannerModal({
  isOpen,
  onClose,
  onFulfilled,
}: CounterScannerModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [fulfillSuccess, setFulfillSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setReservation(null);
    setFulfillSuccess(false);

    try {
      const res = await api.verifyReservationCode(code.trim());
      setReservation(res);
    } catch (err: any) {
      setError(err.message || "Reservation code not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!reservation) return;
    setLoading(true);
    try {
      await api.fulfillReservationCode(reservation.reservation_code);
      setFulfillSuccess(true);
      onFulfilled();
    } catch (err: any) {
      setError(err.message || "Failed to fulfill reservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Counter QR & Code Verification</h3>
          </div>
          <p className="text-xs text-slate-400">
            Scan barcode or enter the patient&apos;s pickup code (e.g. MR-82914) to verify and dispense stock.
          </p>
        </div>

        {/* Search / Scan Form */}
        <form onSubmit={handleVerify} className="mt-4 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Code (e.g. MR-82914)"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-white/20 text-white font-mono text-base tracking-wider focus:outline-none focus:border-emerald-400 uppercase placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25"
          >
            <Scan className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </form>

        {error && (
          <div className="p-3 my-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Verified Result Card */}
        {reservation && (
          <div className="mt-4 p-5 rounded-2xl liquid-glass border border-emerald-500/40 bg-emerald-950/20 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Verified Reservation</span>
                <div className="text-2xl font-mono font-black text-white">{reservation.reservation_code}</div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                reservation.status === "COMPLETED"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {reservation.status}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 text-xs space-y-1.5 text-slate-300">
              <div className="font-semibold text-white">Prescribed Items to Handover:</div>
              <div className="space-y-1">
                {reservation.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                    <span>{it.quantity}x {it.medicine?.name || "Medicine"}</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {!fulfillSuccess && reservation.status !== "COMPLETED" ? (
              <button
                onClick={handleDispense}
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>1-Click Dispense & Mark Fulfilled</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dispensed & Inventory Automatically Adjusted!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
