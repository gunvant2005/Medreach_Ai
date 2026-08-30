"use client";

import React, { useState, useEffect } from "react";
import { BasketItem, BasketPharmacyFulfillment, RankedPharmacy, Reservation } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";

interface PrescriptionBasketViewProps {
  basketItems: BasketItem[];
  onRemoveItem: (id: number) => void;
  onUpdateQty: (id: number, delta: number) => void;
  onClearBasket: () => void;
  latitude: number;
  longitude: number;
  onReserveBasketAtPharmacy: (pharmacy: BasketPharmacyFulfillment) => void;
}

export default function PrescriptionBasketView({
  basketItems,
  onRemoveItem,
  onUpdateQty,
  onClearBasket,
  latitude,
  longitude,
  onReserveBasketAtPharmacy,
}: PrescriptionBasketViewProps) {
  const [fulfillments, setFulfillments] = useState<BasketPharmacyFulfillment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBasketAvailability = async () => {
    if (basketItems.length === 0) return;
    setLoading(true);
    try {
      const data = await api.checkBasketAvailability(
        basketItems.map((b) => ({ medicine_id: b.medicine_id, quantity: b.quantity })),
        latitude,
        longitude,
        25.0
      );
      setFulfillments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBasketAvailability();
  }, [basketItems, latitude, longitude]);

  if (basketItems.length === 0) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl liquid-glass-dark border border-emerald-500/30 bg-emerald-950/20 space-y-6">
      {/* Basket Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Full Prescription Basket Matcher</h3>
            <p className="text-xs text-slate-300">
              Checking which single pharmacy holds all {basketItems.length} prescribed medicines in stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBasketAvailability}
            className="p-2 rounded-xl liquid-glass hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={onClearBasket}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs transition-colors"
          >
            Clear Basket
          </button>
        </div>
      </div>

      {/* Basket Medicines Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {basketItems.map((item) => (
          <div
            key={item.medicine_id}
            className="p-3.5 rounded-2xl liquid-glass border border-white/10 flex items-center justify-between gap-3 bg-white/5"
          >
            <div>
              <div className="font-bold text-xs text-white">{item.medicine_name}</div>
              <div className="text-[10px] text-slate-400">{item.strength}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => onUpdateQty(item.medicine_id, -1)}
                  className="text-slate-400 hover:text-white font-bold px-1"
                >
                  -
                </button>
                <span className="text-white font-semibold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.medicine_id, 1)}
                  className="text-slate-400 hover:text-white font-bold px-1"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.medicine_id)}
                className="text-slate-400 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fulfillments List */}
      <div className="space-y-4 pt-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Single-Pharmacy Fulfillment Availability
        </span>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-400 mb-2" />
            Matching nearby pharmacy inventories...
          </div>
        ) : fulfillments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No nearby pharmacies match all items in the basket. Try searching individual medicines or expanding radius.
          </div>
        ) : (
          <div className="space-y-3">
            {fulfillments.map((ful) => (
              <div
                key={ful.pharmacy.id}
                className={`p-5 rounded-2xl liquid-glass border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  ful.is_full_match
                    ? "border-emerald-500/40 bg-emerald-950/30 shadow-lg"
                    : "border-white/10 bg-white/5 opacity-85"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">{ful.pharmacy.name}</h4>
                    {ful.is_full_match ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 100% COMPLETE BASKET IN STOCK
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ful.matched_items_count}/{ful.total_items_count} Medicines In Stock
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ful.distance_km} km away</span>
                    </span>
                    <span>•</span>
                    <span>{ful.pharmacy.address}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{ful.trust_score}% Trust</span>
                  </div>

                  {/* Per item chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ful.item_availability.map((it) => (
                      <span
                        key={it.medicine_id}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                          it.in_stock
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                            : "bg-red-950/40 text-red-300 border-red-500/30"
                        }`}
                      >
                        {it.in_stock ? "✓" : "✕"} {it.medicine_name} ({it.available_quantity} avail)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatCurrency(ful.total_basket_price)}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Basket Price</div>
                  </div>

                  <button
                    onClick={() => onReserveBasketAtPharmacy(ful)}
                    disabled={!ful.is_full_match && ful.matched_items_count === 0}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all hover:scale-105"
                  >
                    <span>Reserve All Prescribed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
