import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { toValidUuid } from "@/lib/security/session";

export type CloudProvider = "google_drive" | "dropbox";

export interface UserCloudIntegrationRecord {
  id: string;
  userUuid: string;
  provider: CloudProvider;
  encryptedAccessToken: string | null;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: Date | null;
  driveFolderId: string | null;
  isActive: boolean;
  connectedAt: Date;
  updatedAt: Date;
}

export interface CloudTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  folderId?: string;
}

// In-memory fallback for local development/simulation
const inMemoryCloudIntegrations = new Map<string, UserCloudIntegrationRecord>();

function getEncryptionKey(): Buffer {
  const secret =
    process.env.SESSION_SIGNING_SECRET ||
    process.env.JWT_SECRET ||
    "sabiprofile_cloud_integrations_master_secret_2026_default";
  return createHash("sha256").update(secret).digest();
}

export function encryptCloudToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptCloudToken(ciphertext: string): string {
  if (!ciphertext) return "";
  const key = getEncryptionKey();
  const buf = Buffer.from(ciphertext, "base64");
  if (buf.length < 28) return "";
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

/**
 * Saves or updates a user's cloud integration tokens securely.
 */
export async function saveUserCloudIntegration(
  userId: string,
  provider: CloudProvider,
  tokens: CloudTokens
): Promise<void> {
  const userUuid = toValidUuid(userId);
  const encryptedAccess = encryptCloudToken(tokens.accessToken);
  const encryptedRefresh = tokens.refreshToken ? encryptCloudToken(tokens.refreshToken) : null;
  const tokenExpiresAt = tokens.expiresIn
    ? new Date(Date.now() + tokens.expiresIn * 1000)
    : null;

  const memKey = `${userUuid}:${provider}`;
  inMemoryCloudIntegrations.set(memKey, {
    id: memKey,
    userUuid,
    provider,
    encryptedAccessToken: encryptedAccess,
    encryptedRefreshToken: encryptedRefresh,
    tokenExpiresAt,
    driveFolderId: tokens.folderId || null,
    isActive: true,
    connectedAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("user_cloud_integrations").upsert(
      {
        user_uuid: userUuid,
        provider,
        encrypted_access_token: encryptedAccess,
        encrypted_refresh_token: encryptedRefresh,
        token_expires_at: tokenExpiresAt?.toISOString(),
        drive_folder_id: tokens.folderId || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_uuid,provider" }
    );

    if (error) {
      console.warn("[CloudIntegrations] Supabase upsert error (using in-memory fallback):", error.message);
    }
  } catch (err: any) {
    // Non-fatal: in-memory state remains intact
  }
}

/**
 * Retrieves and decrypts the active cloud integration for a user.
 */
export async function getUserCloudIntegration(
  userId: string,
  provider: CloudProvider
): Promise<{ accessToken: string; refreshToken?: string; folderId?: string } | null> {
  const userUuid = toValidUuid(userId);
  const memKey = `${userUuid}:${provider}`;

  let record = inMemoryCloudIntegrations.get(memKey);

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_cloud_integrations")
      .select("*")
      .eq("user_uuid", userUuid)
      .eq("provider", provider)
      .eq("is_active", true)
      .single();

    if (!error && data) {
      record = {
        id: data.id,
        userUuid: data.user_uuid,
        provider: data.provider,
        encryptedAccessToken: data.encrypted_access_token,
        encryptedRefreshToken: data.encrypted_refresh_token,
        tokenExpiresAt: data.token_expires_at ? new Date(data.token_expires_at) : null,
        driveFolderId: data.drive_folder_id,
        isActive: data.is_active,
        connectedAt: new Date(data.connected_at),
        updatedAt: new Date(data.updated_at),
      };
      inMemoryCloudIntegrations.set(memKey, record);
    }
  } catch (err: any) {
    // fallback to in-memory record
  }

  if (!record || !record.isActive || !record.encryptedAccessToken) {
    return null;
  }

  const accessToken = decryptCloudToken(record.encryptedAccessToken);
  const refreshToken = record.encryptedRefreshToken
    ? decryptCloudToken(record.encryptedRefreshToken)
    : undefined;

  return {
    accessToken,
    refreshToken,
    folderId: record.driveFolderId || undefined,
  };
}

/**
 * Lists connected providers for user (without exposing tokens).
 */
export async function listUserCloudIntegrations(userId: string): Promise<
  Array<{ provider: CloudProvider; is_active: boolean; connected_at: string; drive_folder_id?: string | null }>
> {
  const userUuid = toValidUuid(userId);
  const results: Array<{
    provider: CloudProvider;
    is_active: boolean;
    connected_at: string;
    drive_folder_id?: string | null;
  }> = [];

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("user_cloud_integrations")
      .select("provider, is_active, connected_at, drive_folder_id")
      .eq("user_uuid", userUuid)
      .eq("is_active", true);

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // fallback to inMemory
  }

  inMemoryCloudIntegrations.forEach((val) => {
    if (val.userUuid === userUuid && val.isActive) {
      results.push({
        provider: val.provider,
        is_active: val.isActive,
        connected_at: val.connectedAt.toISOString(),
        drive_folder_id: val.driveFolderId,
      });
    }
  });

  return results;
}

/**
 * Disconnects a user's cloud integration.
 */
export async function disconnectUserCloudIntegration(
  userId: string,
  provider: CloudProvider
): Promise<void> {
  const userUuid = toValidUuid(userId);
  const memKey = `${userUuid}:${provider}`;
  inMemoryCloudIntegrations.delete(memKey);

  try {
    const supabase = createAdminSupabaseClient();
    await supabase
      .from("user_cloud_integrations")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_uuid", userUuid)
      .eq("provider", provider);
  } catch (err) {
    // non-fatal
  }
}
