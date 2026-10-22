/**
 * SabiProfile Enterprise Live Telemetry Engine
 *
 * Implements an in-memory high-throughput circular event buffer (up to 500 events)
 * to monitor all inbound API routes, AI agents, Base Sepolia blockchain commits,
 * cryptographic hashing, cloud storage events, and security authentications.
 *
 * Persisted on globalThis to ensure survivability across route evaluations.
 */

export type TelemetrySubsystem =
  | "API_ROUTER"
  | "AI_AGENTS"
  | "BLOCKCHAIN_LEDGER"
  | "CRYPTO_HASH"
  | "CLOUD_STORAGE"
  | "SECURITY_AUTH";

export type TelemetryLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR";

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  isoTime: string;
  subsystem: TelemetrySubsystem;
  level: TelemetryLevel;
  action: string;
  durationMs: number;
  statusCode?: number;
  errorCode?: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface TelemetryQueryFilter {
  subsystem?: string;
  level?: string;
  minDurationMs?: number;
  search?: string;
  limit?: number;
}

export interface TelemetryStats {
  totalEvents: number;
  bySubsystem: Record<TelemetrySubsystem, number>;
  byLevel: Record<TelemetryLevel, number>;
  avgDurationMs: number;
  errorRatePercent: number;
  lastUpdated: string;
}

const MAX_BUFFER_CAPACITY = 500;

class LiveTelemetryStore {
  private buffer: TelemetryEvent[] = [];

  constructor() {
    // Pre-populate with initial boot telemetry
    this.record({
      subsystem: "SECURITY_AUTH",
      level: "SUCCESS",
      action: "TELEMETRY_ENGINE_INITIALIZED",
      durationMs: 1,
      message: "SabiProfile Sovereign Live Telemetry Engine online (Capacity: 500 ring buffer).",
      metadata: { environment: process.env.NODE_ENV || "development", capacity: MAX_BUFFER_CAPACITY },
    });
  }

  public record(entry: {
    subsystem: TelemetrySubsystem;
    level: TelemetryLevel;
    action: string;
    durationMs?: number;
    statusCode?: number;
    errorCode?: string;
    message: string;
    metadata?: Record<string, any>;
    userId?: string;
  }): TelemetryEvent {
    const now = Date.now();
    const event: TelemetryEvent = {
      id: `tel_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      isoTime: new Date(now).toISOString(),
      subsystem: entry.subsystem,
      level: entry.level,
      action: entry.action,
      durationMs: entry.durationMs ?? 0,
      statusCode: entry.statusCode,
      errorCode: entry.errorCode,
      message: entry.message,
      metadata: entry.metadata,
      userId: entry.userId,
    };

    this.buffer.unshift(event);
    if (this.buffer.length > MAX_BUFFER_CAPACITY) {
      this.buffer.length = MAX_BUFFER_CAPACITY;
    }

    return event;
  }

  public query(filter: TelemetryQueryFilter = {}): TelemetryEvent[] {
    let result = this.buffer;

    if (filter.subsystem && filter.subsystem !== "ALL") {
      result = result.filter((e) => e.subsystem === filter.subsystem);
    }

    if (filter.level && filter.level !== "ALL") {
      result = result.filter((e) => e.level === filter.level);
    }

    if (filter.minDurationMs && filter.minDurationMs > 0) {
      result = result.filter((e) => e.durationMs >= filter.minDurationMs!);
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.action.toLowerCase().includes(term) ||
          e.message.toLowerCase().includes(term) ||
          (e.errorCode && e.errorCode.toLowerCase().includes(term)) ||
          (e.metadata && JSON.stringify(e.metadata).toLowerCase().includes(term))
      );
    }

    const limit = filter.limit && filter.limit > 0 ? filter.limit : 100;
    return result.slice(0, limit);
  }

  public clear(): void {
    this.buffer = [];
    this.record({
      subsystem: "SECURITY_AUTH",
      level: "INFO",
      action: "TELEMETRY_BUFFER_CLEARED",
      durationMs: 0,
      message: "Telemetry event buffer was manually cleared by administrator.",
    });
  }

  public getStats(): TelemetryStats {
    const total = this.buffer.length;
    const bySubsystem: Record<TelemetrySubsystem, number> = {
      API_ROUTER: 0,
      AI_AGENTS: 0,
      BLOCKCHAIN_LEDGER: 0,
      CRYPTO_HASH: 0,
      CLOUD_STORAGE: 0,
      SECURITY_AUTH: 0,
    };
    const byLevel: Record<TelemetryLevel, number> = {
      INFO: 0,
      SUCCESS: 0,
      WARN: 0,
      ERROR: 0,
    };

    let totalDuration = 0;

    for (const ev of this.buffer) {
      if (bySubsystem[ev.subsystem] !== undefined) bySubsystem[ev.subsystem]++;
      if (byLevel[ev.level] !== undefined) byLevel[ev.level]++;
      totalDuration += ev.durationMs;
    }

    return {
      totalEvents: total,
      bySubsystem,
      byLevel,
      avgDurationMs: total > 0 ? Math.round(totalDuration / total) : 0,
      errorRatePercent: total > 0 ? Math.round((byLevel.ERROR / total) * 100) : 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Global persistence across Next.js dev server hot reloads
const globalKey = Symbol.for("sabiprofile.live_telemetry_store");
const globalObj = globalThis as unknown as { [key: symbol]: LiveTelemetryStore };

if (!globalObj[globalKey]) {
  globalObj[globalKey] = new LiveTelemetryStore();
}

export const liveTelemetry = globalObj[globalKey];
