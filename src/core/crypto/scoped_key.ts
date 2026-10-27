import { createHmac, createHash, timingSafeEqual } from "crypto";
import { VaultCategory, FullUserVault } from "@/types/vault";
import { getConfigValueSync, getConfigValue } from "@/core/config/platform_config";

export interface ScopedApiKeyPayload {
  keyId: string;
  vaultId: string;
  allowedScopes: VaultCategory[];
  issuedAt: number;
  expiresAt: number;
  maxQueries: number;
  queryCount: number;
  recipientOrg?: string;
  sovereignNode: string;
}

export interface VerificationResult {
  isValid: boolean;
  error?: string;
  payload?: ScopedApiKeyPayload;
}

const REVOKED_KEY_IDS = new Set<string>();
const KEY_USAGE_TRACKER = new Map<string, number>();

export function getSecretKey(): string {
  // 1. Dynamic platform config (dashboard-managed via Super Admin dashboard)
  const configured = getConfigValueSync("security.api_signing_secret");
  const isInsecureDefault = configured === "sabi_profile_dev_insecure_secret_key_32bytes_min!";
  if (configured && !isInsecureDefault) {
    return configured;
  }

  // 2. Explicit environment variable override
  if (process.env.SABI_API_SIGNING_SECRET) {
    return process.env.SABI_API_SIGNING_SECRET;
  }

  // 3. Resilient Serverless Derivation:
  // In serverless production (e.g. Vercel), cold lambda instances start with empty in-memory caches.
  // Deriving a cryptographic 256-bit signing key from SUPABASE_SERVICE_ROLE_KEY guarantees:
  // - High-entropy cryptographic security (never the dev default)
  // - 100% availability across all lambdas without requiring manual dashboard toggling
  // - Never throws "Scoped API key signing is unavailable"
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createHash("sha256")
      .update(`sabi-scoped-key-signing:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
      .digest("hex");
  }

  if (process.env.NODE_ENV === "production") {
    console.error("[SECURITY] Scoped key signing secret must be configured in production (Super Admin dashboard or SUPABASE_SERVICE_ROLE_KEY).");
    return "";
  }
  return "sabi_profile_dev_insecure_secret_key_32bytes_min!";
}

export async function getSecretKeyAsync(): Promise<string> {
  try {
    const configured = await getConfigValue("security.api_signing_secret");
    const isInsecureDefault = configured === "sabi_profile_dev_insecure_secret_key_32bytes_min!";
    if (configured && !isInsecureDefault) {
      return configured;
    }
  } catch {
    // Non-fatal: fallback to synchronous resolution
  }
  return getSecretKey();
}

export function revokeKeyId(keyId: string): boolean {
  REVOKED_KEY_IDS.add(keyId);
  return true;
}

export function isKeyIdRevoked(keyId: string): boolean {
  return REVOKED_KEY_IDS.has(keyId);
}

export function recordKeyExecution(keyId: string): number {
  const current = KEY_USAGE_TRACKER.get(keyId) || 0;
  const next = current + 1;
  KEY_USAGE_TRACKER.set(keyId, next);
  return next;
}

export function getKeyUsageCount(keyId: string): number {
  return KEY_USAGE_TRACKER.get(keyId) || 0;
}

export function generateScopedApiKey(
  payload: Omit<ScopedApiKeyPayload, "queryCount">,
  secretKey: string = getSecretKey()
): string {
  if (!secretKey) {
    throw new Error("Scoped API key signing is unavailable because the signing secret is not configured.");
  }
  const fullPayload: ScopedApiKeyPayload = { ...payload, queryCount: 0 };
  const base64UrlPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  return `sbk_live_v1_${base64UrlPayload}.${hmac.digest("hex")}`;
}

export async function generateScopedApiKeyAsync(
  payload: Omit<ScopedApiKeyPayload, "queryCount">,
  secretKey?: string
): Promise<string> {
  const secret = secretKey || await getSecretKeyAsync();
  return generateScopedApiKey(payload, secret);
}

export function verifyScopedApiKey(
  rawKey: string,
  secretKey: string = getSecretKey(),
  expectedRecipientOrg?: string
): VerificationResult {
  if (!secretKey) {
    return { isValid: false, error: "Scoped API key verification is unavailable because the signing secret is not configured." };
  }
  if (!rawKey.startsWith("sbk_live_v1_")) {
    return { isValid: false, error: "Invalid key format or version mismatch" };
  }

  const parts = rawKey.substring("sbk_live_v1_".length).split(".");
  if (parts.length !== 2) {
    return { isValid: false, error: "Malformed API key structure" };
  }

  const [base64UrlPayload, providedSignature] = parts;
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  const expectedSignature = hmac.digest("hex");

  const bufExpected = Buffer.from(expectedSignature, "hex");
  const bufProvided = Buffer.from(providedSignature, "hex");

  let isMatch = (bufExpected.length === bufProvided.length && timingSafeEqual(bufExpected, bufProvided));

  // Multi-Key Graceful Verification:
  // If the key was signed with the server-derived secret (or dashboard secret), check alternative valid secret
  if (!isMatch && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const derivedKey = createHash("sha256")
      .update(`sabi-scoped-key-signing:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
      .digest("hex");
    if (derivedKey !== secretKey) {
      const altHmac = createHmac("sha256", derivedKey);
      altHmac.update(`sbk_live_v1.${base64UrlPayload}`);
      const altExpected = Buffer.from(altHmac.digest("hex"), "hex");
      if (altExpected.length === bufProvided.length && timingSafeEqual(altExpected, bufProvided)) {
        isMatch = true;
      }
    }
  }

  if (!isMatch) {
    return { isValid: false, error: "Cryptographic signature validation failed (Tampered Key)" };
  }

  try {
    const jsonString = Buffer.from(base64UrlPayload, "base64url").toString("utf8");
    const payload: ScopedApiKeyPayload = JSON.parse(jsonString);

    if (isKeyIdRevoked(payload.keyId)) {
      return { isValid: false, error: "API key has been revoked by candidate", payload };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > payload.expiresAt) {
      return { isValid: false, error: "API key has expired (TTL exceeded)", payload };
    }

    const trackedUsage = getKeyUsageCount(payload.keyId);
    const effectiveCount = Math.max(payload.queryCount, trackedUsage);
    if (payload.maxQueries > 0 && effectiveCount >= payload.maxQueries) {
      return { isValid: false, error: "API key query quota exhausted", payload };
    }

    if (payload.recipientOrg && expectedRecipientOrg && payload.recipientOrg !== expectedRecipientOrg) {
      return {
        isValid: false,
        error: `API key restricted to '${payload.recipientOrg}' (Received '${expectedRecipientOrg}')`,
        payload,
      };
    }

    return { isValid: true, payload: { ...payload, queryCount: effectiveCount } };
  } catch (err: any) {
    return { isValid: false, error: `Failed to decode payload: ${err.message}` };
  }
}

export async function verifyScopedApiKeyAsync(
  rawKey: string,
  secretKey?: string,
  expectedRecipientOrg?: string
): Promise<VerificationResult> {
  const secret = secretKey || await getSecretKeyAsync();
  return verifyScopedApiKey(rawKey, secret, expectedRecipientOrg);
}

export function filterVaultByScope(
  vault: FullUserVault,
  allowedScopes: VaultCategory[]
): Partial<FullUserVault> {
  const filtered: Partial<FullUserVault> = {
    userId: vault.userId,
    sovereignNode: vault.sovereignNode,
    residenceCountry: vault.residenceCountry,
    lastSyncedAt: vault.lastSyncedAt,
  };

  const scopeSet = new Set(allowedScopes);
  if (scopeSet.has("finance") && vault.finance) filtered.finance = vault.finance;
  if (scopeSet.has("portfolio") && vault.portfolio) filtered.portfolio = vault.portfolio;
  if (scopeSet.has("certifications") && vault.certifications) filtered.certifications = vault.certifications;
  if (scopeSet.has("academics") && vault.academics) filtered.academics = vault.academics;
  if (scopeSet.has("experience") && vault.experience) filtered.experience = vault.experience;
  if (scopeSet.has("achievements") && vault.achievements) filtered.achievements = vault.achievements;

  return filtered;
}
