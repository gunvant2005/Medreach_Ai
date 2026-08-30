"use client";

import React, { useState } from "react";
import { X, MapPin, Navigation, Phone, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { RankedPharmacy } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface InteractiveMapProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacies: RankedPharmacy[];
  selectedPharmacy: RankedPharmacy | null;
  onSelectPharmacy: (p: RankedPharmacy) => void;
  onReservePharmacy: (p: RankedPharmacy) => void;
}

export default function InteractiveMap({
  isOpen,
  onClose,
  pharmacies,
  selectedPharmacy,
  onSelectPharmacy,
  onReservePharmacy,
}: InteractiveMapProps) {
  const [activePin, setActivePin] = useState<RankedPharmacy | null>(selectedPharmacy || pharmacies[0] || null);

  if (!isOpen) return null;

  // Coordinate normalizer for mock SVG map projection
  const userLat = 21.0000;
  const userLon = 75.5600;

  const projectCoord = (lat: number, lon: number) => {
    const dLat = (lat - userLat) * 3500;
    const dLon = (lon - userLon) * 3500;
    const x = 300 + dLon;
    const y = 200 - dLat;
    return { x: Math.max(40, Math.min(560, x)), y: Math.max(40, Math.min(360, y)) };
  };

  const userPos = { x: 300, y: 200 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 overflow-hidden flex flex-col md:flex-row gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Map Canvas Area */}
        <div className="flex-1 relative rounded-2xl bg-slate-950 border border-white/15 overflow-hidden min-h-[350px] md:min-h-[450px]">
          {/* Map Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Interactive SVG Layer */}
          <svg className="w-full h-full absolute inset-0">
            {/* Range Rings */}
            <circle cx={userPos.x} cy={userPos.y} r={70} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="4" />
            <circle cx={userPos.x} cy={userPos.y} r={140} fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="4" />

            {/* Connection Lines to Pins */}
            {pharmacies.map((p) => {
              const pos = projectCoord(p.pharmacy.latitude, p.pharmacy.longitude);
              return (
                <line
                  key={`line-${p.pharmacy.id}`}
                  x1={userPos.x}
                  y1={userPos.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={p.match_tag === "BEST MATCH" ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"}
                  strokeWidth="1.2"
                  strokeDasharray="2"
                />
              );
            })}

            {/* User Location Pulse Pin */}
            <g transform={`translate(${userPos.x}, ${userPos.y})`}>
              <circle r={18} fill="rgba(56, 189, 248, 0.2)" className="animate-ping" />
              <circle r={8} fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <text y={-14} fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                You (Current Location)
              </text>
            </g>

            {/* Pharmacy Pins */}
            {pharmacies.map((p) => {
              const pos = projectCoord(p.pharmacy.latitude, p.pharmacy.longitude);
              const isSelected = activePin?.pharmacy.id === p.pharmacy.id;
              const isAvail = p.available_units > 0;

              return (
                <g
                  key={p.pharmacy.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setActivePin(p)}
                >
                  <circle
                    r={isSelected ? 14 : 10}
                    fill={isAvail ? "#10b981" : "#f43f5e"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "3" : "1.5"}
                    className={isSelected ? "animate-bounce" : ""}
                  />
                  <text y={-12} fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {p.pharmacy.name.split(" ")[0]} ({p.distance_km}km)
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] text-slate-300 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> In Stock
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> You
            </span>
          </div>
        </div>

        {/* Selected Pharmacy Drawer Card */}
        {activePin && (
          <div className="w-full md:w-80 flex flex-col justify-between p-5 rounded-2xl liquid-glass border border-white/15 bg-white/5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {activePin.match_tag}
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {activePin.distance_km} km
                </span>
              </div>

              <h4 className="font-bold text-base text-white mt-2">{activePin.pharmacy.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{activePin.pharmacy.address}</p>

              <div className="mt-4 p-3 rounded-xl bg-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Stock Status:</span>
                  <span className="font-bold text-emerald-400">{activePin.available_units} units available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="font-bold text-white">{formatCurrency(activePin.unit_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trust Score:</span>
                  <span className="font-bold text-sky-400">{activePin.trust_score}% Reliability</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={activePin.available_units <= 0}
                onClick={() => {
                  onReservePharmacy(activePin);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <span>Reserve at This Pharmacy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={`tel:${activePin.pharmacy.phone}`}
                className="w-full py-2.5 rounded-xl liquid-glass hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call {activePin.pharmacy.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
