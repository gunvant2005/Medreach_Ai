"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Check, ChevronDown, Compass } from "lucide-react";

export interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
  isGps: boolean;
}

const PRESET_CITIES: Array<{ city: string; lat: number; lon: number; state: string }> = [
  { city: "Jalgaon Central", lat: 21.0000, lon: 75.5600, state: "Maharashtra" },
  { city: "Mumbai Metro", lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
  { city: "Pune City", lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  { city: "Delhi NCR", lat: 28.6139, lon: 77.2090, state: "Delhi" },
  { city: "Bengaluru Tech Hub", lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  { city: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana" },
  { city: "Chennai", lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  { city: "Kolkata", lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  { city: "Ahmedabad", lat: 23.0225, lon: 72.5714, state: "Gujarat" },
];

interface LocationPickerProps {
  currentLocation: LocationData;
  onLocationChange: (loc: LocationData) => void;
}

export default function LocationPicker({
  currentLocation,
  onLocationChange,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({
          city: "My GPS Location",
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          isGps: true,
        });
        setGpsLoading(false);
        setOpen(false);
      },
      (err) => {
        console.warn("GPS error, using Jalgaon demo hub:", err);
        setGpsLoading(false);
        alert("GPS permission was denied or unavailable. Using selected city coordinates.");
      },
      { timeout: 8000 }
    );
  };

  const handleSelectCity = (cityData: { city: string; lat: number; lon: number }) => {
    onLocationChange({
      city: cityData.city,
      latitude: cityData.lat,
      longitude: cityData.lon,
      isGps: false,
    });
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3.5 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 border border-white/15 transition-all"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>{currentLocation.city}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 mt-2 w-72 rounded-2xl liquid-glass-dark border border-white/20 shadow-2xl p-3 z-50 animate-fade-in">
          {/* GPS Quick Action */}
          <button
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="w-full p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 mb-2 transition-all"
          >
            <Compass className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
            <span>{gpsLoading ? "Detecting GPS..." : "Use My Device GPS Location"}</span>
          </button>

          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
            Select Medical Region
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {PRESET_CITIES.map((c, idx) => {
              const isSelected = currentLocation.city === c.city;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectCity(c)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div>
                    <div className="font-medium">{c.city}</div>
                    <div className={`text-[10px] ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                      {c.state} • {c.lat}, {c.lon}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
