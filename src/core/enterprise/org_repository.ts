import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ManagedOrganization } from "@/core/admin/admin_store";

function hashOrgApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Persists a newly registered organization and its founding admin membership
 * to the sovereign database node. Service-role only; throws on failure so
 * callers can fail closed instead of half-registering.
 */
export async function persistOrganizationRegistration(
  org: ManagedOrganization,
  adminAuthUserId: string
): Promise<void> {
  const admin = createAdminSupabaseClient();

  const { error: orgError } = await admin.from("organizations").insert({
    id: org.id,
    name: org.name,
    type: org.type,
    org_api_key_hash: hashOrgApiKey(org.orgApiKey),
    rate_limit_per_min: org.rateLimitPerMin,
    status: org.status,
    jurisdiction: org.jurisdiction,
    webhook_url: org.webhookUrl ?? null,
  });
  if (orgError) {
    throw new Error(`Organization insert failed: ${orgError.message}`);
  }

  const { error: memberError } = await admin.from("organization_members").insert({
    org_id: org.id,
    auth_user_id: adminAuthUserId,
    role: "ADMIN",
  });
  if (memberError) {
    throw new Error(`Organization membership insert failed: ${memberError.message}`);
  }
}

/**
 * Persists an admin-registered organization (no founding membership).
 * Best-effort: logs and continues when the database is unreachable so the
 * in-memory registry remains authoritative in development.
 */
export async function persistOrganization(org: ManagedOrganization): Promise<boolean> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return false;
  }
  try {
    const { error } = await admin.from("organizations").upsert(
      {
        id: org.id,
        name: org.name,
        type: org.type,
        org_api_key_hash: hashOrgApiKey(org.orgApiKey),
        rate_limit_per_min: org.rateLimitPerMin,
        status: org.status,
        jurisdiction: org.jurisdiction,
        webhook_url: org.webhookUrl ?? null,
      },
      { onConflict: "id" }
    );
    return !error;
  } catch {
    return false;
  }
}

/**
 * Lists all organizations from the database. Returns an empty array when the
 * database is unreachable so callers can merge the in-memory registry.
 */
export async function listOrganizations(): Promise<Omit<ManagedOrganization, "orgApiKey">[]> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return [];
  }
  try {
    const { data, error } = await admin
      .from("organizations")
      .select("id, name, type, rate_limit_per_min, status, jurisdiction, webhook_url, created_at")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      rateLimitPerMin: row.rate_limit_per_min,
      totalQueriesProcessed: 0,
      status: row.status,
      webhookUrl: row.webhook_url ?? undefined,
      jurisdiction: row.jurisdiction,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Updates an organization's status (ACTIVE / SUSPENDED) in the database.
 * Returns false when the database is unreachable.
 */
export async function updateOrganizationStatus(
  orgId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<boolean> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return false;
  }
  try {
    const { error } = await admin.from("organizations").update({ status }).eq("id", orgId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Resolves an organization by ID from the database. Returns null when the
 * database is unreachable, unconfigured, or the organization is not found.
 */
export async function findOrganizationById(
  orgId: string
): Promise<Omit<ManagedOrganization, "orgApiKey"> | null> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return null;
  }

  try {
    const { data, error } = await admin
      .from("organizations")
      .select("id, name, type, rate_limit_per_min, status, jurisdiction, webhook_url, created_at")
      .eq("id", orgId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      rateLimitPerMin: data.rate_limit_per_min,
      totalQueriesProcessed: 0,
      status: data.status,
      webhookUrl: data.webhook_url ?? undefined,
      jurisdiction: data.jurisdiction,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves an organization API key against the database by its SHA-256 hash.
 * Returns null when the database is unreachable or unconfigured so callers can
 * fall back to the in-memory registry (development seeds).
 */
export async function findOrganizationByApiKey(
  apiKey: string
): Promise<ManagedOrganization | null> {
  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return null;
  }

  try {
    const { data, error } = await admin
      .from("organizations")
      .select("id, name, type, rate_limit_per_min, status, jurisdiction, webhook_url, created_at")
      .eq("org_api_key_hash", hashOrgApiKey(apiKey))
      .maybeSingle();

    if (error || !data) return null;
    if (data.status !== "ACTIVE") return null;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      orgApiKey: apiKey,
      rateLimitPerMin: data.rate_limit_per_min,
      totalQueriesProcessed: 0,
      status: data.status,
      webhookUrl: data.webhook_url ?? undefined,
      jurisdiction: data.jurisdiction,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}
