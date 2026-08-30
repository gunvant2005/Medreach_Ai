"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  Activity,
  Shield,
  Zap,
} from "lucide-react";

// Dynamically import 3D scene to avoid SSR issues
const MedicalScene3D = dynamic(() => import("./3d/MedicalScene3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-[#050a18] via-[#0a1128] to-[#050a18]" />
  ),
});

const HEADLINE_WORDS = ["Intelligent", "Medicine", "Discovery"];

const STATS = [
  { label: "Pharmacies", value: "500+", icon: Shield },
  { label: "Medicines Tracked", value: "12K+", icon: Activity },
  { label: "Avg. Find Time", value: "<2min", icon: Zap },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full bg-[#050a18] text-white overflow-hidden">
      {/* Full-viewport Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center select-none">
        {/* 3D WebGL Background Scene */}
        {mounted && <MedicalScene3D />}

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a18]/80 via-transparent to-[#050a18]/90 z-[1] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-radial-accent z-[1] pointer-events-none" />

        {/* Main Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold badge-glow-green mb-6">
              <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" />
              AI-POWERED HEALTHCARE PLATFORM
            </span>
          </motion.div>

          {/* Animated Headline */}
          <h1 className="font-serif-instrument text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="inline-block mr-[0.25em]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.3 + i * 0.15,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                {word === "Medicine" ? (
                  <span className="bg-gradient-to-r from-[#06d6a0] via-[#0ea5e9] to-[#a855f7] bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-300/90 max-w-2xl leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            Find verified medicine stock near you in seconds. AI prescription
            scanning, real-time pharmacy inventory, and guaranteed pickup
            reservations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <Link
              href="/patient"
              className="group px-8 py-4 rounded-full btn-primary text-sm flex items-center gap-2.5 hover:gap-3.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Medicine Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pharmacist"
              className="px-6 py-4 rounded-full liquid-glass hover:bg-white/10 text-white font-medium text-sm flex items-center gap-2 transition-all"
            >
              Pharmacist Portal
            </Link>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            className="mt-12 flex items-center gap-6 sm:gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            {STATS.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <IconComp className="w-3.5 h-3.5 text-[#06d6a0]" />
                    <span className="text-xl sm:text-2xl font-black text-white font-space">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">
            Explore
          </span>
          <ChevronDown className="w-5 h-5 text-slate-400 animate-bounce-gentle" />
        </motion.div>
      </section>

      {/* Problem & Solution Section */}
      <section className="relative w-full py-24 px-4 bg-[#050a18] border-t border-white/5">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold badge-glow-green">
              REAL PROBLEM → AI SOLUTION
            </span>
            <h2 className="font-serif-instrument text-4xl sm:text-6xl mt-6 text-white leading-tight">
              Stop visiting pharmacy
              <br />
              <span className="bg-gradient-to-r from-[#f43f5e] to-[#f59e0b] bg-clip-text text-transparent">
                after pharmacy.
              </span>
            </h2>
            <p className="mt-5 text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Patients waste hours in medical emergencies hearing &quot;out of
              stock&quot;. MedReach AI provides instant, intelligent medicine
              routing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Pain */}
            <motion.div
              className="liquid-glass-dark rounded-3xl p-8 border border-[#f43f5e]/20 bg-[#f43f5e]/5 relative overflow-hidden"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#f43f5e] font-semibold text-xs tracking-wider uppercase">
                  Traditional Pain Point
                </span>
                <span className="w-3 h-3 rounded-full bg-[#f43f5e]/80 animate-ping" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">
                Manual Multi-Store Hunt
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                {[
                  {
                    label: "Pharmacy 1:",
                    desc: "Out of stock for Paracetamol 650 & ORS",
                  },
                  {
                    label: "Pharmacy 2:",
                    desc: "Only has 1 strip left, long waiting line",
                  },
                  {
                    label: "Pharmacy 3:",
                    desc: "Closed unexpectedly or medicine expired",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-[#f43f5e] font-bold">
                      ❌ {item.label}
                    </span>
                    <span>{item.desc}</span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-6 text-xs text-[#f43f5e]/70 italic">
                Result: 2+ hours wasted, critical delay in treatment.
              </p>
            </motion.div>

            {/* MedReach AI Solution */}
            <motion.div
              className="glass-glow rounded-3xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#06d6a0] font-semibold text-xs tracking-wider uppercase">
                  MedReach AI Workflow
                </span>
                <span className="w-3 h-3 rounded-full bg-[#06d6a0]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-5">
                Instant Intelligent Routing
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                {[
                  {
                    label: "AI Prescription Scan:",
                    desc: "Extracts & normalizes medicine names in 1 sec",
                  },
                  {
                    label: "Smart Ranking:",
                    desc: "Sharma Medical (0.7 km) • 28 units verified",
                  },
                  {
                    label: "1-Click Reservation:",
                    desc: "Pickup code MR-82914 locked for 2 hours",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#06d6a0]/10 border border-[#06d6a0]/20"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <span className="text-[#06d6a0] font-bold">
                      ✓ {item.label}
                    </span>
                    <span>{item.desc}</span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-6 text-xs text-[#06d6a0]/80 font-medium">
                Result: Guaranteed medicine pickup in under 10 minutes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
