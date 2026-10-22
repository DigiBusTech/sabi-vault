import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import {
  listUserCloudIntegrations,
  disconnectUserCloudIntegration,
  CloudProvider,
} from "@/core/storage/cloud_integrations";

/**
 * GET /api/v1/user/cloud-settings
 * Returns the authenticated citizen's connected cloud storage providers.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Authentication required" },
      { status: auth.status }
    );
  }

  try {
    const integrations = await listUserCloudIntegrations(auth.user.userId);
    return NextResponse.json({ integrations });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch cloud integrations", details: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/user/cloud-settings?provider=google_drive|dropbox
 * Disconnects a specific cloud storage provider from the citizen's vault.
 */
export async function DELETE(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Authentication required" },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") as CloudProvider | null;

  if (!provider || (provider !== "google_drive" && provider !== "dropbox")) {
    return NextResponse.json(
      { error: "Valid provider required: google_drive or dropbox" },
      { status: 400 }
    );
  }

  try {
    await disconnectUserCloudIntegration(auth.user.userId, provider);
    return NextResponse.json({
      status: "DISCONNECTED",
      provider,
      message: `Successfully disconnected ${provider} from your SabiProfile vault.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to disconnect provider", details: err.message },
      { status: 500 }
    );
  }
}

