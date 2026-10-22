import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConfigValueSync, getConfigValue, primeConfigCache } from "@/core/config/platform_config";
import { globalUserStore } from "@/core/vault/user_store";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { registerUserSession, REFRESH_COOKIE_NAME } from "@/lib/security/session";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const requestedPath = requestUrl.searchParams.get("next") || "/dashboard";
  const requestedUrl = new URL(requestedPath, requestUrl.origin);
  const safePath = requestedUrl.origin === requestUrl.origin
    ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
    : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation_failed", requestUrl.origin));
  }

  // 1. Handle mock development Google fast-auth simulation
  if (code === "mock_google_oauth_code") {
    let targetRole = "citizen";
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        if (decoded.role) targetRole = decoded.role;
      } catch {}
    }

    const devEmail = "google.citizen@sabiprofile.com";
    const devUserId = "usr_chinwe_okafor_7721";

    const response = NextResponse.redirect(new URL(safePath, requestUrl.origin));
    response.cookies.set("sb_auth_token", "mock_google_session_token", {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
    });
    response.cookies.set("sabi_user_role", targetRole, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
    });
    return response;
  }

  // 2. Try standard Supabase Session Exchange
  try {
    const supabase = createServerSupabaseClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.session) {
      return NextResponse.redirect(new URL(safePath, requestUrl.origin));
    }
  } catch (supabaseErr) {
    console.warn("[Auth Callback] Supabase code exchange skipped or failed:", supabaseErr);
  }

  // 3. Fallback: Direct Google OAuth token exchange if Google credentials are configured
  try {
    await primeConfigCache();

    let targetRole: "citizen" | "enterprise_admin" = "citizen";
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        if (decoded.role === "enterprise_admin" || decoded.role === "citizen") {
          targetRole = decoded.role;
        }
      } catch {}
    }

    const clientId =
      (await getConfigValue("auth.google_client_id")) ||
      getConfigValueSync("auth.google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      (await getConfigValue("integrations.google_drive_client_id")) ||
      process.env.GOOGLE_DRIVE_CLIENT_ID;

    const clientSecret =
      (await getConfigValue("auth.google_client_secret")) ||
      getConfigValueSync("auth.google_client_secret") ||
      process.env.GOOGLE_CLIENT_SECRET ||
      (await getConfigValue("integrations.google_drive_client_secret")) ||
      process.env.GOOGLE_DRIVE_CLIENT_SECRET;

    // Use current request origin callback (whitelisted in Google Cloud Console for all environments)
    const redirectUri = `${requestUrl.origin}/auth/callback`;

    if (clientId && clientSecret) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          // Fetch Google User Profile
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (profileRes.ok) {
            const googleUser = await profileRes.json();
            const email = googleUser.email;
            const name = googleUser.name || "Google Citizen";
            const picture = googleUser.picture;

            // Seed user profile
            const userId = `usr_${googleUser.sub?.substring(0, 8) || "google"}`;
            await profileAndAdvisorStore.updateProfile(userId, {
              fullName: name,
              avatarUrl: picture,
            });

            const userAgent = request.headers.get("user-agent") || "";
            const ipAddress =
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
              request.headers.get("x-real-ip") ||
              "127.0.0.1";
            const deviceFingerprint = `google_${googleUser.sub?.substring(0, 12) || "web"}`;

            // Register authenticated session with cryptographic HMAC-SHA256 tokens
            const session = await registerUserSession({
              userId,
              deviceFingerprint,
              userAgent,
              ipAddress,
              email,
              role: targetRole,
            });

            const response = NextResponse.redirect(new URL(safePath, requestUrl.origin));
            response.cookies.set("sb_auth_token", session.accessToken, {
              path: "/",
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            response.cookies.set(REFRESH_COOKIE_NAME, session.refreshToken, {
              path: "/",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 30 * 86400,
            });
            response.cookies.set("sabi_user_email", email, {
              path: "/",
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            response.cookies.set("sabi_user_role", targetRole, {
              path: "/",
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            return response;
          }
        }
      }
    }
  } catch (directOAuthErr) {
    console.error("[Auth Callback] Direct Google OAuth fallback failed:", directOAuthErr);
  }

  // If both failed, redirect to login with error
  return NextResponse.redirect(new URL("/login?error=confirmation_failed", requestUrl.origin));
}
