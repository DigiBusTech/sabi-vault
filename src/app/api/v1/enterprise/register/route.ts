import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { globalAdminStore } from "@/core/admin/admin_store";
import { persistOrganizationRegistration } from "@/core/enterprise/org_repository";
import { ensureVaultProfile } from "@/core/vault/profile_service";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Organization name is too short.").max(160),
  type: z.enum(["ENTERPRISE", "UNIVERSITY", "GOVERNMENT", "BORDER_SECURITY"]),
  jurisdiction: z.string().trim().min(2, "Jurisdiction is required.").max(120),
});

/**
 * Self-serve organization onboarding. The caller must hold a valid user session;
 * the new organization is registered and the caller's server-managed app_metadata
 * is promoted to enterprise_admin bound to the new organization.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Organization registration is not configured on this deployment." },
      { status: 503 }
    );
  }

  const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(auth.user.userId);
  if (lookupError || !existing.user) {
    return NextResponse.json(
      { error: "Could not resolve the authenticated account for registration." },
      { status: 502 }
    );
  }

  if (typeof existing.user.app_metadata?.org_id === "string") {
    return NextResponse.json(
      { error: "This account already administers an organization." },
      { status: 409 }
    );
  }

  const organization = globalAdminStore.createOrganization({
    name: parsed.data.name,
    type: parsed.data.type,
    jurisdiction: parsed.data.jurisdiction,
    rateLimitPerMin: 60,
    status: "ACTIVE",
  });

  try {
    await persistOrganizationRegistration(organization, auth.user.userId);
  } catch (persistError) {
    console.error("[Enterprise] Organization persistence failed.", persistError);
    return NextResponse.json(
      { error: "Organization registration failed at the database. No account changes were made." },
      { status: 502 }
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(auth.user.userId, {
    app_metadata: {
      ...existing.user.app_metadata,
      role: "enterprise_admin",
      org_id: organization.id,
    },
  });

  if (updateError) {
    console.error("[Enterprise] Failed to bind organization to account.", updateError);
    return NextResponse.json(
      { error: "Organization was created but could not be bound to your account. Contact support." },
      { status: 502 }
    );
  }

  await ensureVaultProfile({ id: auth.user.userId, email: auth.user.email });

  // The org API key is disclosed exactly once, at registration.
  return NextResponse.json(
    {
      ok: true,
      organization: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        jurisdiction: organization.jurisdiction,
        orgApiKey: organization.orgApiKey,
      },
    },
    { status: 201 }
  );
}
