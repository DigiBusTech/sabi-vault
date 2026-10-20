import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { UserRole } from "@/lib/auth/auth_guard";

/**
 * Ensures any identifier format (custom string or UUID) is mapped to a valid
 * RFC4122 v4 UUID format for PostgreSQL UUID columns.
 */
export function toValidUuid(id: string): string {
  if (!id) return "00000000-0000-0000-0000-000000000000";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const hash = createHash("md5").update(id).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export interface UserSessionRecord {
  id: string;
  userUuid: string;
  role: UserRole;        // Preserved for token rotation — prevents privilege regression
  orgId?: string;        // Preserved for token rotation
  deviceFingerprint: string;
  refreshTokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  lastActiveAt: Date;
  createdAt: Date;
}


export interface AccessTokenPayload {
  sub: string; // user id
  email?: string;
  role: UserRole;
  orgId?: string;
  sessionId: string;
  deviceFingerprint: string;
  iat: number;
  exp: number;
}

import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  REFRESH_COOKIE_NAME,
  DEVICE_COOKIE_NAME,
} from "./constants";

export {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  REFRESH_COOKIE_NAME,
  DEVICE_COOKIE_NAME,
};

const INSECURE_DEV_FALLBACK = "sabi_profile_default_fallback_session_hmac_secret_32bytes!";

function getJwtSecret(): string {
  const secret =
    process.env.SESSION_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      // CRITICAL: In production, a missing secret is a hard startup failure.
      // This prevents token forgery via the known dev fallback string.
      throw new Error(
        "[SECURITY FATAL] SESSION_SIGNING_SECRET environment variable is not set. " +
        "All access tokens would be signed with a publicly known fallback secret. " +
        "Set SESSION_SIGNING_SECRET to a cryptographically random 64-character hex string."
      );
    }
    // Development fallback — acceptable only in local/test environments
    return INSECURE_DEV_FALLBACK;
  }

  return secret;
}

/**
 * Call this at app startup (e.g. in next.config.js or a global initializer)
 * to fail fast if the signing secret is not configured in production.
 */
export function assertSessionSecretConfigured(): void {
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.SESSION_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || secret === INSECURE_DEV_FALLBACK) {
      throw new Error(
        "[SECURITY FATAL] SESSION_SIGNING_SECRET is missing or uses the insecure development " +
        "fallback in a production environment. Set it to a cryptographically random 64-char hex string."
      );
    }
  }
}

// In-memory fallback session store persisted across Next.js worker threads and HMR reloads
const memorySessions: Map<string, UserSessionRecord> =
  (globalThis as any).__sabi_memory_sessions || new Map<string, UserSessionRecord>();
(globalThis as any).__sabi_memory_sessions = memorySessions;
const memorySecurityEvents: Array<{
  id: string;
  userUuid?: string;
  identifier?: string;
  eventType: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}> = [];

export function computeSha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Mint a short-lived, tamper-proof access token signed with HMAC-SHA256.
 */
export function createAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ACCESS_TOKEN_TTL_SECONDS;
  const fullPayload: AccessTokenPayload = { ...payload, iat, exp };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", getJwtSecret())
    .update(`${header}.${data}`)
    .digest("base64url");

  return `${header}.${data}.${signature}`;
}

/**
 * Cryptographically verify an incoming access token.
 */
export function verifyAccessToken(token: string): {
  isValid: boolean;
  payload?: AccessTokenPayload;
  error?: string;
} {
  if (!token || typeof token !== "string") {
    return { isValid: false, error: "Missing token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { isValid: false, error: "Malformed token format" };
  }

  const [header, data, signature] = parts;
  const expectedSig = createHmac("sha256", getJwtSecret())
    .update(`${header}.${data}`)
    .digest("base64url");

  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { isValid: false, error: "Invalid cryptographic token signature" };
  }

  try {
    const payload: AccessTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return { isValid: false, error: "Token has expired", payload };
    }

    return { isValid: true, payload };
  } catch {
    return { isValid: false, error: "Failed to parse token payload" };
  }
}

/**
 * Generate a cryptographically secure random refresh token.
 */
export function generateSecureRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate a persistent browser device ID.
 */
export function generateDeviceId(): string {
  return "dev_" + randomBytes(16).toString("hex");
}

/**
 * Check if the user has previously logged in with this device fingerprint.
 */
export async function isRecognizedDevice(userId: string, fingerprint: string): Promise<boolean> {
  const validUuid = toValidUuid(userId);
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("user_uuid", validUuid)
      .eq("device_fingerprint", fingerprint)
      .limit(1);

    if (!error && data && data.length > 0) {
      return true;
    }
  } catch {
    // Supabase unavailable, fallback to memory
  }

  let found = false;
  memorySessions.forEach((session) => {
    if ((session.userUuid === userId || session.userUuid === validUuid) && session.deviceFingerprint === fingerprint) {
      found = true;
    }
  });
  return found;
}

/**
 * Record a security event in the audit log.
 */
export async function logSecurityEvent(event: {
  userUuid?: string;
  identifier?: string;
  eventType: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const validUuid = event.userUuid ? toValidUuid(event.userUuid) : undefined;
  const item = {
    id: randomUUID(),
    userUuid: event.userUuid,
    identifier: event.identifier,
    eventType: event.eventType,
    deviceFingerprint: event.deviceFingerprint,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    metadata: event.metadata || {},
    createdAt: new Date(),
  };

  memorySecurityEvents.push(item);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("security_audit_events").insert({
      id: item.id,
      user_uuid: validUuid || null,
      identifier: event.identifier || null,
      event_type: event.eventType,
      device_fingerprint: event.deviceFingerprint || null,
      ip_address: event.ipAddress || null,
      user_agent: event.userAgent || null,
      metadata: event.metadata || {},
    });
  } catch {
    // Non-fatal
  }
}

/**
 * Enforces Single Session Policy (1 Device/Browser per User).
 * Deactivates all existing active sessions for the user ID.
 */
export async function enforceSingleSession(userId: string, exceptSessionId?: string): Promise<number> {
  const validUuid = toValidUuid(userId);
  let deactivatedCount = 0;

  memorySessions.forEach((session, id) => {
    if ((session.userUuid === userId || session.userUuid === validUuid) && session.isActive && id !== exceptSessionId) {
      session.isActive = false;
      deactivatedCount++;
    }
  });

  try {
    const supabase = createAdminSupabaseClient();
    let query = supabase
      .from("user_sessions")
      .update({ is_active: false })
      .eq("user_uuid", validUuid)
      .eq("is_active", true);

    if (exceptSessionId) {
      query = query.neq("id", exceptSessionId);
    }

    await query;
  } catch {
    // Non-fatal
  }

  return deactivatedCount;
}

/**
 * Register a new user session on login:
 * 1. Checks for unrecognized device and flags new device alerts.
 * 2. Enforces single active session rule by invalidating all prior sessions.
 * 3. Saves the active session row with hashed refresh token.
 */
export async function registerUserSession(params: {
  userId: string;
  email?: string;
  role: UserRole;
  orgId?: string;
  deviceFingerprint: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  isNewDevice: boolean;
}> {
  const { userId, email, role, orgId, deviceFingerprint, ipAddress, userAgent } = params;
  const validUuid = toValidUuid(userId);

  // 1. Detect if this is an unrecognized device
  const recognized = await isRecognizedDevice(userId, deviceFingerprint);
  const isNewDevice = !recognized;

  if (isNewDevice) {
    await logSecurityEvent({
      userUuid: userId,
      identifier: email,
      eventType: "NEW_DEVICE_LOGIN",
      deviceFingerprint,
      ipAddress,
      userAgent,
      metadata: { alert: "Login from unrecognized device or browser" },
    });
  }

  // 2. Invalidate previous sessions (Single-Session Enforcement)
  const terminatedCount = await enforceSingleSession(userId);
  if (terminatedCount > 0) {
    await logSecurityEvent({
      userUuid: userId,
      identifier: email,
      eventType: "SESSION_TERMINATED_CONCURRENT",
      deviceFingerprint,
      ipAddress,
      userAgent,
      metadata: { terminatedSessions: terminatedCount },
    });
  }

  // 3. Create new session with RFC4122 v4 UUID
  const sessionId = randomUUID();
  const refreshToken = generateSecureRefreshToken();
  const refreshTokenHash = computeSha256(refreshToken);
  const now = new Date();

  const sessionRecord: UserSessionRecord = {
    id: sessionId,
    userUuid: userId,
    role,     // Preserved so token rotation can restore the correct role
    orgId,    // Preserved so org context is maintained across refresh cycles
    deviceFingerprint,
    refreshTokenHash,
    ipAddress,
    userAgent,
    isActive: true,
    lastActiveAt: now,
    createdAt: now,
  };

  memorySessions.set(sessionId, sessionRecord);

  try {
    const supabase = createAdminSupabaseClient();
    const insertRes = await supabase.from("user_sessions").insert({
      id: sessionId,
      user_uuid: validUuid,
      device_fingerprint: deviceFingerprint,
      refresh_token_hash: refreshTokenHash,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      is_active: true,
      last_active_at: now.toISOString(),
      created_at: now.toISOString(),
    });
    if (insertRes.error) {
      console.warn("[Session] DB insert warning:", insertRes.error.message);
    }
  } catch (err) {
    console.warn("[Session] DB insert exception:", err);
  }

  // 4. Mint access token
  const accessToken = createAccessToken({
    sub: userId,
    email,
    role,
    orgId,
    sessionId,
    deviceFingerprint,
  });

  return {
    sessionId,
    accessToken,
    refreshToken,
    isNewDevice,
  };
}
/**
 * Silent Token Refresh:
 * Validates the refresh token against `user_sessions`.
 * If the session is inactive (e.g. terminated due to single-session policy), fails with SESSION_REVOKED.
 * Otherwise, generates a new refresh token (token rotation), issues a new access token, and updates last_active_at.
 */
export async function rotateSessionToken(
  rawRefreshToken: string,
  incomingFingerprint?: string
): Promise<{
  success: boolean;
  error?: string;
  code?: string;
  accessToken?: string;
  newRefreshToken?: string;
  session?: UserSessionRecord;
}> {
  if (!rawRefreshToken) {
    return { success: false, error: "Missing refresh token", code: "MISSING_REFRESH_TOKEN" };
  }

  const tokenHash = computeSha256(rawRefreshToken);
  let sessionRecord: UserSessionRecord | null = null;

  // 1. Try DB lookup
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("refresh_token_hash", tokenHash)
      .maybeSingle();

    if (!error && data) {
      sessionRecord = {
        id: data.id,
        userUuid: data.user_uuid,
        role: (data.role as import("@/lib/auth/auth_guard").UserRole) || "citizen", // GAP-1: restore persisted role
        orgId: data.org_id || undefined, // GAP-1: restore persisted org
        deviceFingerprint: data.device_fingerprint,
        refreshTokenHash: data.refresh_token_hash,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        isActive: data.is_active,
        lastActiveAt: new Date(data.last_active_at),
        createdAt: new Date(data.created_at),
        // GAP-8: expose absolute expiry from DB for enforcement below
        ...(data.absolute_expires_at ? { absoluteExpiresAt: new Date(data.absolute_expires_at) } : {}),
      } as UserSessionRecord & { absoluteExpiresAt?: Date };
    }
  } catch {
    // Non-fatal, check memory
  }

  // Fallback to memory
  if (!sessionRecord) {
    memorySessions.forEach((s) => {
      if (s.refreshTokenHash === tokenHash) {
        sessionRecord = s;
      }
    });
  }

  if (!sessionRecord) {
    return { success: false, error: "Session token not found", code: "INVALID_SESSION" };
  }

  // Single-session enforcement check: if an active session was revoked because of another login
  if (!sessionRecord.isActive) {
    return {
      success: false,
      error: "This session has been terminated because your account was logged in from another device/browser.",
      code: "SESSION_TERMINATED_CONCURRENT",
    };
  }

  // GAP-8 fix: Enforce absolute session expiry — blocks infinite rotation attacks.
  // Even if a refresh token is continuously rotated, the session must be re-authenticated after 30 days.
  const record = sessionRecord as UserSessionRecord & { absoluteExpiresAt?: Date };
  if (record.absoluteExpiresAt && new Date() > record.absoluteExpiresAt) {
    return {
      success: false,
      error: "Session has exceeded its maximum absolute lifetime (30 days). Please sign in again.",
      code: "SESSION_ABSOLUTE_EXPIRY",
    };
  }


  // Rotate tokens: generate new refresh token and new hash
  const newRefreshToken = generateSecureRefreshToken();
  const newRefreshTokenHash = computeSha256(newRefreshToken);
  const now = new Date();

  sessionRecord.refreshTokenHash = newRefreshTokenHash;
  sessionRecord.lastActiveAt = now;
  memorySessions.set(sessionRecord.id, sessionRecord);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("user_sessions")
      .update({
        refresh_token_hash: newRefreshTokenHash,
        last_active_at: now.toISOString(),
      })
      .eq("id", sessionRecord.id);
  } catch {
    // Non-fatal
  }

  // Mint new access token — use the role and orgId persisted in the session record
  // to prevent privilege regression (GAP-1 fix: was hardcoded "citizen")
  const accessToken = createAccessToken({
    sub: sessionRecord.userUuid,
    role: sessionRecord.role,     // Preserved from original login
    orgId: sessionRecord.orgId,   // Preserved from original login
    sessionId: sessionRecord.id,
    deviceFingerprint: incomingFingerprint || sessionRecord.deviceFingerprint,
  });


  return {
    success: true,
    accessToken,
    newRefreshToken,
    session: sessionRecord,
  };
}

/**
 * Explicitly invalidate session row upon logout or security event.
 */
export async function invalidateSession(rawRefreshToken: string): Promise<boolean> {
  if (!rawRefreshToken) return false;
  const hash = computeSha256(rawRefreshToken);

  memorySessions.forEach((session) => {
    if (session.refreshTokenHash === hash) {
      session.isActive = false;
    }
  });

  try {
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("user_sessions")
      .update({ is_active: false })
      .eq("refresh_token_hash", hash);
  } catch {
    // Non-fatal
  }

  return true;
}

/**
 * Get active session by ID or refresh token hash (used by guards and inspection).
 */
export async function getActiveSession(sessionId: string): Promise<UserSessionRecord | null> {
  const mem = memorySessions.get(sessionId);
  if (mem && mem.isActive) return mem;

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        userUuid: data.user_uuid,
        role: (data.role as import("@/lib/auth/auth_guard").UserRole) || "citizen",
        orgId: data.org_id || undefined,
        deviceFingerprint: data.device_fingerprint,
        refreshTokenHash: data.refresh_token_hash,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        isActive: data.is_active,
        lastActiveAt: new Date(data.last_active_at),
        createdAt: new Date(data.created_at),
      };
    }

  } catch {
    // Non-fatal
  }

  return null;
}

/**
 * Retrieve the currently active session record for a user, if one exists.
 */
export async function getActiveSessionForUser(userId: string): Promise<UserSessionRecord | null> {
  if (!userId) return null;
  const validUuid = toValidUuid(userId);

  let activeSessionForUser: UserSessionRecord | null = null;
  memorySessions.forEach((s) => {
    if ((s.userUuid === userId || s.userUuid === validUuid) && s.isActive) {
      activeSessionForUser = s;
    }
  });

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_uuid", validUuid)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const dbSession: UserSessionRecord = {
        id: data.id,
        userUuid: userId,
        role: (data.role || "citizen") as import("@/lib/auth/auth_guard").UserRole,
        orgId: data.org_id || undefined,
        deviceFingerprint: data.device_fingerprint,
        refreshTokenHash: data.refresh_token_hash,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        isActive: data.is_active,
        lastActiveAt: new Date(data.last_active_at),
        createdAt: new Date(data.created_at),
      };
      memorySessions.set(dbSession.id, dbSession);
      return dbSession;
    }
  } catch {
    // Fall through
  }

  return activeSessionForUser;
}

/**
 * Validates whether a given user and optional raw refresh token represents the currently
 * active session for that user under Single-Session Enforcement (1 device/browser policy).
 */
export async function validateActiveUserSession(
  userId: string,
  rawRefreshToken?: string | null
): Promise<{
  isValid: boolean;
  isTerminated: boolean;
  reason?: "SESSION_TERMINATED_CONCURRENT" | "NO_ACTIVE_SESSION" | "TOKEN_MISMATCH" | "EXPIRED";
  session?: UserSessionRecord;
}> {
  if (!userId) {
    return { isValid: false, isTerminated: false, reason: "NO_ACTIVE_SESSION" };
  }

  // 1. If refresh token is provided, check if its specific session record is active
  if (rawRefreshToken && /^[0-9a-f]{64}$/.test(rawRefreshToken)) {
    const tokenHash = computeSha256(rawRefreshToken);

    // Look up this specific token in memory
    let specificSession: UserSessionRecord | null = null;
    memorySessions.forEach((s) => {
      if (s.refreshTokenHash === tokenHash) specificSession = s;
    });

    // Look up in database if not found or to ensure consistency
    if (!specificSession) {
      try {
        const supabase = createAdminSupabaseClient();
        const { data } = await supabase
          .from("user_sessions")
          .select("*")
          .eq("refresh_token_hash", tokenHash)
          .maybeSingle();

        if (data) {
          specificSession = {
            id: data.id,
            userUuid: data.user_uuid,
            role: (data.role || "citizen") as import("@/lib/auth/auth_guard").UserRole,
            orgId: data.org_id || undefined,
            deviceFingerprint: data.device_fingerprint,
            refreshTokenHash: data.refresh_token_hash,
            ipAddress: data.ip_address,
            userAgent: data.user_agent,
            isActive: data.is_active,
            lastActiveAt: new Date(data.last_active_at),
            createdAt: new Date(data.created_at),
          };
          memorySessions.set(specificSession.id, specificSession);
        }
      } catch {
        // Fall through
      }
    }

    if (specificSession) {
      if (!specificSession.isActive) {
        // Session was explicitly terminated by single-session enforcement
        return {
          isValid: false,
          isTerminated: true,
          reason: "SESSION_TERMINATED_CONCURRENT",
          session: specificSession,
        };
      }
      return { isValid: true, isTerminated: false, session: specificSession };
    }
  }

  // 2. Check if the user has ANY active session in memory or DB
  const activeSessionForUser = await getActiveSessionForUser(userId);

  // If there is an active session for this user, but this client's token didn't match it (or client had no token)
  if (activeSessionForUser && rawRefreshToken) {
    const tokenHash = computeSha256(rawRefreshToken);
    if (activeSessionForUser.refreshTokenHash !== tokenHash) {
      return {
        isValid: false,
        isTerminated: true,
        reason: "SESSION_TERMINATED_CONCURRENT",
        session: activeSessionForUser,
      };
    }
  }

  return { isValid: true, isTerminated: false, session: activeSessionForUser || undefined };
}

