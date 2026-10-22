"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Info,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Trash2,
  X,
  Cpu,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import { TelemetryEvent, TelemetryStats, TelemetrySubsystem, TelemetryLevel } from "@/lib/telemetry/live_logger";

const SUBSYSTEM_META: Record<
  TelemetrySubsystem,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  API_ROUTER: { label: "API Router", icon: Server, color: "text-blue-700 bg-blue-50 border-blue-200" },
  AI_AGENTS: { label: "AI Agents", icon: Cpu, color: "text-purple-700 bg-purple-50 border-purple-200" },
  BLOCKCHAIN_LEDGER: { label: "Base Sepolia L2", icon: Database, color: "text-amber-700 bg-amber-50 border-amber-200" },
  CRYPTO_HASH: { label: "SHA-256 Hasher", icon: Lock, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CLOUD_STORAGE: { label: "Cloud Storage", icon: Layers, color: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  SECURITY_AUTH: { label: "Security & Auth", icon: ShieldAlert, color: "text-slate-700 bg-slate-100 border-slate-300" },
};

const LEVEL_STYLES: Record<TelemetryLevel, { bg: string; text: string; dot: string; icon: any }> = {
  SUCCESS: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
  ERROR: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500", icon: AlertTriangle },
  WARN: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500", icon: AlertTriangle },
  INFO: { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", dot: "bg-slate-400", icon: Info },
};

export function LiveTelemetryMonitor() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [subsystemFilter, setSubsystemFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null);
  const [pinging, setPinging] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  const fetchTelemetry = async () => {
    try {
      const params = new URLSearchParams();
      if (subsystemFilter !== "ALL") params.set("subsystem", subsystemFilter);
      if (levelFilter !== "ALL") params.set("level", levelFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "150");

      const res = await fetch(`/api/v1/admin/telemetry/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setStats(data.stats || null);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (!isLive) return;

    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isLive, subsystemFilter, levelFilter, search]);

  const handleTriggerProbe = async () => {
    setPinging(true);
    try {
      await fetch("/api/v1/admin/telemetry/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsystem: "API_ROUTER",
          level: "INFO",
          action: "DIAGNOSTIC_HEALTH_PROBE",
          durationMs: Math.floor(Math.random() * 25) + 5,
          message: "Manual probe dispatched from Super Admin Mission Control terminal.",
          metadata: { userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Browser" },
        }),
      });
      await fetchTelemetry();
    } finally {
      setPinging(false);
    }
  };

  const handleClearBuffer = async () => {
    if (!confirm("Are you sure you want to clear the live telemetry buffer?")) return;
    setClearing(true);
    try {
      await fetch("/api/v1/admin/telemetry/events", { method: "DELETE" });
      await fetchTelemetry();
      setSelectedEvent(null);
    } finally {
      setClearing(false);
    }
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify({ exportedAt: new Date().toISOString(), stats, events }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sabiprofile-telemetry-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="clean-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Streamed</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{stats?.totalEvents ?? events.length}</p>
          <span className="text-[10px] text-slate-400">Ring buffer: 500 capacity</span>
        </div>

        <div className="clean-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Latency</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{stats?.avgDurationMs ?? 0} ms</p>
          <span className="text-[10px] text-slate-400">Across all subsystems</span>
        </div>

        <div className="clean-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Error Rate</span>
            <AlertTriangle className={`h-4 w-4 ${(stats?.errorRatePercent ?? 0) > 0 ? "text-rose-500" : "text-slate-400"}`} />
          </div>
          <p className={`mt-2 font-mono text-2xl font-extrabold ${(stats?.errorRatePercent ?? 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {stats?.errorRatePercent ?? 0}%
          </p>
          <span className="text-[10px] text-slate-400">{stats?.byLevel.ERROR ?? 0} total errors logged</span>
        </div>

        <div className="clean-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Blockchain Commits</span>
            <Database className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{stats?.bySubsystem.BLOCKCHAIN_LEDGER ?? 0}</p>
          <span className="text-[10px] text-slate-400">Base Sepolia L2 & Sim</span>
        </div>

        <div className="clean-card rounded-xl p-4 col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Agents Calls</span>
            <Cpu className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900">{stats?.bySubsystem.AI_AGENTS ?? 0}</p>
          <span className="text-[10px] text-slate-400">Gemini 2.5 / Groq failover</span>
        </div>
      </div>

      {/* Control Bar & Filter Terminal */}
      <div className="clean-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isLive ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-300" />
              )}
            </span>
            <div>
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Live Subsystem Stream {isLive ? "(Real-Time 3s Polling)" : "(Stream Paused)"}
              </h2>
              <p className="text-[11px] text-slate-500">
                Monitoring API routes, Gemini AI agents, Base Sepolia blockchain hashes, and auth security.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                isLive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isLive ? "Pause Feed" : "Resume Live"}
            </button>

            <button
              type="button"
              onClick={handleTriggerProbe}
              disabled={pinging}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${pinging ? "animate-spin text-emerald-600" : ""}`} />
              Send Probe Ping
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              type="button"
              onClick={handleClearBuffer}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Buffer
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, error code, txHash, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Subsystem:</span>
            {["ALL", "API_ROUTER", "AI_AGENTS", "BLOCKCHAIN_LEDGER", "CRYPTO_HASH", "CLOUD_STORAGE", "SECURITY_AUTH"].map(
              (sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubsystemFilter(sub)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    subsystemFilter === sub
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub === "ALL" ? "All Systems" : SUBSYSTEM_META[sub as TelemetrySubsystem]?.label || sub}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Level:</span>
            {["ALL", "SUCCESS", "ERROR", "WARN", "INFO"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  levelFilter === lvl
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Live Stream Terminal List */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-[#0d1117] text-slate-100 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-[11px] text-slate-400">
            <span>TIMESTAMP / SUBSYSTEM / ACTION</span>
            <span>DURATION / STATUS</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-800/60 p-1">
            {events.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Info className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                No telemetry events matched the current filter criteria.
              </div>
            ) : (
              events.map((ev) => {
                const isErr = ev.level === "ERROR";
                const isWarn = ev.level === "WARN";
                const isSucc = ev.level === "SUCCESS";
                const timeStr = ev.isoTime ? ev.isoTime.slice(11, 23) : "";

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="group flex cursor-pointer items-start justify-between gap-3 px-3 py-2 transition-colors hover:bg-slate-800/80"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="shrink-0 text-slate-500 text-[10px] pt-0.5">{timeStr}</span>

                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isErr
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : isWarn
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : isSucc
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {ev.subsystem}
                      </span>

                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-slate-200 mr-2">{ev.action}</span>
                        <span className="text-slate-400 text-[11px]">{ev.message}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] text-slate-400">{ev.durationMs}ms</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          isErr
                            ? "bg-rose-900/60 text-rose-300"
                            : isWarn
                            ? "bg-amber-900/60 text-amber-300"
                            : isSucc
                            ? "bg-emerald-900/60 text-emerald-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ev.statusCode || ev.level}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* JSON Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden"
            style={{ animation: "dashCardIn 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      LEVEL_STYLES[selectedEvent.level].bg
                    } ${LEVEL_STYLES[selectedEvent.level].text}`}
                  >
                    {selectedEvent.level}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{selectedEvent.subsystem}</span>
                </div>
                <h3 className="mt-1 font-heading text-base font-extrabold text-slate-900">{selectedEvent.action}</h3>
                <p className="text-xs text-slate-500">{selectedEvent.isoTime}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Log Message</span>
                <p className="mt-1 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-800 font-mono">
                  {selectedEvent.message}
                </p>
              </div>

              {selectedEvent.errorCode && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Error Code</span>
                  <p className="mt-1 rounded-lg bg-rose-50 p-2 text-xs font-bold text-rose-700 font-mono">
                    {selectedEvent.errorCode}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Full Payload & Metadata (JSON)
                </span>
                <pre className="mt-1 max-h-60 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                  {JSON.stringify(
                    {
                      id: selectedEvent.id,
                      timestamp: selectedEvent.timestamp,
                      isoTime: selectedEvent.isoTime,
                      subsystem: selectedEvent.subsystem,
                      action: selectedEvent.action,
                      durationMs: selectedEvent.durationMs,
                      statusCode: selectedEvent.statusCode,
                      errorCode: selectedEvent.errorCode,
                      userId: selectedEvent.userId,
                      metadata: selectedEvent.metadata,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

