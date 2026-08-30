"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  Navigation,
  AlertCircle,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink,
  Car,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { RankedPharmacy, Medicine } from "@/types";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";

interface PharmacyResultsProps {
  results: RankedPharmacy[];
  loading: boolean;
  selectedMedicine: Medicine | null;
  searchQuery: string;
  onReserve: (pharmacy: RankedPharmacy) => void;
  onViewOnMap: (pharmacy: RankedPharmacy) => void;
  onOpenSubstitutes?: (medicine: Medicine | null) => void;
  onAddToBasket?: (medicine: Medicine | null) => void;
}

export default function PharmacyResults({
  results,
  loading,
  selectedMedicine,
  searchQuery,
  onReserve,
  onViewOnMap,
  onOpenSubstitutes,
  onAddToBasket,
}: PharmacyResultsProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "IN_STOCK" | "OPEN_24_7" | "CLOSEST">("ALL");

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl liquid-glass border border-white/10 space-y-4"
          >
            <div className="flex justify-between">
              <div className="h-6 bg-white/5 rounded-xl w-1/3 shimmer" />
              <div className="h-6 bg-white/5 rounded-xl w-20 shimmer" />
            </div>
            <div className="h-4 bg-white/5 rounded-xl w-1/2 shimmer" />
            <div className="h-16 bg-white/5 rounded-xl w-full shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Filter application
  const safeResults = Array.isArray(results) ? results : [];
  const filteredResults = safeResults.filter((item) => {
    if (filterMode === "IN_STOCK") return item.available_units > 0;
    if (filterMode === "OPEN_24_7") {
      return (
        item.pharmacy.opening_time.includes("00:00") ||
        item.pharmacy.name.toLowerCase().includes("24/7") ||
        item.pharmacy.name.toLowerCase().includes("24x7")
      );
    }
    if (filterMode === "CLOSEST") return item.distance_km <= 1.5;
    return true;
  });

  if (filteredResults.length === 0) {
    return (
      <motion.div
        className="text-center py-16 px-4 rounded-3xl liquid-glass border border-white/10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-3xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-white">
          No matching pharmacies found
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
          Try switching filter filters to &quot;All Nearby&quot; or expanding search radius for alternative verified stock.
        </p>
        <button
          onClick={() => setFilterMode("ALL")}
          className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
        >
          Reset Filters
        </button>
      </motion.div>
    );
  }

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case "BEST MATCH":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#06d6a0] text-[#050a18] flex items-center gap-1 shadow-md shadow-[#06d6a0]/25 animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" /> BEST MATCH
          </span>
        );
      case "FASTEST AVAILABLE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f43f5e] text-white flex items-center gap-1 shadow-md shadow-[#f43f5e]/25">
            <Zap className="w-3.5 h-3.5 fill-current" /> FASTEST AVAILABLE
          </span>
        );
      case "HIGHEST TRUST":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold badge-glow-blue flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 96% TRUST SCORE
          </span>
        );
      case "BEST PRICE":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold badge-glow-purple flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> BEST PRICE
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300">
            VERIFIED PHARMACY
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Real-World Header & Quick Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-1">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Nearby Live Pharmacy Stock ({filteredResults.length})
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
              filterMode === "ALL"
                ? "bg-[#06d6a0] text-[#050a18]"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilterMode("IN_STOCK")}
            className={`px-3 py-1 rounded-full transition-all text-xs font-semibold flex items-center gap-1 ${
              filterMode === "IN_STOCK"
                ? "bg-[#06d6a0] text-[#050a18]"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0]" />
            In-Stock Only
          </button>
          <button
            onClick={() => setFilterMode("OPEN_24_7")}
            className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
              filterMode === "OPEN_24_7"
                ? "bg-[#06d6a0] text-[#050a18]"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            24/7 Open
          </button>
          <button
            onClick={() => setFilterMode("CLOSEST")}
            className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${
              filterMode === "CLOSEST"
                ? "bg-[#06d6a0] text-[#050a18]"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            Within 1.5 km
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredResults.map((item, idx) => {
          const {
            pharmacy,
            distance_km,
            available_units,
            unit_price,
            inventory_status,
            last_stock_update_minutes_ago,
            match_tag,
            match_reasons,
            trust_score,
          } = item;
          const isAvailable = available_units > 0;
          const is24_7 =
            pharmacy.opening_time.includes("00:00") ||
            pharmacy.name.toLowerCase().includes("24/7") ||
            pharmacy.name.toLowerCase().includes("24x7");

          // Estimate driving travel time
          const travelMinutes = Math.max(2, Math.round((distance_km / 25) * 60));

          return (
            <motion.div
              key={pharmacy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={`p-6 rounded-3xl liquid-glass border transition-all duration-300 hover:shadow-xl card-3d ${
                match_tag === "BEST MATCH"
                  ? "border-[#06d6a0]/30 hover:border-[#06d6a0]/50"
                  : match_tag === "FASTEST AVAILABLE"
                  ? "border-[#f43f5e]/30 hover:border-[#f43f5e]/50"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base sm:text-lg text-white">
                        {pharmacy.name}
                      </h4>
                      {pharmacy.verification_status === "VERIFIED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#06d6a0] bg-[#06d6a0]/10 px-2 py-0.5 rounded-full border border-[#06d6a0]/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#06d6a0]" />
                          Verified
                        </span>
                      )}
                      {is24_7 && (
                        <span className="text-[10px] font-bold text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-0.5 rounded-full border border-[#0ea5e9]/20">
                          24/7 Emergency Counter
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>
                        {pharmacy.address}, {pharmacy.city}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {getTagBadge(match_tag)}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#06d6a0]" />
                    {distance_km} km
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs text-slate-300 bg-white/5 border border-white/10 flex items-center gap-1">
                    <Car className="w-3 h-3 text-[#0ea5e9]" />
                    ~{travelMinutes} min
                  </span>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Live Stock Count
                  </span>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                    {isAvailable ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#06d6a0]" />
                        <span className="text-[#06d6a0]">
                          {available_units} units available
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                        <span className="text-[#f43f5e]">Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Inventory Sync
                  </span>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatTimeAgo(last_stock_update_minutes_ago)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Retail Price (MRP)
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {unit_price > 0
                      ? formatCurrency(unit_price)
                      : "Standard MRP"}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Pharmacy Reliability
                  </span>
                  <div className="text-sm font-bold text-[#06d6a0] mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{trust_score}% Verified Trust</span>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="flex flex-wrap items-center gap-2 pb-4">
                {match_reasons.map((reason, rIdx) => (
                  <span
                    key={rIdx}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 text-slate-300 border border-white/8 font-medium"
                  >
                    {reason}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#06d6a0]" />
                    <span>{pharmacy.phone}</span>
                  </a>

                  {/* Real-world Live Google Maps GPS link */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0ea5e9]" />
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onViewOnMap(item)}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300"
                  >
                    <span>In-App Map</span>
                  </button>

                  {onOpenSubstitutes && (
                    <button
                      type="button"
                      onClick={() => onOpenSubstitutes(selectedMedicine)}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#06d6a0]/10 hover:bg-[#06d6a0]/20 text-[#06d6a0] text-xs font-semibold flex items-center gap-1.5 border border-[#06d6a0]/20 transition-colors duration-300"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Cheaper Bioequivalent Generic</span>
                    </button>
                  )}
                  {onAddToBasket && isAvailable && (
                    <button
                      type="button"
                      onClick={() => onAddToBasket(selectedMedicine)}
                      className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/8 transition-colors duration-300"
                    >
                      <span>+ Prescription Basket</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onReserve(item)}
                  className="px-6 py-2.5 rounded-2xl btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#06d6a0]/20"
                >
                  <span>1-Click Hold Reservation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
