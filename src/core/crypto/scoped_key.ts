import { createHmac, timingSafeEqual } from "crypto";
import { VaultCategory, FullUserVault } from "@/types/vault";

export interface ScopedApiKeyPayload {
  keyId: string;
  vaultId: string;
  allowedScopes: VaultCategory[];
  issuedAt: number; // Unix timestamp seconds
  expiresAt: number; // Unix timestamp seconds
  maxQueries: number;
  queryCount: number;
  recipientOrg?: string; // Optional binding to a specific organization
  sovereignNode: string; // Regional node location e.g. "ng-west-africa"
}

export interface VerificationResult {
  isValid: boolean;
  error?: string;
  payload?: ScopedApiKeyPayload;
}

const DEFAULT_SECRET = process.env.SABI_API_SIGNING_SECRET || "sabi_vault_dev_insecure_secret_key_32bytes_min!";

/**
 * Generates a scoped, signed cryptographic API key.
 * Format: `sbk_live_v1_<base64UrlPayload>.<signatureHex>`
 */
export function generateScopedApiKey(
  payload: Omit<ScopedApiKeyPayload, "queryCount">,
  secretKey: string = DEFAULT_SECRET
): string {
  const fullPayload: ScopedApiKeyPayload = {
    ...payload,
    queryCount: 0,
  };

  const jsonString = JSON.stringify(fullPayload);
  const base64UrlPayload = Buffer.from(jsonString).toString("base64url");

  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  const signature = hmac.digest("hex");

  return `sbk_live_v1_${base64UrlPayload}.${signature}`;
}

/**
 * Validates the cryptographic signature, expiration, and query quota of an incoming API key.
 */
export function verifyScopedApiKey(
  rawKey: string,
  secretKey: string = DEFAULT_SECRET
): VerificationResult {
  if (!rawKey.startsWith("sbk_live_v1_")) {
    return { isValid: false, error: "Invalid key format or version mismatch" };
  }

  const parts = rawKey.substring("sbk_live_v1_".length).split(".");
  if (parts.length !== 2) {
    return { isValid: false, error: "Malformed API key structure" };
  }

  const [base64UrlPayload, providedSignature] = parts;

  // Re-compute signature
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  const expectedSignature = hmac.digest("hex");

  // Timing safe equal comparison to prevent timing attacks
  const bufExpected = Buffer.from(expectedSignature, "hex");
  const bufProvided = Buffer.from(providedSignature, "hex");

  if (bufExpected.length !== bufProvided.length || !timingSafeEqual(bufExpected, bufProvided)) {
    return { isValid: false, error: "Cryptographic signature validation failed (Tampered Key)" };
  }

  // Parse payload
  try {
    const jsonString = Buffer.from(base64UrlPayload, "base64url").toString("utf8");
    const payload: ScopedApiKeyPayload = JSON.parse(jsonString);

    const currentTime = Math.floor(Date.now() / 1000);

    // Expiration check
    if (currentTime > payload.expiresAt) {
      return { isValid: false, error: "API key has expired (TTL exceeded)", payload };
    }

    // Query quota check
    if (payload.maxQueries > 0 && payload.queryCount >= payload.maxQueries) {
      return { isValid: false, error: "API key query quota exhausted", payload };
    }

    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, error: `Failed to decode payload: ${err.message}` };
  }
}

/**
 * Filters the user's full structured vault data according to the allowed scopes of the key.
 * Any un-permitted category is completely redacted from the payload before sending to enterprise.
 */
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

  if (scopeSet.has("finance") && vault.finance) {
    filtered.finance = vault.finance;
  }
  if (scopeSet.has("portfolio") && vault.portfolio) {
    filtered.portfolio = vault.portfolio;
  }
  if (scopeSet.has("certifications") && vault.certifications) {
    filtered.certifications = vault.certifications;
  }
  if (scopeSet.has("academics") && vault.academics) {
    filtered.academics = vault.academics;
  }
  if (scopeSet.has("experience") && vault.experience) {
    filtered.experience = vault.experience;
  }
  if (scopeSet.has("achievements") && vault.achievements) {
    filtered.achievements = vault.achievements;
  }

  return filtered;
}
