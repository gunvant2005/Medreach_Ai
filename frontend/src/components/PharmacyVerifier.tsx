"use client";

import React, { useState, useEffect } from "react";
import { Pharmacy } from "@/types";
import { api } from "@/lib/api";
import { ShieldCheck, ShieldAlert, Check, X, RefreshCw, MapPin } from "lucide-react";

export default function PharmacyVerifier() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPharmacies();
      setPharmacies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleToggleVerify = async (pharmacyId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "VERIFIED" ? "PENDING" : "VERIFIED";
    try {
      await api.toggleVerifyPharmacy(pharmacyId, nextStatus);
      fetchPharmacies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 rounded-3xl liquid-glass border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pharmacy Network Verification</span>
          </h4>
          <p className="text-xs text-slate-400">Review and verify licensed pharmacy partners</p>
        </div>
        <button
          onClick={fetchPharmacies}
          className="p-2 rounded-xl liquid-glass hover:bg-white/10 text-slate-300 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-slate-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Pharmacy</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pharmacies.map((pharm) => {
              const isVerified = pharm.verification_status === "VERIFIED";
              return (
                <tr key={pharm.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{pharm.name}</td>
                  <td className="px-4 py-3 text-slate-400">{pharm.city} ({pharm.address})</td>
                  <td className="px-4 py-3 font-mono text-[11px]">{pharm.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isVerified
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {pharm.verification_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleVerify(pharm.id, pharm.verification_status)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isVerified
                          ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm"
                      }`}
                    >
                      {isVerified ? "Revoke" : "Verify Pharmacy"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
