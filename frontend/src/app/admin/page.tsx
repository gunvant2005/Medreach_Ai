"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AdminStats } from "@/types";
import { api } from "@/lib/api";
import ShortageAnalyticsView from "@/components/ShortageAnalyticsView";
import PharmacyVerifier from "@/components/PharmacyVerifier";
import { motion } from "framer-motion";
import {
  Users,
  Store,
  Pill,
  CalendarCheck,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  ShieldCheck,
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

export default function AdminPage() {
  const { user, switchDemoRole } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      switchDemoRole("ADMIN").then(() => fetchStats());
    } else {
      fetchStats();
    }
  }, [user?.role]);

  const handleTriggerReSeed = async () => {
    if (
      !confirm(
        "Reset and re-seed all demo data for evaluation?"
      )
    )
      return;
    try {
      await api.triggerSeed();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const METRICS = [
    {
      label: "Total Users",
      value: stats?.total_users || 13,
      sub: `${stats?.total_patients || 10} Registered Patients`,
      icon: Users,
      color: "#06d6a0",
      borderClass: "border-white/10",
      bgClass: "",
    },
    {
      label: "Network Pharmacies",
      value: stats?.total_pharmacies || 8,
      sub: `${stats?.verified_pharmacies || 7} Verified`,
      subColor: "text-[#06d6a0]",
      icon: Store,
      color: "#0ea5e9",
      borderClass: "border-white/10",
      bgClass: "",
    },
    {
      label: "Medicine Catalog",
      value: stats?.total_medicines || 52,
      sub: "Tracked Formulations",
      icon: Pill,
      color: "#a855f7",
      borderClass: "border-white/10",
      bgClass: "",
    },
    {
      label: "Active Holds",
      value: stats?.active_reservations || 3,
      sub: "Reservations in Transit",
      icon: CalendarCheck,
      color: "#f59e0b",
      borderClass: "border-white/10",
      bgClass: "",
    },
    {
      label: "Low Stock Alerts",
      value: stats?.low_stock_alerts_count || 14,
      sub: "Regional supply warnings",
      icon: AlertOctagon,
      color: "#f43f5e",
      borderClass: "border-[#f43f5e]/20",
      bgClass: "bg-[#f43f5e]/5",
      pulse: true,
    },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Admin Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <div className="text-xs font-semibold text-[#f43f5e] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#f43f5e]" /> Platform
            Administration & Health Intelligence
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Regional Medicine Supply Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time supply forecasting, stockout warnings, and pharmacy
            verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerReSeed}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#06d6a0]" />
            <span>
              {seedSuccess ? "Demo Data Reset!" : "Reset Demo Data"}
            </span>
          </button>

          <button
            onClick={fetchStats}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all duration-300"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Platform Executive Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {METRICS.map((metric, i) => {
          const IconComp = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className={`p-5 rounded-3xl liquid-glass border ${metric.borderClass} ${metric.bgClass} space-y-2 card-3d ${
                i === METRICS.length - 1 ? "col-span-2 lg:col-span-1" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  {metric.label}
                </span>
                <IconComp
                  className={`w-4 h-4 ${metric.pulse ? "animate-pulse" : ""}`}
                  style={{ color: metric.color }}
                />
              </div>
              <div
                className="text-2xl font-black"
                style={{ color: metric.color }}
              >
                <AnimatedCounter value={metric.value} />
              </div>
              <div
                className={`text-[11px] ${
                  metric.subColor || "text-slate-500"
                } ${metric.subColor ? "font-semibold" : ""}`}
              >
                {metric.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Shortage Analytics Engine View */}
      <ShortageAnalyticsView />

      {/* Pharmacy Partner Verification Management */}
      <PharmacyVerifier />
    </motion.div>
  );
}
