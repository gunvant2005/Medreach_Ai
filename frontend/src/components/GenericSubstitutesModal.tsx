"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Tag, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Medicine, MedicineSubstitute } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface GenericSubstitutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSelectSubstitute: (substitute: Medicine) => void;
}

export default function GenericSubstitutesModal({
  isOpen,
  onClose,
  medicine,
  onSelectSubstitute,
}: GenericSubstitutesModalProps) {
  const [substitutes, setSubstitutes] = useState<MedicineSubstitute[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (medicine && isOpen) {
      setLoading(true);
      api
        .getMedicineSubstitutes(medicine.id)
        .then((data) => setSubstitutes(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [medicine, isOpen]);

  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            Bioequivalent Generic Alternatives
          </span>
          <h3 className="text-xl font-bold text-white mt-2">
            Substitutes for {medicine.name}
          </h3>
          <p className="text-xs text-slate-400">
            Active Compound: <strong className="text-white">{medicine.generic_name}</strong> • {medicine.strength} ({medicine.dosage_form})
          </p>
        </div>

        {/* Pharmacist Verification Note */}
        <div className="my-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Pharmacist-Verified Bioequivalence:</strong> All alternatives contain identical active pharmaceutical ingredients (API) and molecular potency. Generic substitutes can reduce your medicine costs by up to 70%.
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
            <span className="text-xs">Finding bioequivalent formulations...</span>
          </div>
        ) : substitutes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No direct bioequivalent alternative listed for this formulation.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {substitutes.map((sub, idx) => {
              const med = sub.substitute_medicine;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl liquid-glass border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{med.name}</h4>
                      {sub.savings_percentage > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Save {sub.savings_percentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {med.generic_name} • {med.strength} ({med.dosage_form})
                    </p>
                    {med.manufacturer && (
                      <p className="text-[10px] text-slate-400">Mfr: {med.manufacturer}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSubstitute(med);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105"
                    >
                      <span>Select & Find Stock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
