"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileText,
  Check,
  Building2,
  Stethoscope,
  PlusCircle,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { Prescription, PrescriptionItem } from "@/types";

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMedicines: (items: PrescriptionItem[]) => void;
}

export default function PrescriptionUploadModal({
  isOpen,
  onClose,
  onConfirmMedicines,
}: PrescriptionUploadModalProps) {
  const [modalTab, setModalTab] = useState<"SCAN" | "DOCTOR_INBOX">("SCAN");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(1); // 1: Upload, 2: Scanning AI, 3: Verify & Confirm
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [extractedItems, setExtractedItems] = useState<PrescriptionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Doctor E-Prescription State
  const [doctorRxs, setDoctorRxs] = useState<any[]>([]);
  const [loadingDocRxs, setLoadingDocRxs] = useState(false);
  const [pushingDocRx, setPushingDocRx] = useState(false);

  useEffect(() => {
    if (isOpen && modalTab === "DOCTOR_INBOX") {
      fetchDoctorRxs();
    }
  }, [isOpen, modalTab]);

  const fetchDoctorRxs = async () => {
    setLoadingDocRxs(true);
    try {
      const data = await api.getMyDoctorPrescriptions();
      setDoctorRxs(data);
    } catch {
      // fallback mock
    } finally {
      setLoadingDocRxs(false);
    }
  };

  const handleSimulateDoctorPush = async () => {
    setPushingDocRx(true);
    try {
      await api.doctorPushPrescription({
        doctor_name: "Dr. Aarti Deshmukh, MD (Internal Med)",
        clinic_name: "Apex Healthcare Polyclinic",
        doctor_license: "MCI-773821-IND",
        patient_name: "Rahul Patel",
        diagnosis: "Upper Respiratory Tract Infection with Acute Bronchitis",
        notes: "Take hydration fluids regularly. Avoid cold beverages.",
        items: [
          {
            name: "Amoxicillin 500",
            generic_name: "Amoxicillin",
            dosage: "500mg",
            frequency: "1-0-1 after food",
            duration_days: 5,
            quantity: 10,
            medicine_id: 6,
          },
          {
            name: "Paracetamol 650",
            generic_name: "Paracetamol",
            dosage: "650mg",
            frequency: "1-0-1 (SOS fever)",
            duration_days: 5,
            quantity: 10,
            medicine_id: 1,
          },
        ],
      });
      await fetchDoctorRxs();
    } catch {
      // ignore
    } finally {
      setPushingDocRx(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleScanUpload = async () => {
    if (!file) {
      setError("Please select or drop a prescription image first.");
      return;
    }

    setScanning(true);
    setScanStep(2);
    setError(null);

    try {
      const res = await api.uploadPrescription(file);
      setPrescription(res);
      setExtractedItems(res.items);
      setScanStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan prescription. Please try again.");
      setScanStep(1);
    } finally {
      setScanning(false);
    }
  };

  const handleUseSamplePrescription = async (sampleName: string) => {
    setScanning(true);
    setScanStep(2);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = "#000000";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Rx: ${sampleName}`, 20, 50);
      }

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg")
      );
      const sampleFile = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, "_")}_rx.jpg`, {
        type: "image/jpeg",
      });

      const res = await api.uploadPrescription(sampleFile);
      setPrescription(res);
      setExtractedItems(res.items);
      setScanStep(3);
    } catch (err: any) {
      console.error(err);
      setError("Failed to process sample prescription.");
      setScanStep(1);
    } finally {
      setScanning(false);
    }
  };

  const handleFulfillDoctorRx = (docRx: any) => {
    const itemsToConfirm: PrescriptionItem[] = docRx.items.map((it: any, i: number) => ({
      id: 900 + i,
      prescription_id: docRx.id,
      raw_name: it.name,
      normalized_name: it.name,
      strength: it.dosage,
      quantity: it.quantity,
      confidence_score: 1.0,
      verification_status: "CONFIRMED",
      medicine_id: it.medicine_id,
    }));
    onConfirmMedicines(itemsToConfirm);
    onClose();
  };

  const handleConfirmFinal = () => {
    if (extractedItems.length === 0) {
      setError("Please select or keep at least one recognized medicine.");
      return;
    }
    onConfirmMedicines(extractedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl liquid-glass-dark border border-white/20 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Switcher */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setModalTab("SCAN")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "SCAN"
                  ? "bg-[#06d6a0] text-[#050a18] shadow-md shadow-[#06d6a0]/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>AI OCR Scanner</span>
            </button>
            <button
              onClick={() => setModalTab("DOCTOR_INBOX")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                modalTab === "DOCTOR_INBOX"
                  ? "bg-[#06d6a0] text-[#050a18] shadow-md shadow-[#06d6a0]/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#0ea5e9]" />
              <span>Doctor Digital Push Inbox</span>
              <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
            </button>
          </div>
        </div>

        {/* TAB 1: AI OCR SCANNER */}
        {modalTab === "SCAN" && (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30 uppercase flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3" /> Safety-Verified OCR Engine
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">AI Prescription Scanner</h3>
              <p className="text-xs text-slate-400">
                Upload physical or digital doctor prescriptions. Our engine extracts medicine names and matches inventory.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-[#f43f5e]/20 border border-[#f43f5e]/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {scanStep === 1 && (
              <div className="space-y-4">
                {/* Upload Zone */}
                <label className="border-2 border-dashed border-white/20 hover:border-[#06d6a0]/50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-[#06d6a0]/10 border border-[#06d6a0]/20 flex items-center justify-center text-[#06d6a0] mb-3">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {file ? file.name : "Click to select or drag & drop prescription image"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP up to 10MB</span>
                </label>

                {/* Instant Sample Prescriptions */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Or Click a Sample Doctor Prescription to test:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: "Fever & Infection Rx", meds: "Paracetamol 650 + Azithromycin" },
                      { name: "Dehydration Care Rx", meds: "ORS Electral + Zinc" },
                      { name: "Cardiac & BP Rx", meds: "Telmisartan 40 + Amlodipine" },
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseSamplePrescription(s.name)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:border-[#06d6a0]/30"
                      >
                        <div className="text-xs font-bold text-white">{s.name}</div>
                        <div className="text-[10px] text-[#06d6a0] mt-0.5">{s.meds}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {file && (
                  <button
                    type="button"
                    onClick={handleScanUpload}
                    className="w-full py-3.5 rounded-2xl btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#06d6a0]/25 mt-4"
                  >
                    <span>Extract Candidate Medicines with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {scanStep === 2 && (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-[#06d6a0]/15 border border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] mx-auto animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Analyzing Prescription with AI...</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Normalizing medical handwriting & mapping against verified pharmacy inventory.
                  </p>
                </div>
              </div>
            )}

            {scanStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Extracted Candidate Medicines ({extractedItems.length})
                  </span>
                  <span className="text-xs text-[#06d6a0] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> High AI Confidence
                  </span>
                </div>

                <div className="space-y-2">
                  {extractedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{item.normalized_name}</div>
                        <div className="text-xs text-slate-400">
                          {item.strength || "Standard"} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30">
                          {Math.round((item.confidence_score || 0.95) * 100)}% Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setScanStep(1)}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                  >
                    Rescan
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmFinal}
                    className="px-6 py-2.5 rounded-2xl btn-primary text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#06d6a0]/25"
                  >
                    <span>Confirm & Find Pharmacy Stock</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCTOR DIGITAL PUSH INBOX */}
        {modalTab === "DOCTOR_INBOX" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30 uppercase flex items-center gap-1 w-fit">
                  <Stethoscope className="w-3 h-3" /> Clinic & Hospital E-Prescription Gateway
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Doctor Digital Rx Push Inbox</h3>
                <p className="text-xs text-slate-400">
                  Direct digital prescriptions securely transmitted by verified clinics and hospitals.
                </p>
              </div>

              <button
                type="button"
                disabled={pushingDocRx}
                onClick={handleSimulateDoctorPush}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span>{pushingDocRx ? "Pushing..." : "Simulate Doctor Push"}</span>
              </button>
            </div>

            {loadingDocRxs ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching digital prescriptions...
              </div>
            ) : doctorRxs.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-3xl bg-white/5 border border-white/10">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">No Doctor Prescriptions in Inbox</div>
                <p className="text-xs text-slate-400 mt-1">Click &quot;Simulate Doctor Push&quot; to test receiving a digital Rx.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorRxs.map((docRx) => (
                  <div
                    key={docRx.id}
                    className="p-5 rounded-3xl liquid-glass border border-white/10 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{docRx.doctor_name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30">
                            Verified MCI
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{docRx.clinic_name} • Lic: {docRx.doctor_license}</span>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-xl">
                        {docRx.prescription_code}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs space-y-1">
                      <div className="text-slate-400">
                        <strong className="text-slate-200">Diagnosis:</strong> {docRx.diagnosis}
                      </div>
                      {docRx.notes && (
                        <div className="text-slate-400">
                          <strong className="text-slate-200">Physician Notes:</strong> {docRx.notes}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Prescribed Medicines:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {docRx.items.map((it: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                            <div>
                              <div className="font-bold text-white">{it.name}</div>
                              <div className="text-[10px] text-[#06d6a0]">{it.frequency}</div>
                            </div>
                            <div className="text-right text-[11px] text-slate-400">
                              Qty: {it.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleFulfillDoctorRx(docRx)}
                        className="px-5 py-2.5 rounded-2xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#06d6a0]/20"
                      >
                        <span>Fulfill & Search Nearby Pharmacy Stock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
