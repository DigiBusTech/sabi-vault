import { NextRequest, NextResponse } from "next/server";
import { authenticateM2M } from "@/lib/auth/auth_guard";
import { globalAdminStore } from "@/core/admin/admin_store";

interface WebhookRegistration {
  orgId: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  registeredAt: string;
}

const REGISTERED_WEBHOOKS = new Map<string, WebhookRegistration>();

/**
 * GET /api/v1/m2m/webhooks
 * Lists webhook configuration for the organization.
 */
export async function GET(req: NextRequest) {
  const orgAuth = await authenticateM2M(req);
  if (!orgAuth.isValid || !orgAuth.org) {
    return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
  }

  const webhook = REGISTERED_WEBHOOKS.get(orgAuth.org.id) || {
    orgId: orgAuth.org.id,
    url: orgAuth.org.webhookUrl || null,
    events: ["credential.tier2_legalized", "key.revoked", "security.tamper_detected"],
    active: Boolean(orgAuth.org.webhookUrl),
    registeredAt: orgAuth.org.createdAt,
  };

  return NextResponse.json({ success: true, webhook });
}

/**
 * POST /api/v1/m2m/webhooks
 * Configures or updates organization webhook listener.
 */
export async function POST(req: NextRequest) {
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const { url, events, secret } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid webhook URL string is required." }, { status: 400 });
    }

    const allowedEvents = [
      "credential.tier2_legalized",
      "key.revoked",
      "security.tamper_detected",
      "credential.synced",
    ];

    const targetEvents = Array.isArray(events)
      ? events.filter((e) => allowedEvents.includes(e))
      : allowedEvents;

    const registration: WebhookRegistration = {
      orgId: orgAuth.org.id,
      url,
      events: targetEvents,
      secret: secret || "whsec_" + Math.random().toString(36).substring(2, 15),
      active: true,
      registeredAt: new Date().toISOString(),
    };

    REGISTERED_WEBHOOKS.set(orgAuth.org.id, registration);
    globalAdminStore.updateOrganization(orgAuth.org.id, { webhookUrl: url });

    return NextResponse.json({
      status: "WEBHOOK_CONFIGURED",
      webhook: {
        orgId: registration.orgId,
        url: registration.url,
        events: registration.events,
        active: registration.active,
        registeredAt: registration.registeredAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to configure webhook", details: err.message }, { status: 500 });
  }
}
