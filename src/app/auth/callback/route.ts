import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getConfigValueSync } from "@/core/config/platform_config";
import { globalUserStore } from "@/core/vault/user_store";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";

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
    const clientId =
      getConfigValueSync("auth.google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      getConfigValueSync("integrations.google_drive_client_id") ||
      process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret =
      getConfigValueSync("auth.google_client_secret") ||
      process.env.GOOGLE_CLIENT_SECRET ||
      getConfigValueSync("integrations.google_drive_client_secret") ||
      process.env.GOOGLE_DRIVE_CLIENT_SECRET;

    const configuredRedirect = getConfigValueSync("auth.google_redirect_uri");
    const redirectUri =
      configuredRedirect && configuredRedirect.startsWith("http")
        ? configuredRedirect
        : `${requestUrl.origin}/auth/callback`;

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
            profileAndAdvisorStore.updateProfile(userId, {
              fullName: name,
              avatarUrl: picture,
            });

            const response = NextResponse.redirect(new URL(safePath, requestUrl.origin));
            response.cookies.set("sb_auth_token", tokenData.access_token, {
              path: "/",
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            response.cookies.set("sabi_user_email", email, {
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
