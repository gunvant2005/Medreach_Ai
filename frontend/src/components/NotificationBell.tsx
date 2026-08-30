"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "@/types";
import { api } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getMyNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray((data as any).notifications)) {
        setNotifications((data as any).notifications);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll for demo updates
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => ({ ...n, read: true })) : []
      );
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-[#06d6a0]" />;
      case "WARNING":
      case "SHORTAGE":
        return <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />;
      default:
        return <Info className="w-4 h-4 text-[#0ea5e9]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all duration-300"
        aria-label="Notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? "animate-bounce-gentle" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06d6a0] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#06d6a0] border-2 border-[#050a18]" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl liquid-glass-dark border border-white/15 shadow-2xl p-4 z-50"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold badge-glow-green">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#06d6a0] hover:underline flex items-center gap-1 font-medium"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 py-2">
              {safeNotifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">No notifications yet</div>
              ) : (
                safeNotifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`p-3 rounded-xl transition-all border ${
                      notif.read
                        ? "bg-white/[0.02] border-white/5 opacity-60"
                        : "bg-[#06d6a0]/5 border-[#06d6a0]/15"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex-shrink-0">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white">{notif.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
