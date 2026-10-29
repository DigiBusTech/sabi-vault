/**
 * SabiProfile Enterprise Live Telemetry Engine
 *
 * Implements a resilient dual-layer telemetry system:
 * 1. Persistent Storage: High-durability PostgreSQL/Supabase storage (`system_telemetry_events`)
 *    with an automatic 48-hour (2-day) retention lifecycle.
 * 2. In-Memory Ring Buffer: Sub-millisecond circular event buffer (up to 500 events) on globalThis
 *    for zero-latency local caching and offline fallback.
 *
 * Captures all inbound API routes, multi-agent AI executions, Base Sepolia blockchain commits,
 * cryptographic hashing, cloud storage events, and security authentications.
 */

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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
const RETENTION_MS = 2 * 24 * 60 * 60 * 1000; // Exactly 2 Days (48 Hours)
const PRUNE_THROTTLE_MS = 5 * 60 * 1000; // Prune at most once every 5 minutes

class LiveTelemetryStore {
  private buffer: TelemetryEvent[] = [];
  private lastPruneTime = 0;

  constructor() {
    // Pre-populate with initial boot telemetry
    this.record({
      subsystem: "SECURITY_AUTH",
      level: "SUCCESS",
      action: "TELEMETRY_ENGINE_INITIALIZED",
      durationMs: 1,
      message: "SabiProfile Sovereign Live Telemetry Engine online (Persistent Supabase + In-Memory Buffer, 48h Retention).",
      metadata: { environment: process.env.NODE_ENV || "development", capacity: MAX_BUFFER_CAPACITY, retentionDays: 2 },
    });
  }

  /**
   * Records a telemetry event to in-memory buffer and asynchronously persists to Supabase.
   */
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
      id: `tel_${now}_${Math.random().toString(36).substring(2, 8)}`,
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

    // 1. In-Memory Ring Buffer Cache
    this.buffer.unshift(event);
    if (this.buffer.length > MAX_BUFFER_CAPACITY) {
      this.buffer.length = MAX_BUFFER_CAPACITY;
    }

    // 2. Asynchronous Non-Blocking Persistent Write to Supabase
    this.persistEventAsync(event).catch(() => {});

    // 3. Periodic Background Pruning of events older than 2 days
    if (now - this.lastPruneTime > PRUNE_THROTTLE_MS) {
      this.lastPruneTime = now;
      this.pruneExpiredEventsAsync().catch(() => {});
    }

    return event;
  }

  /**
   * Persists a telemetry event to Supabase system_telemetry_events.
   */
  private async persistEventAsync(event: TelemetryEvent): Promise<void> {
    try {
      const admin = createAdminSupabaseClient();
      await admin.from("system_telemetry_events").insert({
        id: event.id,
        timestamp: event.timestamp,
        iso_time: event.isoTime,
        subsystem: event.subsystem,
        level: event.level,
        action: event.action,
        duration_ms: event.durationMs,
        status_code: event.statusCode ?? null,
        error_code: event.errorCode ?? null,
        message: event.message,
        metadata: event.metadata ?? {},
        user_id: event.userId ?? null,
        created_at: event.isoTime,
      });
    } catch {
      // Graceful fallback to in-memory ring buffer if database is offline or unmigrated
    }
  }

  /**
   * Automatically deletes events older than 2 days (48 hours) from both Supabase and memory.
   */
  public async pruneExpiredEventsAsync(): Promise<number> {
    const cutoffTime = new Date(Date.now() - RETENTION_MS).toISOString();
    let deletedCount = 0;

    // Prune in-memory buffer
    const cutoffTimestamp = Date.now() - RETENTION_MS;
    this.buffer = this.buffer.filter((e) => e.timestamp >= cutoffTimestamp);

    // Prune Supabase table
    try {
      const admin = createAdminSupabaseClient();
      const { error, count } = await admin
        .from("system_telemetry_events")
        .delete({ count: "exact" })
        .lt("created_at", cutoffTime);

      if (!error && typeof count === "number") {
        deletedCount = count;
      }
    } catch {
      // Ignore database prune errors
    }

    return deletedCount;
  }

  /**
   * Queries telemetry events asynchronously from Supabase with fallback to in-memory buffer.
   */
  public async queryAsync(filter: TelemetryQueryFilter = {}): Promise<TelemetryEvent[]> {
    try {
      const admin = createAdminSupabaseClient();
      const cutoffTime = new Date(Date.now() - RETENTION_MS).toISOString();

      let query = admin
        .from("system_telemetry_events")
        .select("*")
        .gte("created_at", cutoffTime)
        .order("created_at", { ascending: false });

      if (filter.subsystem && filter.subsystem !== "ALL") {
        query = query.eq("subsystem", filter.subsystem);
      }

      if (filter.level && filter.level !== "ALL") {
        query = query.eq("level", filter.level);
      }

      if (filter.minDurationMs && filter.minDurationMs > 0) {
        query = query.gte("duration_ms", filter.minDurationMs);
      }

      if (filter.search && filter.search.trim()) {
        const term = filter.search.trim();
        query = query.or(`action.ilike.%${term}%,message.ilike.%${term}%,error_code.ilike.%${term}%`);
      }

      const limit = filter.limit && filter.limit > 0 ? Math.min(filter.limit, 500) : 100;
      query = query.limit(limit);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          timestamp: Number(row.timestamp),
          isoTime: row.iso_time || row.created_at,
          subsystem: row.subsystem as TelemetrySubsystem,
          level: row.level as TelemetryLevel,
          action: row.action,
          durationMs: row.duration_ms || 0,
          statusCode: row.status_code ?? undefined,
          errorCode: row.error_code ?? undefined,
          message: row.message,
          metadata: row.metadata,
          userId: row.user_id ?? undefined,
        }));
      }
    } catch {
      // Fall through to in-memory buffer
    }

    return this.query(filter);
  }

  /**
   * Synchronous query against in-memory buffer.
   */
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

  /**
   * Asynchronously calculates aggregated telemetry statistics from Supabase across the 48-hour window.
   */
  public async getStatsAsync(): Promise<TelemetryStats> {
    try {
      const admin = createAdminSupabaseClient();
      const cutoffTime = new Date(Date.now() - RETENTION_MS).toISOString();

      const { data, error } = await admin
        .from("system_telemetry_events")
        .select("subsystem, level, duration_ms")
        .gte("created_at", cutoffTime);

      if (!error && Array.isArray(data) && data.length > 0) {
        const total = data.length;
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
        for (const row of data) {
          const sub = row.subsystem as TelemetrySubsystem;
          const lvl = row.level as TelemetryLevel;
          if (bySubsystem[sub] !== undefined) bySubsystem[sub]++;
          if (byLevel[lvl] !== undefined) byLevel[lvl]++;
          totalDuration += row.duration_ms || 0;
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
    } catch {
      // Fall through to in-memory stats
    }

    return this.getStats();
  }

  /**
   * Synchronous in-memory statistics.
   */
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

  /**
   * Clears telemetry buffer both in-memory and in Supabase.
   */
  public async clearAsync(): Promise<void> {
    this.buffer = [];
    this.record({
      subsystem: "SECURITY_AUTH",
      level: "INFO",
      action: "TELEMETRY_BUFFER_CLEARED",
      durationMs: 0,
      message: "Telemetry event buffer was manually cleared by administrator.",
    });

    try {
      const admin = createAdminSupabaseClient();
      await admin.from("system_telemetry_events").delete().neq("id", "none");
    } catch {
      // Ignore database clear errors
    }
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
}

// Global persistence across Next.js dev server hot reloads
const globalKey = Symbol.for("sabiprofile.live_telemetry_store");
const globalObj = globalThis as unknown as { [key: symbol]: LiveTelemetryStore };

if (!globalObj[globalKey]) {
  globalObj[globalKey] = new LiveTelemetryStore();
}

export const liveTelemetry = globalObj[globalKey];
export const telemetryLogger = liveTelemetry;
