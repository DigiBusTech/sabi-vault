import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

export interface SabiRuntimeConfig {
  // AI Gateways
  geminiApiKey: string;
  groqApiKey: string;
  openAiApiKey: string;
  llmFallbackOrder: ("gemini" | "groq" | "openai" | "deterministic")[];

  // Web3 / Blockchain Ledger
  baseSepoliaRpc: string;
  registryContractAddress: string;
  splitterContractAddress: string;
  platformTreasuryWallet: string;

  // Cloud & OAuth
  googleDriveClientId: string;
  googleDriveClientSecret: string;
  sessionTtlSeconds: number;

  // Global Sovereign Nodes
  sovereignNodesConfig: {
    nodeId: string;
    endpointUrl: string;
    payoutAddress: string;
    isActive: boolean;
  }[];

  // Fee & Billing Defaults
  standardQueryFeeUsd: number;
  platformFeePercent: number; // default 60
  sovereignHostFeePercent: number; // default 40

  updatedAt: string;
}

const MASTER_ENCRYPTION_SECRET =
  process.env.SABI_ADMIN_MASTER_KEY || "sabi_vault_super_admin_master_aes_256_key_32b!";

// Derive 32-byte key
const KEY_BUFFER = createHash("sha256").update(MASTER_ENCRYPTION_SECRET).digest();

/**
 * Encrypts a string using AES-256-GCM
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY_BUFFER, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM ciphertext
 */
export function decryptSecret(cipherString: string): string {
  if (!cipherString || !cipherString.includes(":")) return cipherString;
  try {
    const [ivHex, authTagHex, encrypted] = cipherString.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err: any) {
    console.warn("[ConfigVault] Failed to decrypt secret:", err.message);
    return "";
  }
}

/**
 * In-Memory Dynamic Runtime Config Store with hot-reloading
 */
class RuntimeConfigVault {
  private config: SabiRuntimeConfig;

  constructor() {
    this.config = {
      geminiApiKey: process.env.GEMINI_API_KEY || "AIzaSy_demo_gemini_flash_key",
      groqApiKey: process.env.GROQ_API_KEY || "gsk_demo_groq_llama3_key",
      openAiApiKey: process.env.OPENAI_API_KEY || "sk-demo_openai_key",
      llmFallbackOrder: ["gemini", "groq", "openai", "deterministic"],
      baseSepoliaRpc: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      registryContractAddress:
        process.env.REGISTRY_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890",
      splitterContractAddress:
        process.env.SPLITTER_CONTRACT_ADDRESS || "0x0987654321098765432109876543210987654321",
      platformTreasuryWallet: "0x1111111111111111111111111111111111111111",
      googleDriveClientId: "sabi-vault-gdrive-client.apps.googleusercontent.com",
      googleDriveClientSecret: "GOCSPX-demo_secret_key",
      sessionTtlSeconds: 86400,
      sovereignNodesConfig: [
        {
          nodeId: "ng-west-africa",
          endpointUrl: "https://ng-node.sabi-vault.internal",
          payoutAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          isActive: true,
        },
        {
          nodeId: "eu-central",
          endpointUrl: "https://eu-node.sabi-vault.internal",
          payoutAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          isActive: true,
        },
        {
          nodeId: "na-east",
          endpointUrl: "https://na-node.sabi-vault.internal",
          payoutAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          isActive: true,
        },
      ],
      standardQueryFeeUsd: 1.0,
      platformFeePercent: 60,
      sovereignHostFeePercent: 40,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetches active configuration with secrets masked for client-safe admin view.
   */
  getMaskedConfig(): SabiRuntimeConfig {
    return {
      ...this.config,
      geminiApiKey: this.maskSecret(this.config.geminiApiKey),
      groqApiKey: this.maskSecret(this.config.groqApiKey),
      openAiApiKey: this.maskSecret(this.config.openAiApiKey),
      googleDriveClientSecret: this.maskSecret(this.config.googleDriveClientSecret),
    };
  }

  /**
   * Fetches raw decrypted runtime secrets (used internally by LLM gateway & blockchain client).
   */
  getRawConfig(): SabiRuntimeConfig {
    return { ...this.config };
  }

  /**
   * Dynamically updates runtime configuration without redeploying or restarting the server.
   */
  updateConfig(updates: Partial<SabiRuntimeConfig>): SabiRuntimeConfig {
    this.config = {
      ...this.config,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.getMaskedConfig();
  }

  private maskSecret(val: string): string {
    if (!val || val.length < 8) return "••••••••";
    return val.substring(0, 4) + "••••••••" + val.substring(val.length - 4);
  }
}

// Global Singleton
export const globalConfigVault = new RuntimeConfigVault();
