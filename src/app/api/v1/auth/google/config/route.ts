import { NextRequest, NextResponse } from "next/server";
import { getConfigValueSync } from "@/core/config/platform_config";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/auth/google/config
 * Returns public Google OAuth status and Client ID for frontend fast-auth buttons.
 */
export async function GET(req: NextRequest) {
  try {
    const isEnabled = getConfigValueSync("auth.google_oauth_enabled") !== "false";
    const clientId =
      getConfigValueSync("auth.google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      getConfigValueSync("integrations.google_drive_client_id") ||
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      null;

    return NextResponse.json({
      enabled: isEnabled,
      hasClientId: Boolean(clientId),
      clientId: clientId ? `${clientId.substring(0, 12)}...` : null,
    });
  } catch (err: any) {
    return NextResponse.json({
      enabled: true,
      hasClientId: false,
      clientId: null,
    });
  }
}

