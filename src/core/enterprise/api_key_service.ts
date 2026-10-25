import { randomBytes, createHash } from "crypto";
import { authorizeRoles } from "@/lib/auth/auth_guard";

export interface EnterpriseApiKey {
  id: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  environment: "production" | "sandbox";
  scopes: string[];
  rateLimitPerMin: number;
  totalCalls: number;
  lastUsedAt?: string;
  createdAt: string;
  isRevoked: boolean;
}

class EnterpriseApiKeyManager {
  private keys: Map<string, EnterpriseApiKey> = new Map(); // id -> EnterpriseApiKey
  private keyHashIndex: Map<string, string> = new Map(); // keyHash -> id

  constructor() {
    // Seed standard production key for default org
    const defaultToken = "sbo_live_covenant_gate_9921_prod";
    const defaultHash = this.hashKey(defaultToken);
    const keyId = "key_cov_gate_default";
    const defaultKey: EnterpriseApiKey = {
      id: keyId,
      orgId: "org_covenant_gate",
      name: "Default Production Key",
      keyPrefix: defaultToken.substring(0, 12),
      keyHash: defaultHash,
      environment: "production",
      scopes: ["screening:evaluate", "vault:read_consented", "clients:dossier_write", "consular:audit_run"],
      rateLimitPerMin: 120,
      totalCalls: 142,
      lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: "2026-09-01T10:00:00Z",
      isRevoked: false,
    };
    this.keys.set(keyId, defaultKey);
    this.keyHashIndex.set(defaultHash, keyId);
  }

  private hashKey(key: string): string {
    return createHash("sha256").update(key).digest("hex");
  }

  public listKeysForOrg(orgId: string): Omit<EnterpriseApiKey, "keyHash">[] {
    const list: Omit<EnterpriseApiKey, "keyHash">[] = [];
    for (const key of Array.from(this.keys.values())) {
      if (key.orgId === orgId && !key.isRevoked) {
        const { keyHash, ...safe } = key;
        list.push(safe);
      }
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public createKey(params: {
    orgId: string;
    name: string;
    environment: "production" | "sandbox";
    scopes?: string[];
    rateLimitPerMin?: number;
  }): { key: Omit<EnterpriseApiKey, "keyHash">; rawSecretKey: string } {
    const prefix = params.environment === "production" ? "sbo_live_" : "sbo_test_";
    const rawSecretKey = `${prefix}${randomBytes(24).toString("hex")}`;
    const keyHash = this.hashKey(rawSecretKey);
    const id = `key_${randomBytes(6).toString("hex")}`;

    const newKey: EnterpriseApiKey = {
      id,
      orgId: params.orgId,
      name: params.name || "External Application Key",
      keyPrefix: rawSecretKey.substring(0, 12),
      keyHash,
      environment: params.environment,
      scopes: params.scopes || ["screening:evaluate", "vault:read_consented"],
      rateLimitPerMin: params.rateLimitPerMin || (params.environment === "production" ? 120 : 60),
      totalCalls: 0,
      createdAt: new Date().toISOString(),
      isRevoked: false,
    };

    this.keys.set(id, newKey);
    this.keyHashIndex.set(keyHash, id);

    const { keyHash: _, ...safe } = newKey;
    return { key: safe, rawSecretKey };
  }

  public revokeKey(orgId: string, keyId: string): boolean {
    const existing = this.keys.get(keyId);
    if (!existing || existing.orgId !== orgId) return false;
    existing.isRevoked = true;
    this.keyHashIndex.delete(existing.keyHash);
    return true;
  }

  public verifyKey(rawSecretKey: string): { isValid: boolean; key?: EnterpriseApiKey } {
    const hash = this.hashKey(rawSecretKey);
    const keyId = this.keyHashIndex.get(hash);
    if (!keyId) return { isValid: false };
    const key = this.keys.get(keyId);
    if (!key || key.isRevoked) return { isValid: false };

    key.totalCalls += 1;
    key.lastUsedAt = new Date().toISOString();
    return { isValid: true, key };
  }
}

export const enterpriseApiKeyManager = new EnterpriseApiKeyManager();
