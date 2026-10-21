"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  ShieldCheck,
  LogOut,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getStoredAccessToken } from "@/lib/security/silent_refresh.client";
import { getDeviceFingerprint } from "@/lib/security/fingerprint.client";

interface DeviceItem {
  id: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: "mobile" | "desktop" | "tablet";
  displayName: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export function DeviceManager() {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDevices = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const { fingerprintHash } = await getDeviceFingerprint();
        if (fingerprintHash) headers["x-device-fingerprint"] = fingerprintHash;
      } catch {
        // Non-fatal
      }

      const res = await fetch("/api/v1/user/devices", {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Unable to load devices.");
      }

      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || "Failed to load device sessions.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleLogoutDevice = async (sessionId: string) => {
    setActionLoading(`logout_${sessionId}`);
    setNotice(null);

    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/user/devices", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ action: "logout", sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log out device.");

      setNotice({ type: "success", message: "Device session revoked successfully." });
      await fetchDevices(true);
    } catch (err: any) {
      setNotice({ type: "error", message: err.message || "Action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAllOther = async () => {
    if (!confirm("Are you sure you want to log out from all other devices?")) return;
    setActionLoading("logout_all");
    setNotice(null);

    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/user/devices", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ action: "logout_all" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log out devices.");

      setNotice({ type: "success", message: data.message || "Logged out all other devices." });
      await fetchDevices(true);
    } catch (err: any) {
      setNotice({ type: "error", message: err.message || "Action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDevice = async (sessionId: string) => {
    if (!confirm("Remove this device record from your security history?")) return;
    setActionLoading(`delete_${sessionId}`);
    setNotice(null);

    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/user/devices", {
        method: "DELETE",
        headers,
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete device record.");

      setNotice({ type: "success", message: "Device record removed from history." });
      await fetchDevices(true);
    } catch (err: any) {
      setNotice({ type: "error", message: err.message || "Action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all device history? This cannot be undone.")) return;
    setActionLoading("delete_all");
    setNotice(null);

    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/v1/user/devices", {
        method: "DELETE",
        headers,
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear devices.");

      setNotice({ type: "success", message: "All device records cleared." });
      await fetchDevices(true);
    } catch (err: any) {
      setNotice({ type: "error", message: err.message || "Action failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 60) return "Active just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getDeviceIcon = (type: DeviceItem["deviceType"]) => {
    if (type === "mobile") return Smartphone;
    if (type === "tablet") return Tablet;
    if (type === "desktop") return Laptop;
    return Globe;
  };

  const otherActiveCount = devices.filter((d) => d.isActive && !d.isCurrent).length;

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="font-poppins text-lg font-bold text-slate-900">
              Connected Devices &amp; Sessions
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            SabiProfile enforces strict Single-Session Security (1 active device at a time). Manage your authorized devices, view login locations, or revoke access remotely.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchDevices(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>

          {otherActiveCount > 0 && (
            <button
              type="button"
              onClick={handleLogoutAllOther}
              disabled={actionLoading === "logout_all"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out Other Devices ({otherActiveCount})</span>
            </button>
          )}

          {devices.length > 1 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={actionLoading === "delete_all"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-all hover:border-red-200 hover:text-red-600 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-60 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device List */}
      {!loading && devices.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
          <Globe className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-bold text-slate-700">No registered devices</p>
          <p className="mt-1 text-xs text-slate-500">
            Sign in on any desktop or mobile browser to register it in your sovereign enclave.
          </p>
        </div>
      )}

      {!loading && devices.length > 0 && (
        <div className="space-y-3">
          {devices.map((device) => {
            const Icon = getDeviceIcon(device.deviceType);
            const isLoggingOut = actionLoading === `logout_${device.id}`;
            const isDeleting = actionLoading === `delete_${device.id}`;

            return (
              <div
                key={device.id}
                className={`relative rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 ${
                  device.isCurrent
                    ? "border-emerald-300 ring-2 ring-emerald-500/10 shadow-sm"
                    : device.isActive
                    ? "border-emerald-200/80 shadow-xs"
                    : "border-slate-200 opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Column: Device Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        device.isCurrent
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : device.isActive
                          ? "border-slate-200 bg-slate-50 text-slate-700"
                          : "border-slate-200 bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {device.isActive && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-poppins text-sm font-bold text-slate-900 truncate">
                          {device.displayName}
                        </span>

                        {device.isCurrent && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            This Device (Active)
                          </span>
                        )}

                        {!device.isCurrent && device.isActive && (
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active Session
                          </span>
                        )}

                        {!device.isActive && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            Logged Out
                          </span>
                        )}
                      </div>

                      {/* Metadata: IP & Timestamps */}
                      <div className="mt-1.5 flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{device.ipAddress}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{formatRelativeTime(device.lastActiveAt)}</span>
                        </div>

                        <div className="hidden sm:inline text-slate-400 text-[10px] font-mono">
                          ID: {device.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!device.isCurrent && device.isActive && (
                      <button
                        type="button"
                        onClick={() => handleLogoutDevice(device.id)}
                        disabled={isLoggingOut}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                      </button>
                    )}

                    {!device.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDevice(device.id)}
                        disabled={isDeleting}
                        title="Delete device record"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

