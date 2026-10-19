import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { authenticateAdmin } from "@/lib/auth/auth_guard";
import {
  listOrganizations,
  persistOrganization,
  updateOrganizationStatus,
} from "@/core/enterprise/org_repository";

/**
 * GET /api/v1/admin/orgs
 * Lists all registered organizations: database is the source of truth,
 * merged with in-memory development seeds (deduplicated by id). (Admin only)
 */
export async function GET(req: NextRequest) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  const dbOrgs = await listOrganizations();
  const merged = new Map<string, any>();
  for (const org of globalAdminStore.getAllOrganizations()) {
    merged.set(org.id, { ...org, orgApiKey: undefined, source: "registry" });
  }
  for (const org of dbOrgs) {
    merged.set(org.id, { ...org, source: "database" });
  }

  const organizations = Array.from(merged.values());
  return NextResponse.json({ status: "SUCCESS", count: organizations.length, organizations });
}

/**
 * POST /api/v1/admin/orgs
 * Registers a new Government Agency or Enterprise, issuing an X-Sabi-Org-Key.
 * The organization is persisted to the sovereign database (key stored as a
 * SHA-256 hash); the raw key is disclosed once in this response. (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, rateLimitPerMin, jurisdiction, webhookUrl } = body;

    if (!name || !type || !jurisdiction) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, jurisdiction" },
        { status: 400 }
      );
    }

    const newOrg = globalAdminStore.createOrganization({
      name,
      type,
      rateLimitPerMin: rateLimitPerMin || 60,
      status: "ACTIVE",
      jurisdiction,
      webhookUrl,
    });

    const persisted = await persistOrganization(newOrg);

    return NextResponse.json({
      status: "ORGANIZATION_REGISTERED",
      organization: newOrg,
      persistedToDatabase: persisted,
      instruction: "Share the 'orgApiKey' securely with the organization technical team. It is stored as a SHA-256 hash and cannot be recovered.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create organization", details: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/admin/orgs
 * Activates or suspends an organization. Applies to both the database and
 * the in-memory registry. Suspended organizations fail M2M authentication
 * immediately. (Admin only)
 *
 * Body: { orgId, status: "ACTIVE" | "SUSPENDED" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
    }

    const { orgId, status } = await req.json();
    if (!orgId || !["ACTIVE", "SUSPENDED"].includes(status)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: orgId, status (ACTIVE | SUSPENDED)" },
        { status: 400 }
      );
    }

    const dbUpdated = await updateOrganizationStatus(orgId, status);
    const memUpdated = globalAdminStore.updateOrganization(orgId, { status });

    if (!dbUpdated && !memUpdated) {
      return NextResponse.json({ error: `Organization '${orgId}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      status: "ORGANIZATION_UPDATED",
      orgId,
      newStatus: status,
      persistedToDatabase: dbUpdated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update organization", details: err.message }, { status: 500 });
  }
}
