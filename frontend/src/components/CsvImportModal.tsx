"use client";

import React, { useState } from "react";
import { X, UploadCloud, Download, CheckCircle2, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { Pharmacy } from "@/types";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  onSuccess: () => void;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  pharmacy,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !pharmacy) return null;

  const handleDownloadSample = () => {
    const csvContent =
      "medicine_name,generic_name,strength,dosage_form,quantity,price,batch_number,expiry_date\n" +
      "Paracetamol 650,Paracetamol,650mg,Tablet,100,32.0,BATCH-A1,2027-10\n" +
      "Azithromycin 500,Azithromycin,500mg,Tablet,45,115.0,BATCH-B2,2027-08\n" +
      "Oral Rehydration Salts (ORS),Sodium Chloride,21.8g,Sachet,60,22.0,BATCH-C3,2028-01\n" +
      "Insulin Glargine,Human Insulin,100IU/ml,Injection,12,680.0,BATCH-D4,2026-11\n" +
      "Amoxicillin 500,Amoxicillin,500mg,Capsule,80,48.0,BATCH-E5,2027-05";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "medreach_pos_sample_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResultMsg(null);

    try {
      const res = await api.importInventoryCsv(pharmacy.id, file);
      setResultMsg(res.message);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to import CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Bulk Inventory CSV Import</h3>
          <p className="text-xs text-slate-400">
            Sync stock directly from your pharmacy billing or POS software (Marg, Vyapar, Pharmasoft).
          </p>
        </div>

        {/* Download Template Button */}
        <div className="my-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Standard POS Template</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>

        {error && (
          <div className="p-3 mb-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {resultMsg && (
          <div className="p-3 mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{resultMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <label className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/5 hover:bg-white/10 group">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-semibold text-xs text-white">
              {file ? file.name : "Select or drag pharmacy stock CSV"}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Supports CSV with columns: name, quantity, price, batch, expiry</p>
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl liquid-glass text-slate-300 font-semibold text-xs"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{loading ? "Importing..." : "Upload & Sync"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
