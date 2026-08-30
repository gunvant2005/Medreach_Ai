"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Check, AlertTriangle, RefreshCw, Package } from "lucide-react";
import { Pharmacy, InventoryItem, Medicine } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency, formatTimeAgo } from "@/lib/utils";

interface InventoryManagerProps {
  pharmacy: Pharmacy | null;
  onRefreshStats?: () => void;
}

export default function InventoryManager({ pharmacy, onRefreshStats }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Add Medicine Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<number | "">("");
  const [addQty, setAddQty] = useState<number>(20);
  const [addPrice, setAddPrice] = useState<number>(35.0);

  const fetchInventory = async () => {
    if (!pharmacy) return;
    setLoading(true);
    try {
      const items = await api.getPharmacyInventory(pharmacy.id);
      setInventory(Array.isArray(items) ? items : []);
      const meds = await api.getMedicines();
      setAllMedicines(Array.isArray(meds) ? meds : []);
    } catch (e) {
      console.error(e);
      setInventory([]);
      setAllMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [pharmacy]);

  const handleUpdate = async (item: InventoryItem) => {
    if (!pharmacy) return;
    try {
      await api.updateInventoryItem(pharmacy.id, item.id, {
        quantity: editQty,
        price: editPrice,
      });
      setEditingItem(null);
      fetchInventory();
      if (onRefreshStats) onRefreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!pharmacy) return;
    if (!confirm("Are you sure you want to remove this item from your inventory?")) return;
    try {
      await api.deleteInventoryItem(pharmacy.id, itemId);
      fetchInventory();
      if (onRefreshStats) onRefreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy || !selectedMedId) return;

    try {
      await api.addOrUpdateInventory(pharmacy.id, {
        medicine_id: Number(selectedMedId),
        quantity: addQty,
        price: addPrice,
      });
      setIsAddOpen(false);
      fetchInventory();
      if (onRefreshStats) onRefreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInventory = inventory.filter((it) => {
    const medName = it.medicine?.name || "";
    const genName = it.medicine?.generic_name || "";
    return medName.toLowerCase().includes(search.toLowerCase()) || genName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-white placeholder-slate-400 text-xs border border-white/10 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-2xl liquid-glass hover:bg-white/10 text-slate-300"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine Stock</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl liquid-glass border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase text-[10px] tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Medicine</th>
                <th className="px-4 py-4">Dosage / Form</th>
                <th className="px-4 py-4">In Stock</th>
                <th className="px-4 py-4">Unit Price</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No matching medicines in inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isEditing = editingItem?.id === item.id;
                  const isLow = item.quantity > 0 && item.quantity < 10;
                  const isOut = item.quantity <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{item.medicine?.name}</div>
                        <div className="text-[11px] text-slate-400">{item.medicine?.generic_name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-medium text-slate-300">
                          {item.medicine?.strength} • {item.medicine?.dosage_form}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded bg-slate-900 border border-emerald-400 text-white"
                          />
                        ) : (
                          <div className="font-bold text-white text-sm">{item.quantity} units</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded bg-slate-900 border border-emerald-400 text-white"
                          />
                        ) : (
                          <div className="font-medium text-white">{formatCurrency(item.price)}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            Low Stock ({item.quantity})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleUpdate(item)}
                            className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold text-xs hover:bg-emerald-400"
                          >
                            Save
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setEditQty(item.quantity);
                                setEditPrice(item.price);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Edit Stock / Price"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              title="Remove Medicine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-4">Add Medicine to Inventory</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 uppercase font-semibold text-[10px]">Select Medicine</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(Number(e.target.value))}
                  required
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-900 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="">-- Choose Medicine --</option>
                  {allMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.generic_name} • {m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase font-semibold text-[10px]">Initial Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                    required
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-900 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 uppercase font-semibold text-[10px]">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={addPrice}
                    onChange={(e) => setAddPrice(parseFloat(e.target.value) || 1)}
                    required
                    className="w-full mt-1 p-3 rounded-2xl bg-slate-900 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl liquid-glass text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
