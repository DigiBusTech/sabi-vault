import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";

/**
 * GET /api/v1/admin/orgs
 * Returns all registered organizations and government entities.
 */
export async function GET() {
  const orgs = globalAdminStore.getAllOrganizations();
  return NextResponse.json({ status: "SUCCESS", count: orgs.length, organizations: orgs });
}

/**
 * POST /api/v1/admin/orgs
 * Registers a new Government Agency or Enterprise, issuing an X-Sabi-Org-Key.
 */
export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({
      status: "ORGANIZATION_REGISTERED",
      organization: newOrg,
      instruction: "Share the 'orgApiKey' securely with the organization technical team.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create organization", details: err.message }, { status: 500 });
  }
}
