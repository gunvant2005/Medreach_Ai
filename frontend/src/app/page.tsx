"use client";

import React from "react";
import Hero from "@/components/Hero";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Camera,
  MapPin,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  Activity,
  Pill,
  Users,
  Clock,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "AI Prescription Scanner",
    description:
      "Upload handwritten or printed prescriptions. Our OCR engine extracts candidate medicines with confidence scores, requiring patient verification before stock hold.",
    tag: "Safety Verified AI",
    tagIcon: ShieldCheck,
    color: "#06d6a0",
    colorClass: "text-[#06d6a0]",
    bgClass: "bg-[#06d6a0]/10",
    borderClass: "border-[#06d6a0]/30",
  },
  {
    icon: MapPin,
    title: "Smart Pharmacy Ranking",
    description:
      "Multi-factor algorithm scores pharmacies by Availability (40%), Proximity (25%), Freshness (20%), and Trust (15%). Transparent rationale on every result.",
    tag: "Transparent Rationale Tags",
    tagIcon: Sparkles,
    color: "#0ea5e9",
    colorClass: "text-[#0ea5e9]",
    bgClass: "bg-[#0ea5e9]/10",
    borderClass: "border-[#0ea5e9]/30",
  },
  {
    icon: TrendingUp,
    title: "Shortage Intelligence",
    description:
      "Predictive supply chain analytics track search surges and inventory depletion rates to warn health administrators about imminent stockouts days in advance.",
    tag: "Supply Chain Forecasting",
    tagIcon: Zap,
    color: "#f43f5e",
    colorClass: "text-[#f43f5e]",
    bgClass: "bg-[#f43f5e]/10",
    borderClass: "border-[#f43f5e]/30",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Scan or Search",
    description:
      "Upload a prescription photo or type the medicine name. AI instantly extracts and normalizes medicine compounds.",
    icon: Camera,
    color: "#06d6a0",
  },
  {
    step: "02",
    title: "AI-Ranked Results",
    description:
      "Our algorithm evaluates every pharmacy in your area by stock, distance, freshness, and trust to find the best match.",
    icon: BarChart3,
    color: "#0ea5e9",
  },
  {
    step: "03",
    title: "Reserve & Pickup",
    description:
      "Lock your medicine with a 1-click reservation code. The pharmacy holds your stock for 2 hours for guaranteed pickup.",
    icon: CheckCircle2,
    color: "#a855f7",
  },
];

const PLATFORM_STATS = [
  { value: "500+", label: "Network Pharmacies", icon: Pill },
  { value: "12,000+", label: "Medicines Tracked", icon: Activity },
  { value: "50,000+", label: "Patients Served", icon: Users },
  { value: "<2 min", label: "Average Find Time", icon: Clock },
];

export default function HomePage() {
  return (
    <div className="w-full bg-[#050a18] text-white">
      {/* Hero with 3D Animation */}
      <Hero />

      {/* Feature Deep Dive Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />

        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold badge-glow-green">
            INTELLIGENT HEALTHCARE ARCHITECTURE
          </span>
          <h2 className="font-serif-instrument text-4xl sm:text-6xl mt-6 text-white leading-tight">
            Engineered for real-world{" "}
            <span className="bg-gradient-to-r from-[#06d6a0] to-[#0ea5e9] bg-clip-text text-transparent">
              medicine supply speed.
            </span>
          </h2>
          <p className="mt-5 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Every feature is purpose-built to eliminate medicine search friction,
            protect medical safety, and prevent regional drug stockouts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {FEATURES.map((feat, i) => {
            const IconComp = feat.icon;
            const TagIcon = feat.tagIcon;
            return (
              <motion.div
                key={feat.title}
                className="p-8 rounded-3xl liquid-glass border border-white/10 space-y-4 hover:border-white/20 transition-all group card-3d"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feat.bgClass} border ${feat.borderClass} flex items-center justify-center ${feat.colorClass} group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
                <div
                  className={`pt-2 ${feat.colorClass} text-xs font-semibold flex items-center gap-1.5`}
                >
                  <span>{feat.tag}</span>
                  <TagIcon className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold badge-glow-blue">
              HOW IT WORKS
            </span>
            <h2 className="font-serif-instrument text-4xl sm:text-5xl mt-6 text-white">
              Three steps to{" "}
              <span className="bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] bg-clip-text text-transparent">
                guaranteed medicine.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const IconComp = step.icon;
              return (
                <motion.div
                  key={step.step}
                  className="relative p-8 rounded-3xl liquid-glass border border-white/10 text-center group card-3d"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 * i }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black bg-[#050a18] border border-white/15 text-slate-400">
                    STEP {step.step}
                  </div>

                  <div
                    className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}40`,
                      color: step.color,
                    }}
                  >
                    <IconComp className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connector */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-slate-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PLATFORM_STATS.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="text-center p-6 rounded-3xl liquid-glass border border-white/10 card-3d"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <IconComp className="w-5 h-5 text-[#06d6a0] mx-auto mb-3" />
                  <div className="text-2xl sm:text-3xl font-black text-white font-space">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="p-10 rounded-3xl glass-glow border-gradient-animated relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif-instrument">
                Ready to find medicine{" "}
                <span className="text-[#06d6a0]">instantly?</span>
              </h3>
              <p className="text-sm text-slate-300 mb-8 max-w-lg mx-auto">
                Join the intelligent healthcare network. Search real-time
                inventory, scan prescriptions with AI, and reserve medicine in
                one click.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/patient"
                  className="group px-8 py-4 rounded-full btn-primary text-sm flex items-center gap-2.5 hover:gap-3.5 transition-all"
                >
                  <span>Start Searching</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/pharmacist"
                  className="px-6 py-4 rounded-full liquid-glass hover:bg-white/10 text-white font-medium text-sm transition-all"
                >
                  Register Your Pharmacy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
