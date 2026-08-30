"use client";

import React, { useState, useEffect } from "react";
import { AdminStats, ShortageAlert } from "@/types";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Info,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export default function ShortageAnalyticsView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
        <p className="text-xs">Computing regional shortage intelligence...</p>
      </div>
    );
  }

  const safeAlerts = Array.isArray(stats.shortage_alerts) ? stats.shortage_alerts : [];
  const highRiskAlerts = safeAlerts.filter((a) => a.shortage_risk === "HIGH");
  const otherAlerts = safeAlerts.filter((a) => a.shortage_risk !== "HIGH");

  return (
    <div className="space-y-8">
      {/* Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Healthcare Intelligence Disclaimer:</strong> Shortage predictions are computed by prototype dynamic algorithms evaluating regional search velocity, stock depletion, and reservation momentum. These are data-driven estimates designed for logistical supply planning.
        </div>
      </div>

      {/* Critical Shortage Risk Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-bold text-base text-white">Active Shortage Warnings</h3>
          </div>
          <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            {highRiskAlerts.length} High-Risk Areas Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highRiskAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl liquid-glass-dark border border-rose-500/40 bg-rose-950/20 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white uppercase">
                    HIGH SHORTAGE RISK
                  </span>
                  <h4 className="text-xl font-bold text-white mt-2">{alert.medicine_name}</h4>
                  <p className="text-xs text-slate-400">{alert.generic_name} • Region: {alert.area}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-rose-400">{alert.risk_score}</div>
                  <div className="text-[10px] text-slate-400">Risk Index</div>
                </div>
              </div>

              {/* Data metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Demand Spike</span>
                  <div className="text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{alert.demand_growth_pct}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Inventory Drop</span>
                  <div className="text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> -{alert.inventory_drop_pct}%
                  </div>
                </div>
              </div>

              {/* Reason Explanation */}
              <div className="text-xs text-slate-300 leading-relaxed bg-rose-900/20 p-3 rounded-2xl border border-rose-500/20">
                <span className="font-semibold text-rose-300">Analysis: </span>
                {alert.reason}
              </div>

              {/* Action Recommendation */}
              <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 flex items-start gap-1.5">
                <span className="font-bold text-emerald-400 flex-shrink-0">Action:</span>
                <span>{alert.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Growth Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl liquid-glass border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>7-Day Medicine Demand Trends</span>
            </h4>
            <span className="text-[11px] text-slate-400">Search & Reservation Velocity</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.demand_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0f1d",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Paracetamol" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="ORS" stroke="#f43f5e" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Insulin" stroke="#38bdf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl liquid-glass border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Pharmacy Fulfillment & Stock Activity</span>
            </h4>
            <span className="text-[11px] text-slate-400">Top Network Hubs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pharmacy_activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0f1d",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar dataKey="reservations" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Requests" />
                <Bar dataKey="fulfilled" fill="#10b981" radius={[6, 6, 0, 0]} name="Fulfilled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Availability Summary Table */}
      <div className="p-6 rounded-3xl liquid-glass border border-white/10 space-y-4">
        <h4 className="font-bold text-sm text-white">Regional Availability Index</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Area / Zone</th>
                <th className="px-4 py-3">Stock Buffer</th>
                <th className="px-4 py-3">Shortage Level</th>
                <th className="px-4 py-3 text-right">Supply Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.area_availability.map((area, aIdx) => (
                <tr key={aIdx} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{area.area}</td>
                  <td className="px-4 py-3">{area.available}% Normal</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        area.shortage_risk === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : area.shortage_risk === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {area.shortage_risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">
                    {area.score}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
