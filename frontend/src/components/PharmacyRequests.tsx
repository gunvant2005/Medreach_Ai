"use client";

import React, { useState, useEffect } from "react";
import { Reservation, Pharmacy } from "@/types";
import { api } from "@/lib/api";
import { Check, X, Clock, User, Phone, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PharmacyRequestsProps {
  pharmacy: Pharmacy | null;
  onRefreshStats?: () => void;
}

export default function PharmacyRequests({ pharmacy, onRefreshStats }: PharmacyRequestsProps) {
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!pharmacy) return;
    setLoading(true);
    try {
      const data = await api.getPharmacyReservations(pharmacy.id);
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && Array.isArray((data as any).reservations)) {
        setRequests((data as any).reservations);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error(e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pharmacy]);

  const handleUpdateStatus = async (resId: number, newStatus: string) => {
    try {
      await api.updateReservationStatus(resId, newStatus);
      fetchRequests();
      if (onRefreshStats) onRefreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const pendingList = safeRequests.filter((r) => r.status === "PENDING");
  const confirmedList = safeRequests.filter((r) => r.status === "CONFIRMED");
  const pastList = safeRequests.filter((r) => !["PENDING", "CONFIRMED"].includes(r.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-white">Incoming Reservation Requests</h3>
          <p className="text-xs text-slate-400">Accept to hold inventory or complete upon patient counter pickup</p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2.5 rounded-2xl liquid-glass hover:bg-white/10 text-slate-300 flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. New Pending Requests */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Pending Actions ({pendingList.length})
          </span>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-6 rounded-2xl liquid-glass border border-white/5 text-center text-xs text-slate-400">
            No pending reservation requests right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-3xl liquid-glass-dark border border-amber-500/30 bg-amber-950/20 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Request Code
                    </span>
                    <div className="text-xl font-mono font-black text-white">
                      {res.reservation_code}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Awaiting Accept
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-white">
                    {res.items.map((it) => `${it.quantity}x ${it.medicine?.name || "Medicine"}`).join(", ")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Total Value: {formatCurrency(res.items.reduce((acc, it) => acc + it.price * it.quantity, 0))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(res.id, "CONFIRMED")}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25"
                  >
                    <Check className="w-4 h-4" /> Accept & Hold Stock
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(res.id, "REJECTED")}
                    className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Confirmed - Ready for Counter Pickup */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Ready for Pickup ({confirmedList.length})
          </span>
        </div>

        {confirmedList.length === 0 ? (
          <div className="p-6 rounded-2xl liquid-glass border border-white/5 text-center text-xs text-slate-400">
            No active reservations awaiting pickup.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedList.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-3xl liquid-glass border border-emerald-500/30 bg-emerald-950/20 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Pickup Code
                    </span>
                    <div className="text-xl font-mono font-black text-white">
                      {res.reservation_code}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Stock Reserved
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs text-slate-300">
                  <div className="font-semibold text-white">
                    {res.items.map((it) => `${it.quantity}x ${it.medicine?.name || "Medicine"}`).join(", ")}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hold expires at {new Date(res.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  onClick={() => handleUpdateStatus(res.id, "COMPLETED")}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Picked Up & Fulfilled
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
