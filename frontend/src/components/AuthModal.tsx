"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Store,
  KeyRound,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "LOGIN" | "REGISTER";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "LOGIN",
}: AuthModalProps) {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"PATIENT" | "PHARMACIST" | "ADMIN">("PATIENT");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password);
      setSuccessMsg("Signed in successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await register({
        email,
        password,
        name: fullName,
        phone,
        role,
      });
      setSuccessMsg("Account created and signed in!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try a different email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: "PATIENT" | "PHARMACIST" | "ADMIN") => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await switchDemoRole(demoRole);
      setSuccessMsg(`Switched session to ${demoRole}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg("Failed to switch role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-lg rounded-3xl liquid-glass-dark border border-white/20 p-6 sm:p-8 space-y-6 shadow-2xl bg-[#090d20]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#06d6a0]/15 border border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white font-space">
            {mode === "LOGIN" ? "Sign In to MedReach AI" : "Create Verified Account"}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === "LOGIN"
              ? "Access real-time medicine routing, prescriptions, and pharmacy management."
              : "Join India's verified intelligent medicine availability network."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              mode === "LOGIN"
                ? "bg-[#06d6a0] text-[#050a18] shadow-md shadow-[#06d6a0]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("REGISTER");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              mode === "REGISTER"
                ? "bg-[#06d6a0] text-[#050a18] shadow-md shadow-[#06d6a0]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            New Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f43f5e]" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-[#06d6a0]/15 border border-[#06d6a0]/30 text-[#06d6a0] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        {mode === "LOGIN" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@medreach.ai"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#06d6a0]/25 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === "REGISTER" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Anand Verma / Priya Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98230..."
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs input-glow focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#0d1430] border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="PATIENT">Patient / Consumer</option>
                  <option value="PHARMACIST">Pharmacy Chemist</option>
                  <option value="ADMIN">Health Officer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#06d6a0]/25 disabled:opacity-50 mt-2"
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </form>
        )}

        {/* 1-Click Fast Persona Switcher for Frictionless Evaluation */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center">
            Or 1-Click Quick Demo Sign-In
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("PATIENT")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center transition-all hover:border-[#06d6a0]/30"
            >
              <User className="w-4 h-4 text-[#06d6a0] mb-1" />
              <span className="font-bold text-white text-[11px]">Patient</span>
              <span className="text-[9px] text-slate-400">Rahul Patel</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("PHARMACIST")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center transition-all hover:border-[#0ea5e9]/30"
            >
              <Store className="w-4 h-4 text-[#0ea5e9] mb-1" />
              <span className="font-bold text-white text-[11px]">Chemist</span>
              <span className="text-[9px] text-slate-400">Dr. Sharma</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("ADMIN")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center transition-all hover:border-[#a855f7]/30"
            >
              <Building2 className="w-4 h-4 text-[#a855f7] mb-1" />
              <span className="font-bold text-white text-[11px]">Admin</span>
              <span className="text-[9px] text-slate-400">Health Dept</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
