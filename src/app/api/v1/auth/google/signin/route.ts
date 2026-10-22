import { NextRequest, NextResponse } from "next/server";
import { getConfigValueSync, getConfigValue, primeConfigCache } from "@/core/config/platform_config";
import { randomBytes } from "crypto";
import { resolveGoogleRedirectUri } from "@/lib/auth/google_oauth";

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
    await primeConfigCache();

    const isEnabled =
      (await getConfigValue("auth.google_oauth_enabled")) !== "false" &&
      getConfigValueSync("auth.google_oauth_enabled") !== "false";

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
      (await getConfigValue("auth.google_client_id")) ||
      getConfigValueSync("auth.google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      (await getConfigValue("integrations.google_drive_client_id")) ||
      process.env.GOOGLE_DRIVE_CLIENT_ID ||
      "";

    const configuredRedirectUri =
      (await getConfigValue("auth.google_redirect_uri")) ||
      getConfigValueSync("auth.google_redirect_uri") ||
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      "";

    // Canonical redirect URI strictly matching Google Cloud Console credentials across apex, www, Vercel, & localhost
    const redirectUri = resolveGoogleRedirectUri(req, {
      configuredUri: configuredRedirectUri,
    });
    const origin = req.nextUrl.origin;

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
      redirectUri,
      isDevSimulation: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}
