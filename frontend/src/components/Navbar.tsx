"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import NotificationBell from "./NotificationBell";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  User as UserIcon,
  Menu,
  X,
  Activity,
  ChevronDown,
  PhoneCall,
  ShieldCheck,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/patient", label: "Find Medicine" },
  { href: "/pharmacist", label: "Chemist Portal" },
  { href: "/admin", label: "Admin Intel" },
];

export default function Navbar() {
  const { user, loading: authLoading, switchDemoRole, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleSwitchRole = (role: "PATIENT" | "PHARMACIST" | "ADMIN") => {
    switchDemoRole(role);
    setProfileDropdownOpen(false);
    if (role === "PATIENT") router.push("/patient");
    if (role === "PHARMACIST") router.push("/pharmacist");
    if (role === "ADMIN") router.push("/admin");
  };

  const handleNavLinkClick = (href: string) => {
    setMobileOpen(false);
    if (href === "/pharmacist" && user?.role !== "PHARMACIST" && user?.role !== "ADMIN") {
      switchDemoRole("PHARMACIST");
    } else if (href === "/admin" && user?.role !== "ADMIN") {
      switchDemoRole("ADMIN");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full px-4 py-3 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl bg-[#050a18]/90 border-b border-white/10 shadow-xl shadow-black/30"
            : "backdrop-blur-md bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#06d6a0]/15 border border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] group-hover:scale-105 transition-transform duration-300 shadow-md shadow-[#06d6a0]/10">
                <Activity className="w-5 h-5 text-[#06d6a0]" />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-xl border border-[#06d6a0]/20 animate-pulse-ring pointer-events-none" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 font-space">
                MedReach{" "}
                <span className="text-[#06d6a0] font-extrabold text-sm tracking-normal px-1.5 py-0.5 rounded bg-[#06d6a0]/10 border border-[#06d6a0]/20">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                National Healthcare Supply Network
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full liquid-glass border border-white/10">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavLinkClick(link.href)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-[#06d6a0]"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-[#06d6a0]/15 border border-[#06d6a0]/30 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 24/7 Emergency Helpline Hotline Pill */}
            <button
              onClick={() => setEmergencyModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 border border-[#f43f5e]/30 text-[#f43f5e] text-xs font-semibold transition-all duration-300"
              title="24/7 Emergency Medicine Dispatch"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f43f5e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f43f5e]" />
              </span>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>24/7 SOS Hotline</span>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile & Account Dropdown or Sign In */}
            {authLoading ? (
              <div className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-white/10" />
                <div className="hidden sm:block space-y-1">
                  <div className="h-3 w-16 bg-white/10 rounded" />
                  <div className="h-2 w-12 bg-white/5 rounded" />
                </div>
              </div>
            ) : !user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-2xl btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#06d6a0]/25"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#06d6a0]/15 border border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] font-bold text-xs">
                    {user?.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white max-w-[110px] truncate leading-tight">
                      {user?.name || "User Account"}
                    </div>
                    <div className="text-[10px] font-medium text-[#06d6a0] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0]" />
                      <span>{user?.role === "PHARMACIST" ? "Verified Chemist" : user?.role === "ADMIN" ? "Health Admin" : "Patient"}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-72 rounded-3xl liquid-glass-dark border border-white/15 shadow-2xl p-4 z-50 space-y-3 backdrop-blur-3xl"
                    >
                      {/* Header info */}
                      <div className="pb-3 border-b border-white/10">
                        <div className="text-sm font-bold text-white">{user?.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Active Session • {user?.role}</span>
                        </div>
                      </div>

                      {/* Workspace Account Switcher */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                          Switch Active Role / Portal
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleSwitchRole("PATIENT")}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                              user?.role === "PATIENT"
                                ? "bg-[#06d6a0]/15 text-[#06d6a0] font-bold border border-[#06d6a0]/30"
                                : "hover:bg-white/5 text-slate-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-[#06d6a0]" />
                              <span>Patient Portal</span>
                            </div>
                            {user?.role === "PATIENT" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleSwitchRole("PHARMACIST")}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                              user?.role === "PHARMACIST"
                                ? "bg-[#06d6a0]/15 text-[#06d6a0] font-bold border border-[#06d6a0]/30"
                                : "hover:bg-white/5 text-slate-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-[#0ea5e9]" />
                              <span>Pharmacy Console</span>
                            </div>
                            {user?.role === "PHARMACIST" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleSwitchRole("ADMIN")}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                              user?.role === "ADMIN"
                                ? "bg-[#06d6a0]/15 text-[#06d6a0] font-bold border border-[#06d6a0]/30"
                                : "hover:bg-white/5 text-slate-300 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#a855f7]" />
                              <span>Health Administration</span>
                            </div>
                            {user?.role === "ADMIN" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Emergency & Support Links */}
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setEmergencyModalOpen(true);
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs text-[#f43f5e] hover:bg-[#f43f5e]/10 flex items-center gap-2 transition-colors font-semibold"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Emergency Medical Dispatch</span>
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            setAuthModalOpen(true);
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="mt-3 p-4 rounded-3xl liquid-glass-dark border border-white/10 space-y-3">
                <div className="flex flex-col gap-1.5">
                  {NAV_LINKS.map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block p-3 rounded-2xl text-sm font-semibold transition-all ${
                        pathname === link.href
                          ? "bg-[#06d6a0]/15 text-[#06d6a0] border border-[#06d6a0]/30"
                          : "bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Active Portal:</span>
                  <div className="flex items-center gap-1 text-xs">
                    {(["PATIENT", "PHARMACIST", "ADMIN"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          handleSwitchRole(r);
                          setMobileOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                          user?.role === r
                            ? "bg-[#06d6a0] text-[#050a18]"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {r === "PATIENT" ? "Patient" : r === "PHARMACIST" ? "Chemist" : "Admin"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 24/7 Emergency Medical Dispatch Modal */}
      <AnimatePresence>
        {emergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl liquid-glass-dark border border-[#f43f5e]/40 p-6 sm:p-8 space-y-6 shadow-2xl bg-[#090514]"
            >
              {/* Close button */}
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 flex items-center justify-center text-[#f43f5e]">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">24/7 Emergency Medicine Dispatch</h3>
                  <p className="text-xs text-slate-400">Critical Drug Stockouts & Priority Ambulance Routing</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-slate-200 space-y-1">
                  <div className="font-bold text-[#f43f5e] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency Priority Channel</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    For life-threatening shortages (Anti-venom, Insulin Shock, Cardiac Emergency, ICU Injectables), dial our central medical control room immediately:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href="tel:108"
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center group transition-all"
                  >
                    <span className="text-2xl font-black text-[#f43f5e] font-space">108</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">National Ambulance</span>
                  </a>
                  <a
                    href="tel:112"
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center group transition-all"
                  >
                    <span className="text-2xl font-black text-[#0ea5e9] font-space">112</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Emergency Response</span>
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#06d6a0]" />
                    <span>24x7 Verified Open Pharmacies</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Apollo 24/7 Pharmacy (Station Road) and Sanjeevani Medicals (Hospital Road) operate continuous emergency medicine counters with active inventory sync.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/patient"
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Search 24/7 Stock</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
