import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { enterpriseApiKeyManager } from "@/core/enterprise/api_key_service";
import { globalAdminStore } from "@/core/admin/admin_store";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  // Resolve organization ID from user or query
  const orgId = auth.user.orgId || "org_covenant_gate";
  const keys = enterpriseApiKeyManager.listKeysForOrg(orgId);

  return NextResponse.json({
    success: true,
    totalKeys: keys.length,
    keys,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { name, environment = "production", scopes, rateLimitPerMin } = body;

    const orgId = auth.user.orgId || "org_covenant_gate";
    const result = enterpriseApiKeyManager.createKey({
      orgId,
      name: name || "Web/Native App Key",
      environment: environment === "sandbox" ? "sandbox" : "production",
      scopes: Array.isArray(scopes) && scopes.length > 0 ? scopes : ["screening:evaluate", "vault:read_consented"],
      rateLimitPerMin: Number(rateLimitPerMin) || (environment === "sandbox" ? 60 : 120),
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      rawSecretKey: result.rawSecretKey, // Disclosed exactly once!
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create API key" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("keyId");
  if (!keyId) {
    return NextResponse.json({ error: "keyId query parameter is required." }, { status: 400 });
  }

  const orgId = auth.user.orgId || "org_covenant_gate";
  const revoked = enterpriseApiKeyManager.revokeKey(orgId, keyId);

  if (!revoked) {
    return NextResponse.json({ error: "Key not found or could not be revoked." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "API key has been revoked permanently.",
  });
}
