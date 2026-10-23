"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { BroadcastNotification, BroadcastAudience, BroadcastTheme } from "@/types/broadcast";
import { createClient } from "@/lib/supabase/client";

interface BroadcastBannerBarProps {
  role?: string;
  className?: string;
}

const THEME_STYLES: Record<
  Exclude<BroadcastTheme, "custom">,
  {
    container: string;
    text: string;
    badge: string;
    btn: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    container: "bg-blue-600 text-white border-blue-500",
    text: "text-blue-50",
    badge: "bg-blue-700/80 text-blue-100 border-blue-400/40",
    btn: "bg-white text-blue-700 hover:bg-blue-50",
    icon: Info,
  },
  success: {
    container: "bg-emerald-600 text-white border-emerald-500",
    text: "text-emerald-50",
    badge: "bg-emerald-700/80 text-emerald-100 border-emerald-400/40",
    btn: "bg-white text-emerald-800 hover:bg-emerald-50",
    icon: CheckCircle2,
  },
  warning: {
    container: "bg-amber-500 text-slate-950 border-amber-400",
    text: "text-slate-900",
    badge: "bg-amber-600 text-slate-950 border-amber-700/30",
    btn: "bg-slate-900 text-amber-300 hover:bg-slate-800",
    icon: AlertTriangle,
  },
  danger: {
    container: "bg-rose-600 text-white border-rose-500",
    text: "text-rose-50",
    badge: "bg-rose-700/80 text-rose-100 border-rose-400/40",
    btn: "bg-white text-rose-700 hover:bg-rose-50",
    icon: AlertCircle,
  },
  purple: {
    container: "bg-purple-700 text-white border-purple-600",
    text: "text-purple-100",
    badge: "bg-purple-800/80 text-purple-200 border-purple-400/40",
    btn: "bg-white text-purple-800 hover:bg-purple-50",
    icon: Sparkles,
  },
};

export function BroadcastBannerBar({ role = "citizen", className = "" }: BroadcastBannerBarProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Determine audience scope based on dashboard role
  const audienceScope: BroadcastAudience =
    role === "enterprise_admin" || role === "enterprise"
      ? "enterprise"
      : role === "super_admin"
      ? "super_admin"
      : "citizen";

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    try {
      const dismissed = new Set<string>();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sabi_dismissed_bcast_")) {
          const id = key.replace("sabi_dismissed_bcast_", "");
          dismissed.add(id);
        }
      }
      setDismissedIds(dismissed);
    } catch {
      // LocalStorage unavailable in privacy modes
    }
  }, []);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/broadcasts?audience=${audienceScope}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.broadcasts && Array.isArray(data.broadcasts)) {
          setBroadcasts(data.broadcasts);
        }
      }
    } catch (err) {
      console.warn("[BroadcastBanner] Polling error:", err);
    }
  }, [audienceScope]);

  useEffect(() => {
    fetchBroadcasts();

    // 1. Subscribe to Supabase Realtime channel for live notifications
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("public:broadcast_notifications")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "broadcast_notifications" },
          () => {
            fetchBroadcasts();
          }
        )
        .subscribe();
    } catch {
      // Supabase realtime unconfigured
    }

    // 2. Resilient background polling interval (every 30 seconds)
    const interval = setInterval(fetchBroadcasts, 30000);

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [fetchBroadcasts]);

  const handleDismiss = (id: string) => {
    try {
      localStorage.setItem(`sabi_dismissed_bcast_${id}`, Date.now().toString());
    } catch {}
    setDismissedIds((prev) => new Set([...Array.from(prev), id]));
  };

  // Filter out dismissed notifications
  const visibleBroadcasts = broadcasts.filter((b) => !dismissedIds.has(b.id));

  if (visibleBroadcasts.length === 0) return null;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {visibleBroadcasts.map((b) => {
        const isCustom = b.theme === "custom";
        const themeStyle = !isCustom ? THEME_STYLES[b.theme as keyof typeof THEME_STYLES] || THEME_STYLES.info : null;
        const IconComponent = themeStyle?.icon || Info;

        const customStyle: React.CSSProperties = isCustom
          ? {
              backgroundColor: b.custom_bg_color || "#1e293b",
              color: b.custom_text_color || "#f8fafc",
              borderColor: b.custom_bg_color ? `${b.custom_bg_color}88` : "#334155",
            }
          : {};

        return (
          <div
            key={b.id}
            style={customStyle}
            className={`relative w-full px-4 py-2.5 rounded-xl border transition-all duration-300 shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 ${
              themeStyle ? themeStyle.container : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="shrink-0 p-1 rounded-lg bg-black/10 dark:bg-white/10">
                <IconComponent className="w-4 h-4" />
              </span>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <span className="font-semibold shrink-0 tracking-tight">{b.title}:</span>
                <span className={`truncate sm:whitespace-normal ${themeStyle ? themeStyle.text : "opacity-90"}`}>
                  {b.message}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {b.action_url && b.action_label && (
                <Link
                  href={b.action_url}
                  target={b.action_url.startsWith("http") ? "_blank" : undefined}
                  rel={b.action_url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-xs transition-colors shadow-xs ${
                    themeStyle ? themeStyle.btn : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span>{b.action_label}</span>
                  {b.action_url.startsWith("http") ? (
                    <ExternalLink className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Link>
              )}

              {b.is_dismissible && (
                <button
                  type="button"
                  onClick={() => handleDismiss(b.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/15 dark:hover:bg-white/15 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

