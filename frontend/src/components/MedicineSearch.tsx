"use client";

import React, { useState, useEffect } from "react";
import { Search, Sparkles, Zap, Camera, Clock, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Medicine } from "@/types";
import { api } from "@/lib/api";

interface MedicineSearchProps {
  onSelectMedicine: (med: Medicine | null, queryText?: string) => void;
  onOpenPrescriptionScanner: () => void;
  urgentMode: boolean;
  onToggleUrgentMode: (val: boolean) => void;
}

const QUICK_TAGS = [
  "Paracetamol 650",
  "ORS Electral",
  "Azithromycin 500",
  "Insulin Glargine",
  "Amoxicillin 500",
  "Montelukast",
  "Pan-D"
];

export default function MedicineSearch({
  onSelectMedicine,
  onOpenPrescriptionScanner,
  urgentMode,
  onToggleUrgentMode,
}: MedicineSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const results = await api.searchMedicines(query);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [query]);

  const handleSelect = (med: Medicine) => {
    setQuery(med.name);
    setShowDropdown(false);
    onSelectMedicine(med);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (suggestions.length > 0) {
      onSelectMedicine(suggestions[0]);
    } else {
      onSelectMedicine(null, query);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSelectMedicine(null, tag);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar Container */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-slate-500">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search medicine (e.g. Paracetamol 650, ORS, Dolo, Insulin)..."
            className="w-full pl-12 pr-36 py-4 rounded-2xl bg-white/5 text-white placeholder-slate-500 text-sm md:text-base border border-white/10 input-glow transition-all shadow-lg"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setShowDropdown(false);
                  onSelectMedicine(null, "");
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenPrescriptionScanner}
              className="px-3 py-2 rounded-xl bg-[#06d6a0]/15 hover:bg-[#06d6a0]/25 border border-[#06d6a0]/30 text-[#06d6a0] text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 duration-300"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">AI Prescription</span>
            </button>
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 w-full rounded-2xl liquid-glass-dark border border-white/15 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
                Matching Medicines ({suggestions.length})
              </div>
              {suggestions.map((med, idx) => (
                <motion.button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelect(med)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-sm text-white group-hover:text-[#06d6a0] transition-colors">
                      {med.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {med.generic_name} • {med.strength} ({med.dosage_form})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 font-medium">
                      {med.dosage_form}
                    </span>
                    {med.manufacturer && (
                      <div className="text-[10px] text-slate-500 mt-1">{med.manufacturer}</div>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mode Toggles & Quick Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#06d6a0]" /> Popular:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 text-slate-300 hover:text-white transition-all text-xs whitespace-nowrap hover:border-[#06d6a0]/30 duration-300"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Urgent Medicine Priority Toggle */}
        <button
          type="button"
          onClick={() => onToggleUrgentMode(!urgentMode)}
          className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all font-semibold shadow-md duration-300 ${
            urgentMode
              ? "bg-[#f43f5e] text-white border border-[#f43f5e] shadow-[#f43f5e]/30 animate-pulse"
              : "bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-[#f43f5e]/30"
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${urgentMode ? "text-amber-300 fill-amber-300" : "text-slate-400"}`} />
          <span>{urgentMode ? "Urgent Mode: ON" : "Urgent Mode"}</span>
        </button>
      </div>
    </div>
  );
}
