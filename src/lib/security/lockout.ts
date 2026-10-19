import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface LockoutState {
  identifier: string;
  failedAttempts: number;
  lockoutLevel: number; // 0: Normal, 1: 60s, 2: 1hr, 3: 24hr, 4: Permanent
  lockedUntil: Date | null;
  updatedAt: Date;
}

export interface LockoutCheckResult {
  isLocked: boolean;
  reason?: string;
  lockoutLevel: number;
  lockedUntil?: Date;
  remainingSeconds?: number;
}

export interface RecordAttemptResult {
  locked: boolean;
  lockoutLevel: number;
  lockedUntil?: Date;
  remainingSeconds?: number;
  failedAttempts: number;
}

// In-memory fallback store for development, sandboxing, or offline testing
const memoryLockoutStore = new Map<string, LockoutState>();

export function normalizeIdentifier(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Calculates progressive lockout duration based on failed attempts:
 * Tier 1: 3 attempts  -> 60 seconds
 * Tier 2: 6 attempts  -> 3,600 seconds (1 hour)
 * Tier 3: 9 attempts  -> 86,400 seconds (24 hours)
 * Tier 4: 12 attempts -> Permanent lockout (requires manual support verification)
 */
export function calculateLockoutTier(attempts: number): {
  level: number;
  durationSeconds: number;
  isPermanent: boolean;
} {
  if (attempts >= 12) {
    return { level: 4, durationSeconds: 3153600000, isPermanent: true }; // Permanent
  }
  if (attempts >= 9) {
    return { level: 3, durationSeconds: 86400, isPermanent: false }; // 24h
  }
  if (attempts >= 6) {
    return { level: 2, durationSeconds: 3600, isPermanent: false }; // 1h
  }
  if (attempts >= 3) {
    return { level: 1, durationSeconds: 60, isPermanent: false }; // 60s
  }
  return { level: 0, durationSeconds: 0, isPermanent: false };
}

/**
 * Read current lockout state from database with in-memory fallback.
 */
export async function getLockoutState(rawIdentifier: string): Promise<LockoutState> {
  const identifier = normalizeIdentifier(rawIdentifier);

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("login_security_state")
      .select("identifier, failed_attempts, lockout_level, locked_until, updated_at")
      .eq("identifier", identifier)
      .maybeSingle();

    if (!error && data) {
      return {
        identifier: data.identifier,
        failedAttempts: data.failed_attempts || 0,
        lockoutLevel: data.lockout_level || 0,
        lockedUntil: data.locked_until ? new Date(data.locked_until) : null,
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      };
    }
  } catch {
    // Continue to memory fallback
  }

  const existing = memoryLockoutStore.get(identifier);
  if (existing) {
    return existing;
  }

  return {
    identifier,
    failedAttempts: 0,
    lockoutLevel: 0,
    lockedUntil: null,
    updatedAt: new Date(),
  };
}

/**
 * Check if the account/identifier is currently locked out before attempting credential check.
 */
export async function checkLockout(rawIdentifier: string): Promise<LockoutCheckResult> {
  const state = await getLockoutState(rawIdentifier);
  const now = new Date();

  if (state.lockoutLevel === 4) {
    return {
      isLocked: true,
      reason: "Account permanently locked due to excessive failed attempts. Please contact support for identity verification.",
      lockoutLevel: 4,
      lockedUntil: state.lockedUntil || undefined,
      remainingSeconds: undefined,
    };
  }

  if (state.lockedUntil && state.lockedUntil.getTime() > now.getTime()) {
    const remainingSeconds = Math.ceil((state.lockedUntil.getTime() - now.getTime()) / 1000);
    return {
      isLocked: true,
      reason: `Account is temporarily locked due to repeated failed attempts. Please wait ${remainingSeconds} seconds before trying again.`,
      lockoutLevel: state.lockoutLevel,
      lockedUntil: state.lockedUntil,
      remainingSeconds,
    };
  }

  return {
    isLocked: false,
    lockoutLevel: state.lockoutLevel,
  };
}

/**
 * Record a failed authentication attempt and update lockout tiers accordingly.
 */
export async function recordFailedAttempt(rawIdentifier: string): Promise<RecordAttemptResult> {
  const identifier = normalizeIdentifier(rawIdentifier);
  const currentState = await getLockoutState(identifier);
  const nextAttempts = currentState.failedAttempts + 1;
  const tier = calculateLockoutTier(nextAttempts);

  const now = new Date();
  let lockedUntil: Date | null = null;
  if (tier.level > 0) {
    lockedUntil = new Date(now.getTime() + tier.durationSeconds * 1000);
  }

  const updatedState: LockoutState = {
    identifier,
    failedAttempts: nextAttempts,
    lockoutLevel: tier.level,
    lockedUntil,
    updatedAt: now,
  };

  memoryLockoutStore.set(identifier, updatedState);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("login_security_state").upsert({
      identifier,
      failed_attempts: nextAttempts,
      lockout_level: tier.level,
      locked_until: lockedUntil ? lockedUntil.toISOString() : null,
      updated_at: now.toISOString(),
    });
  } catch {
    // Non-fatal fallback
  }

  const remainingSeconds = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000))
    : undefined;

  return {
    locked: tier.level > 0,
    lockoutLevel: tier.level,
    lockedUntil: lockedUntil || undefined,
    remainingSeconds,
    failedAttempts: nextAttempts,
  };
}

/**
 * Reset lockout state upon successful authentication.
 * If account was previously in Tier 4, reset is forbidden through normal login.
 */
export async function resetLockout(rawIdentifier: string): Promise<void> {
  const identifier = normalizeIdentifier(rawIdentifier);
  const current = await getLockoutState(identifier);

  if (current.lockoutLevel === 4) {
    return;
  }

  const resetState: LockoutState = {
    identifier,
    failedAttempts: 0,
    lockoutLevel: 0,
    lockedUntil: null,
    updatedAt: new Date(),
  };

  memoryLockoutStore.set(identifier, resetState);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("login_security_state").upsert({
      identifier,
      failed_attempts: 0,
      lockout_level: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Support / Admin unlock for Tier 4 permanently locked accounts or manual assistance.
 */
export async function unlockAccount(rawIdentifier: string): Promise<{ success: boolean; message: string }> {
  const identifier = normalizeIdentifier(rawIdentifier);

  const resetState: LockoutState = {
    identifier,
    failedAttempts: 0,
    lockoutLevel: 0,
    lockedUntil: null,
    updatedAt: new Date(),
  };

  memoryLockoutStore.set(identifier, resetState);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("login_security_state").upsert({
      identifier,
      failed_attempts: 0,
      lockout_level: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal
  }

  return {
    success: true,
    message: `Account '${identifier}' has been successfully unlocked and lockout counters reset.`,
  };
}
// ── IP-LEVEL RATE LIMITING (GAP-7 Remediation) ──────────────────────────────
// Mitigates distributed credential stuffing where attackers rotate accounts
// across the same IP address.

interface IpAttemptRecord {
  failures: number;
  windowStart: number;
  blockedUntil?: number;
}

const memoryIpStore = new Map<string, IpAttemptRecord>();
const MAX_IP_FAILURES = 20; // 20 failures across accounts
const IP_WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const IP_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15-minute block

export function checkIpRateLimit(ip: string): { isBlocked: boolean; retryAfterSeconds?: number } {
  const normalizedIp = ip.trim();
  const record = memoryIpStore.get(normalizedIp);
  const now = Date.now();

  if (!record) {
    return { isBlocked: false };
  }

  // Check if IP is currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { isBlocked: true, retryAfterSeconds: remainingSeconds };
  }

  // Check if sliding window has elapsed
  if (now - record.windowStart > IP_WINDOW_MS) {
    memoryIpStore.delete(normalizedIp);
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

export function recordIpFailure(ip: string): { isBlocked: boolean; retryAfterSeconds?: number } {
  const normalizedIp = ip.trim();
  const now = Date.now();
  let record = memoryIpStore.get(normalizedIp);

  if (!record || now - record.windowStart > IP_WINDOW_MS) {
    record = { failures: 1, windowStart: now };
    memoryIpStore.set(normalizedIp, record);
    return { isBlocked: false };
  }

  record.failures += 1;

  if (record.failures >= MAX_IP_FAILURES) {
    record.blockedUntil = now + IP_BLOCK_DURATION_MS;
    const retryAfter = Math.ceil(IP_BLOCK_DURATION_MS / 1000);
    return { isBlocked: true, retryAfterSeconds: retryAfter };
  }

  return { isBlocked: false };
}

export function resetIpFailures(ip: string): void {
  memoryIpStore.delete(ip.trim());
}

