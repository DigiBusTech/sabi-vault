"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  Calendar,
  Layers,
  Clock,
  ToggleLeft,
  ToggleRight,
  X,
  Palette,
} from "lucide-react";
import { BroadcastNotification, BroadcastAudience, BroadcastTheme } from "@/types/broadcast";

const THEME_PRESETS: {
  id: BroadcastTheme;
  label: string;
  bgHex: string;
  textHex: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "info",
    label: "Info (Blue)",
    bgHex: "#2563EB",
    textHex: "#FFFFFF",
    desc: "Platform updates, release news",
    icon: Info,
  },
  {
    id: "success",
    label: "Success (Green)",
    bgHex: "#059669",
    textHex: "#FFFFFF",
    desc: "Feature launches, verifications",
    icon: CheckCircle2,
  },
  {
    id: "warning",
    label: "Warning (Amber)",
    bgHex: "#F59E0B",
    textHex: "#0F172A",
    desc: "Maintenance notices, warnings",
    icon: AlertTriangle,
  },
  {
    id: "danger",
    label: "Urgent (Red)",
    bgHex: "#DC2626",
    textHex: "#FFFFFF",
    desc: "Security advisories, critical alerts",
    icon: AlertCircle,
  },
  {
    id: "purple",
    label: "Sovereign (Purple)",
    bgHex: "#7C3AED",
    textHex: "#FFFFFF",
    desc: "GovTech & blockchain announcements",
    icon: Sparkles,
  },
  {
    id: "custom",
    label: "Custom Color",
    bgHex: "#0F172A",
    textHex: "#38BDF8",
    desc: "Custom background & text hex",
    icon: Palette,
  },
];

const AUDIENCE_OPTIONS: { id: BroadcastAudience; label: string; desc: string; badgeColor: string }[] = [
  { id: "all", label: "General (All Dashboards)", desc: "Appears for everyone (Citizens, Orgs, & Admins)", badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { id: "citizen", label: "Citizens / Users Only", desc: "Appears exclusively in individual talent vaults", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { id: "enterprise", label: "Organizations Only", desc: "Appears in employer & screening workspaces", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { id: "super_admin", label: "Super Admins Only", desc: "Internal infrastructure operational updates", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
];

export function BroadcastManager() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [theme, setTheme] = useState<BroadcastTheme>("info");
  const [customBgColor, setCustomBgColor] = useState("#1e293b");
  const [customTextColor, setCustomTextColor] = useState("#f8fafc");
  const [isDismissible, setIsDismissible] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState<number>(2);
  const [actionLabel, setActionLabel] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/broadcasts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err: any) {
      console.error("[BroadcastManager] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setAudience("all");
    setTheme("info");
    setCustomBgColor("#1e293b");
    setCustomTextColor("#f8fafc");
    setIsDismissible(true);
    setIsActive(true);
    setPriority(2);
    setActionLabel("");
    setActionUrl("");
    setExpiresAt("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (b: BroadcastNotification) => {
    setEditingId(b.id);
    setTitle(b.title);
    setMessage(b.message);
    setAudience(b.audience);
    setTheme(b.theme);
    setCustomBgColor(b.custom_bg_color || "#1e293b");
    setCustomTextColor(b.custom_text_color || "#f8fafc");
    setIsDismissible(b.is_dismissible);
    setIsActive(b.is_active);
    setPriority(b.priority || 1);
    setActionLabel(b.action_label || "");
    setActionUrl(b.action_url || "");
    setExpiresAt(b.expires_at ? b.expires_at.substring(0, 16) : "");
    setIsModalOpen(true);
  };

  const handleToggleActive = async (b: BroadcastNotification) => {
    try {
      const res = await fetch(`/api/v1/admin/broadcasts/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !b.is_active }),
      });
      if (res.ok) {
        setBroadcasts((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, is_active: !item.is_active } : item))
        );
      }
    } catch (err: any) {
      console.error("[BroadcastManager] Toggle error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this broadcast notification?")) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/broadcasts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBroadcasts((prev) => prev.filter((b) => b.id !== id));
        setStatusMessage({ type: "success", text: "Broadcast notification deleted." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to delete notification." });
    }
  };

  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both title and message." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      title: title.trim(),
      message: message.trim(),
      audience,
      theme,
      custom_bg_color: theme === "custom" ? customBgColor : null,
      custom_text_color: theme === "custom" ? customTextColor : null,
      is_dismissible: isDismissible,
      is_active: isActive,
      priority,
      action_label: actionLabel.trim() || null,
      action_url: actionUrl.trim() || null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      const endpoint = editingId ? `/api/v1/admin/broadcasts/${editingId}` : "/api/v1/admin/broadcasts";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save broadcast notification.");
      }

      setStatusMessage({
        type: "success",
        text: editingId ? "Broadcast notification updated." : "Broadcast notification published live!",
      });
      setIsModalOpen(false);
      resetForm();
      loadBroadcasts();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute live preview colors
  const activePreset = THEME_PRESETS.find((p) => p.id === theme) || THEME_PRESETS[0];
  const previewBg = theme === "custom" ? customBgColor : activePreset.bgHex;
  const previewText = theme === "custom" ? customTextColor : activePreset.textHex;
  const PreviewIcon = activePreset.icon;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Notification Broadcast Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Broadcast top-banner alerts to all dashboards, citizen vaults, or organization portals in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBroadcasts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Broadcasts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Broadcast</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button type="button" onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Layers className="w-4 h-4" />
            <span>Active & Scheduled Broadcasts ({broadcasts.length})</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            <span>Loading notifications...</span>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700 dark:text-slate-300">No broadcast notifications active</p>
            <p className="text-xs text-slate-400 mt-1">Create your first broadcast to publish a message across user screens.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {broadcasts.map((b) => {
              const aud = AUDIENCE_OPTIONS.find((a) => a.id === b.audience) || AUDIENCE_OPTIONS[0];
              const isExpired = b.expires_at && new Date(b.expires_at) < new Date();

              return (
                <div
                  key={b.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    !b.is_active || isExpired ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/30" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                      style={{
                        backgroundColor:
                          b.theme === "custom"
                            ? b.custom_bg_color || "#1e293b"
                            : THEME_PRESETS.find((p) => p.id === b.theme)?.bgHex || "#2563EB",
                      }}
                      title={`Theme: ${b.theme}`}
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {b.title}
                        </h3>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${aud.badgeColor}`}>
                          {aud.label.split(" ")[0]}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            !b.is_active
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              : isExpired
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          }`}
                        >
                          {!b.is_active ? "Inactive" : isExpired ? "Expired" : "Active Live"}
                        </span>

                        {b.priority > 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                            {b.priority === 3 ? "Urgent Priority" : "High Priority"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {b.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                        {b.action_label && (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                            <ExternalLink className="w-3 h-3 text-brand-green" />
                            CTA: {b.action_label} ({b.action_url})
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(b.created_at).toLocaleDateString()}
                        </span>
                        {b.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires: {new Date(b.expires_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        b.is_active
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                      title={b.is_active ? "Deactivate Broadcast" : "Activate Broadcast"}
                    >
                      {b.is_active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Broadcast"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Creation / Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Broadcast Notification" : "Publish Live Broadcast Notification"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE PREVIEW CARD */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Live WYSIWYG Banner Preview</span>
              </div>

              <div
                style={{
                  backgroundColor: previewBg,
                  color: previewText,
                  borderColor: `${previewBg}88`,
                }}
                className="w-full px-4 py-3 rounded-xl border shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="shrink-0 p-1 rounded-lg bg-black/15">
                    <PreviewIcon className="w-4 h-4" />
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <span className="font-semibold shrink-0">{title || "Notification Headline"}:</span>
                    <span className="truncate opacity-90">{message || "Your live announcement message will appear here on user screens..."}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {actionLabel && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-medium inline-flex items-center gap-1">
                      {actionLabel}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                  {isDismissible && <X className="w-4 h-4 opacity-70" />}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Upgrade or New GovTech Verification Rule"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Clear description displayed along the header alert bar..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              {/* Audience Targeting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience Scope *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map((aud) => (
                    <button
                      type="button"
                      key={aud.id}
                      onClick={() => setAudience(aud.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        audience === aud.id
                          ? "border-brand-green bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-brand-green"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">{aud.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{aud.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Color Palette */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alert Theme & Color Palette *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setTheme(p.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        theme === p.id
                          ? "border-brand-green bg-slate-50 dark:bg-slate-800 ring-2 ring-brand-green/30"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 ring-1 ring-black/10 shadow-xs"
                        style={{ backgroundColor: p.bgHex }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{p.label}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {theme === "custom" && (
                  <div className="grid grid-cols-2 gap-3 mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Background Color (Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customBgColor}
                          onChange={(e) => setCustomBgColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customBgColor}
                          onChange={(e) => setCustomBgColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Text Color (Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button CTA (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CTA Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="e.g. Verify Now or View Status"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="e.g. /dashboard/vault or https://..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Options: Dismissible, Priority, Expiration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={1}>Normal (Order 1)</option>
                    <option value={2}>High (Order 2)</option>
                    <option value={3}>Urgent (Top Stack)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auto-Expiration (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={isDismissible}
                      onChange={(e) => setIsDismissible(e.target.checked)}
                      className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Show Close (X) Icon
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Save Changes" : "Publish Live Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

