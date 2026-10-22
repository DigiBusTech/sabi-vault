import { NextRequest, NextResponse } from "next/server";
import { getConfigValueSync } from "@/core/config/platform_config";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/auth/google/signin
 * Initiates the Google OAuth Fast Sign-in / Fast Sign-up flow.
 *
 * Query parameters:
 * - next: target URL after authentication (default: /dashboard)
 * - role: target user role (citizen | enterprise_admin)
 * - mode: json (returns { url }) or redirect (HTTP 302)
 */
export async function GET(req: NextRequest) {
  try {
    const isEnabled = getConfigValueSync("auth.google_oauth_enabled") !== "false";
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Google Authentication is disabled in platform configuration." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const next = searchParams.get("next") || "/dashboard";
    const role = searchParams.get("role") || "citizen";
    const mode = searchParams.get("mode") || "json";

    const clientId =
      getConfigValueSync("auth.google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      getConfigValueSync("integrations.google_drive_client_id") ||
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      "";

    const origin = req.nextUrl.origin;
    const configuredRedirect = getConfigValueSync("auth.google_redirect_uri");
    const redirectUri =
      configuredRedirect && configuredRedirect.startsWith("http")
        ? configuredRedirect
        : `${origin}/auth/callback`;

    // State payload encodes target path, role, and anti-CSRF token
    const statePayload = {
      next,
      role,
      nonce: randomBytes(8).toString("hex"),
      ts: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

    if (!clientId) {
      // In development when client ID is not yet saved, simulate direct local dev OAuth login
      const devCallbackUrl = `${origin}/auth/callback?code=mock_google_oauth_code&state=${state}&next=${encodeURIComponent(
        next
      )}`;

      if (mode === "redirect") {
        return NextResponse.redirect(devCallbackUrl);
      }
      return NextResponse.json({
        url: devCallbackUrl,
        isDevSimulation: true,
        message: "Google Client ID not configured. Using development fast-auth pipeline.",
      });
    }

    const scope = encodeURIComponent("openid email profile");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account&state=${encodeURIComponent(
      state
    )}`;

    if (mode === "redirect") {
      return NextResponse.redirect(googleAuthUrl);
    }

    return NextResponse.json({
      url: googleAuthUrl,
      isDevSimulation: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}
