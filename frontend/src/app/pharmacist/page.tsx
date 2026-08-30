"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Pharmacy, InventoryItem, Reservation } from "@/types";
import { api } from "@/lib/api";
import InventoryManager from "@/components/InventoryManager";
import PharmacyRequests from "@/components/PharmacyRequests";
import CounterScannerModal from "@/components/CounterScannerModal";
import CsvImportModal from "@/components/CsvImportModal";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  Inbox,
  CheckCircle2,
  Store,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Scan,
  UploadCloud,
  Download,
} from "lucide-react";

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const stepTime = Math.max(Math.floor((duration * 1000) / end), 20);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration * 50));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className="counter-value">{count}</span>;
}

export default function PharmacistPage() {
  const { user, switchDemoRole } = useAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [activeTab, setActiveTab] = useState<
    "inventory" | "requests" | "profile"
  >("inventory");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Quick stats
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      const pData = await api.getMyPharmacy();
      setPharmacy(pData);

      if (pData) {
        const inv = await api.getPharmacyInventory(pData.id);
        const safeInv = Array.isArray(inv) ? inv : [];
        setTotalMedicines(safeInv.length);
        setLowStockCount(
          safeInv.filter((i) => i.quantity > 0 && i.quantity < 10).length
        );

        const res = await api.getPharmacyReservations(pData.id);
        const safeRes = Array.isArray(res) ? res : [];
        setPendingRequestsCount(
          safeRes.filter((r) => r.status === "PENDING").length
        );
        setCompletedCount(
          safeRes.filter((r) => r.status === "COMPLETED").length
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "PHARMACIST" && user.role !== "ADMIN") {
      switchDemoRole("PHARMACIST").then(() => fetchPharmacyData());
    } else {
      fetchPharmacyData();
    }
  }, [user?.role]);

  const STATS = [
    {
      label: "Catalog Size",
      value: totalMedicines,
      sub: "Active Stock SKU Records",
      icon: Package,
      color: "#06d6a0",
      borderClass: "border-white/10",
      bgClass: "",
    },
    {
      label: "Low Stock Alerts",
      value: lowStockCount,
      sub: "Medicines below 10 units",
      icon: AlertTriangle,
      color: "#f59e0b",
      borderClass: "border-[#f59e0b]/20",
      bgClass: "bg-[#f59e0b]/5",
    },
    {
      label: "Pending Requests",
      value: pendingRequestsCount,
      sub: "Action required to hold stock",
      icon: Inbox,
      color: "#0ea5e9",
      borderClass: "border-[#0ea5e9]/20",
      bgClass: "bg-[#0ea5e9]/5",
    },
    {
      label: "Completed Pickups",
      value: completedCount,
      sub: "100% stock fulfillment rate",
      icon: CheckCircle2,
      color: "#06d6a0",
      borderClass: "border-[#06d6a0]/20",
      bgClass: "bg-[#06d6a0]/5",
    },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Pharmacist Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <div className="text-xs font-semibold text-[#06d6a0] uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Pharmacist Control Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            {pharmacy?.name || "Sharma Medical & Chemist"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>
              {pharmacy?.address}, {pharmacy?.city}
            </span>
            {pharmacy?.verification_status === "VERIFIED" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold badge-glow-green flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Network Store
              </span>
            )}
          </p>
        </div>

        {/* POS Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 rounded-2xl btn-primary text-xs flex items-center gap-1.5"
          >
            <Scan className="w-4 h-4" />
            <span>Counter QR Scanner</span>
          </button>

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
          >
            <UploadCloud className="w-4 h-4 text-[#0ea5e9]" />
            <span>POS CSV Import</span>
          </button>

          {pharmacy && (
            <a
              href={api.exportInventoryCsvUrl(pharmacy.id)}
              download
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
            >
              <Download className="w-4 h-4 text-[#06d6a0]" />
              <span>Export CSV</span>
            </a>
          )}

          <button
            onClick={fetchPharmacyData}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs transition-all duration-300"
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`p-5 rounded-3xl liquid-glass border ${stat.borderClass} ${stat.bgClass} space-y-2 card-3d`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {stat.label}
                </span>
                <IconComp
                  className="w-4 h-4"
                  style={{ color: stat.color }}
                />
              </div>
              <div
                className="text-2xl font-black"
                style={{ color: stat.color }}
              >
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[11px] text-slate-500">{stat.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/10 w-fit">
        {[
          { key: "inventory", label: "Inventory Management" },
          { key: "requests", label: "Reservation Queue", badge: pendingRequestsCount },
          { key: "profile", label: "Store Settings" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`relative px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "text-[#050a18]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="pharmacist-tab-bg"
                className="absolute inset-0 rounded-xl bg-[#06d6a0] shadow-md shadow-[#06d6a0]/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="relative z-10 px-1.5 py-0.2 rounded-full text-[10px] bg-[#f59e0b] text-[#050a18] font-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && (
        <InventoryManager pharmacy={pharmacy} onRefreshStats={fetchPharmacyData} />
      )}

      {activeTab === "requests" && (
        <PharmacyRequests pharmacy={pharmacy} onRefreshStats={fetchPharmacyData} />
      )}

      {activeTab === "profile" && pharmacy && (
        <motion.div
          className="p-8 rounded-3xl liquid-glass-dark border border-white/10 space-y-6 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-bold text-white">
            Pharmacy Configuration
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px]">
                Pharmacy Name
              </span>
              <div className="text-sm font-bold text-white mt-0.5">
                {pharmacy.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">
                  Phone Number
                </span>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {pharmacy.phone}
                </div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">
                  Verification Status
                </span>
                <div className="text-sm font-semibold text-[#06d6a0] mt-0.5">
                  {pharmacy.verification_status}
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px]">
                Store Address
              </span>
              <div className="text-sm text-slate-200 mt-0.5">
                {pharmacy.address}, {pharmacy.city}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">
                  Operating Hours
                </span>
                <div className="text-sm text-white mt-0.5">
                  {pharmacy.opening_time} - {pharmacy.closing_time}
                </div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[10px]">
                  GPS Coordinates
                </span>
                <div className="text-sm font-mono text-slate-300 mt-0.5">
                  {pharmacy.latitude}, {pharmacy.longitude}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <CounterScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onFulfilled={fetchPharmacyData}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        pharmacy={pharmacy}
        onSuccess={fetchPharmacyData}
      />
    </motion.div>
  );
}
