import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Sabi Vault Dynamic Platform Configuration
 *
 * Single source of truth for runtime configuration, managed from the
 * Super Admin dashboard instead of environment variables.
 *
 * Resolution order per key:
 *   1. In-memory cache (hot, write-through on update)
 *   2. Supabase `platform_config` table (AES-256-GCM encrypted at rest)
 *   3. Legacy environment variable (one-time migration seed into the table)
 *   4. Registered default
 *
 * Only the Supabase connection keys remain in the server environment; the
 * encryption key is derived from SUPABASE_SERVICE_ROLE_KEY so no additional
 * secret ever needs to live outside the dashboard.
 */

export type ConfigCategory = "security" | "blockchain" | "ai" | "integrations" | "billing" | "nodes";

export interface ConfigKeyMeta {
  key: string;
  label: string;
  description: string;
  category: ConfigCategory;
  sensitive: boolean;
  envVar?: string;
  defaultValue?: string;
}

export type ConfigSource = "dashboard" | "environment" | "default" | "unset";

export interface ConfigListEntry extends ConfigKeyMeta {
  maskedValue: string;
  source: ConfigSource;
  updatedAt: string | null;
  updatedBy: string | null;
}

export const CONFIG_REGISTRY: ConfigKeyMeta[] = [
  // --- Security ---
  {
    key: "security.api_signing_secret",
    label: "Scoped Key Signing Secret",
    description: "HMAC-SHA256 secret signing every citizen scoped API key (sbk_live_v1). Rotating invalidates all outstanding keys.",
    category: "security",
    sensitive: true,
    envVar: "SABI_API_SIGNING_SECRET",
    defaultValue: "sabi_vault_dev_insecure_secret_key_32bytes_min!",
  },
  {
    key: "security.admin_master_key",
    label: "Admin Master Key",
    description: "Break-glass M2M credential for admin API access (X-Sabi-Admin-Key). Dashboard sessions authenticate via Supabase instead.",
    category: "security",
    sensitive: true,
    envVar: "SABI_ADMIN_MASTER_KEY",
  },

  // --- Blockchain ---
  {
    key: "blockchain.base_sepolia_rpc",
    label: "Base Sepolia RPC URL",
    description: "JSON-RPC endpoint used by the ledger client for hash anchoring and verification.",
    category: "blockchain",
    sensitive: false,
    envVar: "BASE_SEPOLIA_RPC",
    defaultValue: "https://sepolia.base.org",
  },
  {
    key: "blockchain.registry_contract_address",
    label: "Registry Contract Address",
    description: "Deployed SabiVaultRegistry.sol address. The placeholder address keeps the ledger in local-simulation mode.",
    category: "blockchain",
    sensitive: false,
    envVar: "REGISTRY_CONTRACT_ADDRESS",
    defaultValue: "0x1234567890123456789012345678901234567890",
  },
  {
    key: "blockchain.splitter_contract_address",
    label: "Revenue Splitter Contract Address",
    description: "Deployed SabiRevenueSplitter.sol address executing the 60/40 GovTech micro-transaction split.",
    category: "blockchain",
    sensitive: false,
    envVar: "SPLITTER_CONTRACT_ADDRESS",
    defaultValue: "0x0987654321098765432109876543210987654321",
  },
  {
    key: "blockchain.signer_private_key",
    label: "Ledger Signer Private Key",
    description: "EVM private key paying gas for on-chain hash commits. Leave unset to stay in testnet simulation.",
    category: "blockchain",
    sensitive: true,
    envVar: "BASE_SEPOLIA_SIGNER_PRIVATE_KEY",
  },
  {
    key: "blockchain.simulation_mode",
    label: "Blockchain Simulation Mode",
    description: "'true' forces local ledger simulation in non-production. Never enable in production.",
    category: "blockchain",
    sensitive: false,
    envVar: "SABI_BLOCKCHAIN_SIMULATION",
    defaultValue: "true",

  },

  // --- AI gateways ---
  {
    key: "ai.gemini_api_key",
    label: "Gemini API Key",
    description: "Primary LLM gateway (Gemini 1.5 Flash) for document structuring and RAG evaluation.",
    category: "ai",
    sensitive: true,
    envVar: "GEMINI_API_KEY",
  },
  {
    key: "ai.groq_api_key",
    label: "Groq API Key",
    description: "Secondary failover gateway (LLaMA 3.3 70B, low latency free tier).",
    category: "ai",
    sensitive: true,
    envVar: "GROQ_API_KEY",
  },
  {
    key: "ai.openai_api_key",
    label: "OpenAI API Key",
    description: "Tertiary failover gateway (GPT-4o-mini).",
    category: "ai",
    sensitive: true,
    envVar: "OPENAI_API_KEY",
  },

  // --- Cloud integrations ---
  {
    key: "integrations.google_drive_client_id",
    label: "Google Drive Client ID",
    description: "OAuth client ID for read-only Google Drive linking (ephemeral document sync).",
    category: "integrations",
    sensitive: false,
    envVar: "GOOGLE_DRIVE_CLIENT_ID",
  },
  {
    key: "integrations.google_drive_client_secret",
    label: "Google Drive Client Secret",
    description: "OAuth client secret exchanged server-side during the Drive consent flow.",
    category: "integrations",
    sensitive: true,
    envVar: "GOOGLE_DRIVE_CLIENT_SECRET",
  },
  {
    key: "integrations.google_drive_redirect_uri",
    label: "Google Drive Redirect URI",
    description: "OAuth callback URL registered in the Google Cloud console.",
    category: "integrations",
    sensitive: false,
    envVar: "NEXT_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI",
  },
  {
    key: "integrations.dropbox_client_id",
    label: "Dropbox Client ID",
    description: "OAuth app key for read-only Dropbox linking.",
    category: "integrations",
    sensitive: false,
    envVar: "DROPBOX_CLIENT_ID",
  },
  {
    key: "integrations.dropbox_client_secret",
    label: "Dropbox Client Secret",
    description: "OAuth app secret exchanged server-side during the Dropbox consent flow.",
    category: "integrations",
    sensitive: true,
    envVar: "DROPBOX_CLIENT_SECRET",
  },
  {
    key: "integrations.dropbox_redirect_uri",
    label: "Dropbox Redirect URI",
    description: "OAuth callback URL registered in the Dropbox app console.",
    category: "integrations",
    sensitive: false,
    envVar: "DROPBOX_REDIRECT_URI",
  },

  // --- Billing ---
  {
    key: "billing.standard_query_fee_usd",
    label: "Standard Query Fee (USD)",
    description: "Per-evaluation fee charged to enterprises for a scoped candidate query.",
    category: "billing",
    sensitive: false,
    defaultValue: "1.00",
  },
  {
    key: "billing.platform_fee_percent",
    label: "Platform Fee Percent",
    description: "Share of each query fee routed to the Sabi platform treasury (default 60).",
    category: "billing",
    sensitive: false,
    defaultValue: "60",
  },
  {
    key: "billing.sovereign_host_fee_percent",
    label: "Sovereign Host Fee Percent",
    description: "Share of each query fee routed to the regional sovereign node host (default 40).",
    category: "billing",
    sensitive: false,
    defaultValue: "40",
  },

  // --- Sovereign nodes ---
  {
    key: "nodes.ng_west_africa_url",
    label: "West Africa Node Endpoint",
    description: "Sovereign database node endpoint for NDPC (Nigeria / ECOWAS) residency partition.",
    category: "nodes",
    sensitive: false,
    envVar: "SOVEREIGN_NODE_NG_URL",
    defaultValue: "https://ng-node.sabi-vault.internal",
  },
  {
    key: "nodes.eu_central_url",
    label: "EU Central Node Endpoint",
    description: "Sovereign database node endpoint for the GDPR (European Union) residency partition.",
    category: "nodes",
    sensitive: false,
    envVar: "SOVEREIGN_NODE_EU_URL",
    defaultValue: "https://eu-node.sabi-vault.internal",
  },
  {
    key: "nodes.na_east_url",
    label: "North America Node Endpoint",
    description: "Sovereign database node endpoint for the US / Canada residency partition.",
    category: "nodes",
    sensitive: false,
    envVar: "SOVEREIGN_NODE_NA_URL",
    defaultValue: "https://na-node.sabi-vault.internal",
  },
];

const REGISTRY_BY_KEY = new Map(CONFIG_REGISTRY.map((m) => [m.key, m]));

// ---------------------------------------------------------------------------
// Encryption (AES-256-GCM, key derived from the Supabase service role secret)
// ---------------------------------------------------------------------------

function getKeyBuffer(): Buffer | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createHash("sha256").update(`sabi-platform-config-v1:${serviceKey}`).digest();
}

export function encryptConfigValue(plainText: string): string {
  const keyBuffer = getKeyBuffer();
  if (!keyBuffer) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to persist configuration.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuffer, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptConfigValue(cipherString: string): string {
  const keyBuffer = getKeyBuffer();
  if (!keyBuffer || !cipherString.includes(":")) return "";
  try {
    const [ivHex, authTagHex, encrypted] = cipherString.split(":");
    const decipher = createDecipheriv("aes-256-gcm", keyBuffer, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface CacheEntry {
  value: string;
  source: Exclude<ConfigSource, "unset">;
  updatedAt: string | null;
  updatedBy: string | null;
}

const cache = new Map<string, CacheEntry>();

function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length < 10) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  return `${value.substring(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${value.substring(value.length - 4)}`;
}

function resolveFallback(meta: ConfigKeyMeta): { value: string; source: ConfigSource } {
  const envValue = meta.envVar ? process.env[meta.envVar] : undefined;
  if (envValue) return { value: envValue, source: "environment" };
  if (meta.defaultValue !== undefined) return { value: meta.defaultValue, source: "default" };
  return { value: "", source: "unset" };
}

/**
 * Synchronous accessor for legacy sync consumers (signing, gateways).
 * Uses the hot cache, then env, then the registered default. The cache is
 * warmed by any admin route call or `primeConfigCache`.
 */
export function getConfigValueSync(key: string): string {
  const meta = REGISTRY_BY_KEY.get(key);
  const cached = cache.get(key);
  if (cached) return cached.value;
  if (!meta) return "";
  return resolveFallback(meta).value;
}

async function loadRow(key: string): Promise<CacheEntry | null> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return null; // service role unconfigured (build time / local without env)
  }
  try {
    const { data, error } = await admin
      .from("platform_config")
      .select("value_encrypted, updated_at, updated_by")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    const value = decryptConfigValue(data.value_encrypted);
    return { value, source: "dashboard", updatedAt: data.updated_at, updatedBy: data.updated_by };
  } catch {
    return null;
  }
}

/**
 * One-time migration path: when a key has no dashboard value but a legacy
 * environment variable exists, persist it encrypted so the env file can be
 * pruned without losing configuration.
 */
async function seedFromEnv(key: string, meta: ConfigKeyMeta): Promise<CacheEntry | null> {
  const envValue = meta.envVar ? process.env[meta.envVar] : undefined;
  if (!envValue) return null;
  try {
    await setConfigValue(key, envValue, "env-migration");
    return cache.get(key) ?? null;
  } catch {
    return null;
  }
}

/**
 * Async accessor: dashboard value (decrypted), env fallback (with one-time
 * seeding), then the registered default.
 */
export async function getConfigValue(key: string): Promise<string> {
  const meta = REGISTRY_BY_KEY.get(key);
  if (!meta) return "";

  const cached = cache.get(key);
  if (cached && cached.source === "dashboard") return cached.value;

  const row = await loadRow(key);
  if (row) {
    cache.set(key, row);
    return row.value;
  }

  const seeded = await seedFromEnv(key, meta);
  if (seeded) return seeded.value;

  return resolveFallback(meta).value;
}

/**
 * Persists a configuration value (encrypted) and updates the hot cache.
 * Values take effect immediately for all consumers.
 */
export async function setConfigValue(
  key: string,
  value: string,
  updatedBy: string
): Promise<void> {
  const meta = REGISTRY_BY_KEY.get(key);
  if (!meta) throw new Error(`Unknown configuration key: ${key}`);

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("platform_config").upsert(
    {
      key,
      value_encrypted: encryptConfigValue(value),
      is_sensitive: meta.sensitive,
      updated_by: updatedBy,
    },
    { onConflict: "key" }
  );
  if (error) throw new Error(`Config persist failed: ${error.message}`);

  cache.set(key, { value, source: "dashboard", updatedAt: new Date().toISOString(), updatedBy });
}

/**
 * Removes the dashboard value so the key falls back to env/default.
 */
export async function resetConfigValue(key: string): Promise<void> {
  if (!REGISTRY_BY_KEY.has(key)) throw new Error(`Unknown configuration key: ${key}`);
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("platform_config").delete().eq("key", key);
  if (error) throw new Error(`Config reset failed: ${error.message}`);
  cache.delete(key);
}

/**
 * Warms the in-memory cache from the database. Call from admin surfaces so
 * sync consumers (scoped-key signing, LLM gateway) pick up dashboard values
 * within the same process.
 */
export async function primeConfigCache(): Promise<void> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return;
  }
  try {
    const { data, error } = await admin
      .from("platform_config")
      .select("key, value_encrypted, updated_at, updated_by");
    if (error || !data) return;
    for (const row of data) {
      if (!REGISTRY_BY_KEY.has(row.key)) continue;
      cache.set(row.key, {
        value: decryptConfigValue(row.value_encrypted),
        source: "dashboard",
        updatedAt: row.updated_at,
        updatedBy: row.updated_by,
      });
    }
  } catch {
    // Non-fatal: consumers fall back to env/defaults.
  }
}

/**
 * Registry listing for the admin dashboard: masked values, never raw secrets.
 */
export async function listConfig(): Promise<ConfigListEntry[]> {
  await primeConfigCache();

  return CONFIG_REGISTRY.map((meta) => {
    const cached = cache.get(meta.key);
    let value: string;
    let source: ConfigSource;
    let updatedAt: string | null = null;
    let updatedBy: string | null = null;

    if (cached) {
      value = cached.value;
      source = cached.source;
      updatedAt = cached.updatedAt;
      updatedBy = cached.updatedBy;
    } else {
      const fallback = resolveFallback(meta);
      value = fallback.value;
      source = fallback.source;
    }

    return {
      ...meta,
      maskedValue: value ? (meta.sensitive ? maskSecret(value) : value) : "",
      source,
      updatedAt,
      updatedBy,
    };
  });
}
