"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  PhoneCall,
  Pill,
  Clock,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface AiAssistantWidgetProps {
  onSearchQuery?: (query: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  actionText?: string;
  actionQuery?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "ai",
    text: "Hello! I am your MedReach AI Emergency Health Assistant. How can I help you find medicines or emergency care today?",
  },
];

const QUICK_PROMPTS = [
  { label: "⚡ Find Paracetamol 650", query: "Paracetamol" },
  { label: "💧 Emergency ORS Stock", query: "ORS" },
  { label: "🌙 24/7 Night Pharmacies", query: "24/7" },
  { label: "💡 Cheaper Generic Substitutes", query: "Generic" },
];

export default function AiAssistantWidget({ onSearchQuery }: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (userText: string) => {
    if (!userText || !userText.trim()) return;
    const text = userText.trim();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "I checked our live pharmacy network for you.";
      let actionText: string | undefined;
      let actionQuery: string | undefined;

      const lower = text.toLowerCase();
      if (lower.includes("paracetamol") || lower.includes("dolo") || lower.includes("fever")) {
        responseText = "Found 3 verified pharmacies with Paracetamol 650mg in stock within 1.5 km of your location! Micro Labs Dolo 650 is available at Sharma Medical.";
        actionText = "View Paracetamol Stock";
        actionQuery = "Paracetamol";
      } else if (lower.includes("ors") || lower.includes("dehydration") || lower.includes("electral")) {
        responseText = "ORS Hydration sachets are available at Metro Care Pharmacy (0.3 km away) and Lifeline Chemist. 28 units currently reserved for emergency dispatch.";
        actionText = "Find ORS Nearby";
        actionQuery = "ORS";
      } else if (lower.includes("24/7") || lower.includes("night") || lower.includes("open")) {
        responseText = "Apex Hospital Pharmacy & City Medicos operate 24 Hours with verified emergency medicine hold service.";
        actionText = "Filter 24/7 Pharmacies";
        actionQuery = "24/7";
      } else if (lower.includes("generic") || lower.includes("substitute") || lower.includes("cheaper")) {
        responseText = "You can save up to 65% by opting for bioequivalent generic formulations! Click below to open our AI Generic Substitute Matcher.";
        actionText = "Open Generic Matcher";
        actionQuery = "Paracetamol";
      } else {
        responseText = `Searching live network for "${text}". I have applied this query to your active inventory filter!`;
        actionText = `Search "${text}"`;
        actionQuery = text;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: responseText,
          actionText,
          actionQuery,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionClick = (query?: string) => {
    if (query && onSearchQuery) {
      onSearchQuery(query);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#06d6a0] to-[#0ea5e9] text-[#050a18] shadow-2xl shadow-[#06d6a0]/30 flex items-center justify-center font-bold"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-[#050a18]" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-extrabold ml-0 group-hover:ml-2 text-[#050a18]">
                MedReach AI Assistant
              </span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#050a18] animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#050a18]" />
            </>
          )}
        </motion.button>
      </div>

      {/* Assistant Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-[#0a1128]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#06d6a0]/15 via-transparent to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#06d6a0]/20 border border-[#06d6a0]/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#06d6a0]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    MedReach AI <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06d6a0]/20 text-[#06d6a0] font-semibold border border-[#06d6a0]/30">ONLINE</span>
                  </h3>
                  <p className="text-slate-400 text-xs">Emergency Supply & Pharmacy Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#06d6a0] text-[#050a18] font-medium rounded-br-none"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.actionText && (
                    <button
                      onClick={() => handleActionClick(m.actionQuery)}
                      className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#06d6a0]/15 text-[#06d6a0] hover:bg-[#06d6a0]/25 border border-[#06d6a0]/30 flex items-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {m.actionText}
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 max-w-[100px]">
                  <div className="w-2 h-2 rounded-full bg-[#06d6a0] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#06d6a0] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#06d6a0] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 border-t border-white/5 bg-[#050a18]/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.query)}
                  className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-white/10 bg-[#070e24] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI or type medicine name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06d6a0]/50"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-[#06d6a0] text-[#050a18] hover:bg-[#06d6a0]/90 disabled:opacity-40 transition font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
