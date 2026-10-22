import { NextRequest, NextResponse } from "next/server";
import {
  resetLockout,
  checkIpRateLimit,
  recordIpFailure,
} from "@/lib/security/lockout";
import {
  registerUserSession,
  computeSha256,
  REFRESH_COOKIE_NAME,
  DEVICE_COOKIE_NAME,
  REFRESH_TOKEN_TTL_DAYS,
  generateDeviceId,
} from "@/lib/security/session";
import { verifyBotDefense, isScraperOrHeadless } from "@/lib/security/bot_defense";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { UserRole } from "@/lib/auth/auth_guard";
import { evaluatePasswordComplexity } from "@/lib/security/password";
import { ensureVaultProfile } from "@/core/vault/profile_service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      deviceFingerprint: rawFingerprint,
      honeypot,
      mouseMovements,
      keystrokes,
      interactionTimeMs,
    } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 0. IP-Level Rate Limiting
    const ipCheck = checkIpRateLimit(ipAddress);
    if (ipCheck.isBlocked) {
      return NextResponse.json(
        {
          error: `Too many requests from this IP address. Please wait ${ipCheck.retryAfterSeconds} seconds.`,
          retryAfter: ipCheck.retryAfterSeconds,
        },
        { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSeconds || 900) } }
      );
    }

    // 1. Bot & AI Scraper Defense Check
    const scraperCheck = isScraperOrHeadless(userAgent);
    if (scraperCheck.isDetected && !req.headers.get("x-sabi-org-key")) {
      recordIpFailure(ipAddress);
      return NextResponse.json(
        {
          error: "Automated scraper or headless user-agent rejected.",
          pattern: scraperCheck.matchedPattern,
        },
        { status: 403 }
      );
    }

    const botCheck = verifyBotDefense({
      honeypot,
      mouseMovements,
      keystrokes,
      interactionTimeMs,
      userEmail: email,
      currentHost: req.headers.get("host") || undefined,
    });
    if (botCheck.isBot) {
      recordIpFailure(ipAddress);
      return NextResponse.json(
        { error: "Bot detection triggered: " + (botCheck.reason || "Suspicious automated behavior.") },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const identifier = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // 2. Strict Password Complexity Enforcement
    const passwordCheck = evaluatePasswordComplexity(password);
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        {
          error: passwordCheck.errors[0] || "Password does not meet security requirements.",
          errors: passwordCheck.errors,
          criteria: passwordCheck.criteria,
        },
        { status: 400 }
      );
    }

    // 3. Create User in Supabase Auth
    let createdUser: {
      id: string;
      email: string;
      role: UserRole;
      orgId?: string;
    } | null = null;
    let requiresEmailConfirmation = false;

    try {
      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: {
          data: {
            role: "citizen",
            sovereignNode: "ng-west-africa",
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists")
        ) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please sign in instead." },
            { status: 409 }
          );
        }
        throw error;
      }

      if (data.user) {
        createdUser = {
          id: data.user.id,
          email: data.user.email || identifier,
          role: "citizen",
        };

        // If email confirmation is enabled on Supabase project and no session returned
        if (!data.session) {
          requiresEmailConfirmation = true;
        }

        // Initialize vault profile in sovereign nodes schema
        try {
          await ensureVaultProfile({ id: data.user.id, email: identifier });
        } catch (dbErr) {
          console.debug("[Signup API] Profile initialization deferred:", dbErr);
        }
      }
    } catch (authErr) {
      console.warn("[Signup API] Supabase auth signup notice:", authErr);
    }

    // 5. Development / Sandbox fallback if Supabase not configured
    if (!createdUser && process.env.NODE_ENV !== "production") {
      const existingSandbox = globalAdminStore.getUser(identifier);
      if (existingSandbox) {
        return NextResponse.json(
          { error: "An account with this email already exists in sandbox. Please sign in instead." },
          { status: 409 }
        );
      }

      const generatedId = "usr_" + computeSha256(identifier).substring(0, 16);
      createdUser = {
        id: generatedId,
        email: identifier,
        role: "citizen",
      };

      globalAdminStore.registerUser({
        id: generatedId,
        email: identifier,
        name: identifier.split("@")[0],
        role: "citizen",
        sovereignNode: "ng-west-africa",
        status: "active",
        createdAt: new Date().toISOString(),
      });
    }

    if (!createdUser) {
      return NextResponse.json(
        { error: "Failed to create account. Please try again later." },
        { status: 500 }
      );
    }

    // 5. Clear any prior login lockout for this email now that the account is genuinely created
    await resetLockout(identifier);

    // 6. If email confirmation is required, do NOT issue session tokens or cookies yet
    if (requiresEmailConfirmation) {
      return NextResponse.json({
        success: true,
        message: "Account created! Please check your email to verify your sovereign vault before logging in.",
        requiresEmailConfirmation: true,
        user: createdUser,
      });
    }

    // 7. Device Identity & Session Registration (Only when instant session is permitted)
    const existingDeviceId = req.cookies.get(DEVICE_COOKIE_NAME)?.value;
    const deviceId = existingDeviceId || generateDeviceId();
    const effectiveFingerprint = computeSha256(
      `${rawFingerprint || ""}:${deviceId}:${userAgent}`
    );

    const sessionResult = await registerUserSession({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      orgId: createdUser.orgId,
      deviceFingerprint: effectiveFingerprint,
      ipAddress,
      userAgent,
    });

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: requiresEmailConfirmation
        ? "Account created! Please check your email to verify your sovereign vault."
        : "Your sovereign vault has been successfully created.",
      requiresEmailConfirmation,
      isNewDevice: sessionResult.isNewDevice,
      sessionId: sessionResult.sessionId,
      accessToken: sessionResult.accessToken,
      user: createdUser,
    });

    // Set Refresh Token HttpOnly Cookie
    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: sessionResult.refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });

    // Set Persistent Device Cookie
    response.cookies.set({
      name: DEVICE_COOKIE_NAME,
      value: deviceId,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[Auth API] Signup exception:", error);
    return NextResponse.json({ error: "Internal registration error." }, { status: 500 });
  }
}

