"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, PhoneCall, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function OfflineEmergencyBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed, ignore
      });
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-[#f43f5e] text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-lg z-50 animate-fade-in">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>
          <strong>Offline Emergency Mode</strong>: Network disconnected. Cached 24/7 emergency pharmacy hotlines active.
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <a
          href="tel:108"
          className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/40 font-bold flex items-center gap-1 transition-colors"
        >
          <PhoneCall className="w-3 h-3" /> Dial 108 (Ambulance)
        </a>
        <a
          href="tel:112"
          className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/40 font-bold flex items-center gap-1 transition-colors"
        >
          <PhoneCall className="w-3 h-3" /> Dial 112 (Emergency)
        </a>
      </div>
    </div>
  );
}
