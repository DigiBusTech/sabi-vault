import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getConfigValueSync, getConfigValue, primeConfigCache } from "@/core/config/platform_config";
import { globalUserStore } from "@/core/vault/user_store";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { registerUserSession, REFRESH_COOKIE_NAME } from "@/lib/security/session";
import { resolveGoogleRedirectUri } from "@/lib/auth/google_oauth";
import { telemetryLogger } from "@/lib/telemetry/live_logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDesc = requestUrl.searchParams.get("error_description");

  // Determine canonical host and origin across proxies and subdomains
  const requestHost = (request.headers.get("x-forwarded-host") || requestUrl.host).toLowerCase();
  const proto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const canonicalOrigin = `${proto}://${requestHost}`;

  const isProduction = requestHost.includes("sabiprofile.com");
  const cookieDomain = isProduction ? ".sabiprofile.com" : undefined;

  const requestedPath = requestUrl.searchParams.get("next") || "/dashboard";
  const requestedUrl = new URL(requestedPath, canonicalOrigin);
  const safePath =
    requestedUrl.origin === canonicalOrigin
      ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
      : "/dashboard";

  // Check if provider returned an explicit error parameter
  if (errorParam) {
    const message = errorDesc || errorParam || "Authentication was denied or encountered an error.";
    console.error("[Auth Callback] OAuth provider error:", errorParam, errorDesc);
    telemetryLogger.record({
      subsystem: "SECURITY_AUTH",
      level: "WARN",
      action: "OAUTH_PROVIDER_REJECTED",
      durationMs: 0,
      message,
      errorCode: errorParam,
      metadata: { errorParam, errorDesc, host: requestHost },
    });
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&error_description=${encodeURIComponent(message)}`, canonicalOrigin)
    );
  }

  // Handle case where no code query parameter is passed (e.g. hash fragment or direct hit)
  if (!code) {
    // Return HTML to safely inspect client-side hash fragments (Supabase implicit / popup flow)
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<div style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; color: #1e293b;">
  <p>Finalizing authentication, please wait...</p>
</div>
<script>
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const err = params.get('error_description') || params.get('error');
    if (err) {
      window.location.href = '/login?error=auth_failed&error_description=' + encodeURIComponent(err);
    } else {
      window.location.href = '${safePath}';
    }
  } else {
    window.location.href = '/login?error=auth_failed&error_description=' + encodeURIComponent('Authentication code was missing or has expired. Please try signing in again.');
  }
</script>
</body>
</html>`;
    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Determine target role from state if available
  let targetRole: "citizen" | "enterprise_admin" = "citizen";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
      if (decoded.role === "enterprise_admin" || decoded.role === "citizen") {
        targetRole = decoded.role;
      }
    } catch {}
  }

  // If role is enterprise_admin and destination is generic dashboard, route to enterprise workspace
  let finalDestination = safePath;
  if (targetRole === "enterprise_admin" && finalDestination === "/dashboard") {
    finalDestination = "/dashboard/enterprise";
  }

  // 1. Handle mock development Google fast-auth simulation
  if (code === "mock_google_oauth_code") {
    const devUserId = "usr_chinwe_okafor_7721";
    globalUserStore.getVault(devUserId);

    const response = NextResponse.redirect(new URL(finalDestination, canonicalOrigin));
    response.cookies.set("sb_auth_token", "mock_google_session_token", {
      path: "/",
      domain: cookieDomain,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
    });
    response.cookies.set("sabi_user_role", targetRole, {
      path: "/",
      domain: cookieDomain,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
    });
    return response;
  }

  let lastExchangeError: string | null = null;

  // 2. Try Supabase Session Exchange (with modern getAll/setAll cookie binding)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = NextResponse.redirect(new URL(finalDestination, canonicalOrigin));
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookieOptions: {
          domain: cookieDomain,
          path: "/",
          sameSite: "lax",
          secure: proto === "https",
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({
                name,
                value,
                ...options,
                domain: cookieDomain || options?.domain,
              });
            });
          },
        },
      });

      const { data: sessionData, error: sbError } = await supabase.auth.exchangeCodeForSession(code);
      if (!sbError && sessionData?.session) {
        const user = sessionData.session.user;
        const email = user.email || "user@sabiprofile.com";
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.display_name ||
          email.split("@")[0];
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const userId = `usr_${user.id.substring(0, 8)}`;

        // Seed user vault and profile (non-fatal: a profile sync hiccup must
        // never discard a valid OAuth session)
        try {
          globalUserStore.getVault(userId);
          await profileAndAdvisorStore.updateProfile(userId, {
            fullName,
            avatarUrl,
          });
        } catch (seedErr: any) {
          console.warn("[Auth Callback] Profile seeding warning (non-fatal):", seedErr?.message);
          telemetryLogger.record({
            subsystem: "SECURITY_AUTH",
            level: "WARN",
            action: "OAUTH_PROFILE_SEED_FAILED",
            durationMs: 0,
            userId,
            message: `Profile seeding failed for ${email}: ${seedErr?.message || "unknown"}`,
            metadata: { email, host: requestHost },
          });
        }

        // Register authenticated SabiProfile session
        const userAgent = request.headers.get("user-agent") || "";
        const ipAddress =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "127.0.0.1";
        const deviceFingerprint = `sb_${user.id.substring(0, 12)}`;

        const session = await registerUserSession({
          userId,
          deviceFingerprint,
          userAgent,
          ipAddress,
          email,
          role: targetRole,
        });

        // Set SabiProfile cryptographic tokens with shared domain
        response.cookies.set("sb_auth_token", session.accessToken, {
          path: "/",
          domain: cookieDomain,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 86400,
        });
        response.cookies.set(REFRESH_COOKIE_NAME, session.refreshToken, {
          path: "/",
          domain: cookieDomain,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 86400,
        });
        response.cookies.set("sabi_user_email", email, {
          path: "/",
          domain: cookieDomain,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 86400,
        });
        response.cookies.set("sabi_user_role", targetRole, {
          path: "/",
          domain: cookieDomain,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 86400,
        });

        telemetryLogger.record({
          subsystem: "SECURITY_AUTH",
          level: "SUCCESS",
          action: "OAUTH_LOGIN_SUCCESS",
          durationMs: 0,
          userId,
          message: `User ${email} authenticated successfully via Supabase OAuth.`,
          metadata: { email, role: targetRole, host: requestHost },
        });

        return response;
      } else if (sbError) {
        lastExchangeError = sbError.message;
        console.warn("[Auth Callback] Supabase code exchange did not match code:", sbError.message);
        telemetryLogger.record({
          subsystem: "SECURITY_AUTH",
          level: "WARN",
          action: "SUPABASE_CODE_EXCHANGE_FAILED",
          durationMs: 0,
          message: `Supabase code exchange rejected: ${sbError.message}`,
          errorCode: sbError.name || "AUTH_CODE_EXCHANGE_ERROR",
          metadata: { error: sbError.message, host: requestHost },
        });
      }
    } catch (supabaseErr: any) {
      lastExchangeError = supabaseErr?.message;
      console.warn("[Auth Callback] Supabase code exchange exception:", supabaseErr?.message);
    }
  }

  // 3. Direct Google OAuth Token Exchange Fallback
  try {
    await primeConfigCache();

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

    const configuredRedirectUri =
      (await getConfigValue("auth.google_redirect_uri")) ||
      getConfigValueSync("auth.google_redirect_uri") ||
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
      "";

    const redirectUri = resolveGoogleRedirectUri(request, {
      configuredUri: configuredRedirectUri,
    });

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
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (profileRes.ok) {
            const googleUser = await profileRes.json();
            const email = googleUser.email;
            const name = googleUser.name || "Google Citizen";
            const picture = googleUser.picture;

            const userId = `usr_${googleUser.sub?.substring(0, 8) || "google"}`;
            // Seed vault and profile (non-fatal: never block a valid Google sign-in)
            try {
              globalUserStore.getVault(userId);
              await profileAndAdvisorStore.updateProfile(userId, {
                fullName: name,
                avatarUrl: picture,
              });
            } catch (seedErr: any) {
              console.warn("[Auth Callback] Profile seeding warning (non-fatal):", seedErr?.message);
              telemetryLogger.record({
                subsystem: "SECURITY_AUTH",
                level: "WARN",
                action: "OAUTH_PROFILE_SEED_FAILED",
                durationMs: 0,
                userId,
                message: `Profile seeding failed for ${email}: ${seedErr?.message || "unknown"}`,
                metadata: { email, host: requestHost },
              });
            }

            const userAgent = request.headers.get("user-agent") || "";
            const ipAddress =
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
              request.headers.get("x-real-ip") ||
              "127.0.0.1";
            const deviceFingerprint = `google_${googleUser.sub?.substring(0, 12) || "web"}`;

            const session = await registerUserSession({
              userId,
              deviceFingerprint,
              userAgent,
              ipAddress,
              email,
              role: targetRole,
            });

            const response = NextResponse.redirect(new URL(safePath, canonicalOrigin));
            response.cookies.set("sb_auth_token", session.accessToken, {
              path: "/",
              domain: cookieDomain,
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            response.cookies.set(REFRESH_COOKIE_NAME, session.refreshToken, {
              path: "/",
              domain: cookieDomain,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 30 * 86400,
            });
            response.cookies.set("sabi_user_email", email, {
              path: "/",
              domain: cookieDomain,
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });
            response.cookies.set("sabi_user_role", targetRole, {
              path: "/",
              domain: cookieDomain,
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 86400,
            });

            telemetryLogger.record({
              subsystem: "SECURITY_AUTH",
              level: "SUCCESS",
              action: "DIRECT_GOOGLE_OAUTH_SUCCESS",
              durationMs: 0,
              userId,
              message: `User ${email} authenticated successfully via Direct Google OAuth.`,
              metadata: { email, role: targetRole, host: requestHost },
            });

            return response;
          }
        }
      } else {
        const errorText = await tokenRes.text();
        console.warn("[Auth Callback] Direct Google token exchange rejected:", tokenRes.status, errorText);
      }
    }
  } catch (directOAuthErr: any) {
    console.warn("[Auth Callback] Direct Google OAuth fallback failed:", directOAuthErr?.message);
    if (!lastExchangeError) lastExchangeError = directOAuthErr?.message;
  }

  // If all exchange mechanisms failed, redirect with informative error
  const descriptiveReason =
    lastExchangeError && lastExchangeError.length > 5
      ? lastExchangeError
      : "Authentication code is expired or invalid. Please click 'Continue with Google' to sign in.";

  telemetryLogger.record({
    subsystem: "SECURITY_AUTH",
    level: "ERROR",
    action: "OAUTH_CALLBACK_FAILED",
    durationMs: 0,
    message: descriptiveReason,
    metadata: { codeReceived: !!code, host: requestHost },
  });

  return NextResponse.redirect(
    new URL(
      `/login?error=auth_failed&error_description=${encodeURIComponent(descriptiveReason)}`,
      canonicalOrigin
    )
  );
}
