import { NextRequest, NextResponse } from "next/server";
import { confirmDeviceChallenge } from "@/lib/security/device_challenge";
import {
  registerUserSession,
  generateDeviceId,
  REFRESH_COOKIE_NAME,
  DEVICE_COOKIE_NAME,
  REFRESH_TOKEN_TTL_DAYS,
} from "@/lib/security/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { globalAdminStore } from "@/core/admin/admin_store";
import { UserRole } from "@/lib/auth/auth_guard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challengeId, verificationCode } = body;

    if (!challengeId) {
      return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });
    }

    // 1. Confirm challenge
    const result = await confirmDeviceChallenge({
      challengeId,
      code: verificationCode,
    });

    if (!result.success || !result.challenge) {
      return NextResponse.json(
        { error: result.error || "Device verification failed or awaiting approval." },
        { status: 400 }
      );
    }

    const { challenge } = result;

    // 2. Fetch user profile to resolve role & org
    let role: UserRole = "citizen";
    let orgId: string | undefined;
    let email: string = challenge.userEmail || "";

    try {
      const adminSupabase = createAdminSupabaseClient();
      const { data } = await adminSupabase.auth.admin.getUserById(challenge.userId);
      if (data?.user) {
        email = data.user.email || email;
        role = (data.user.app_metadata?.role as UserRole) || "citizen";
        orgId = (data.user.app_metadata?.org_id as string) || undefined;
      }
    } catch {
      // Fall through
    }

    // Dev/sandbox fallback
    if (!email || email === "") {
      const sandboxUser = globalAdminStore.getUser(challenge.userId);
      if (sandboxUser) {
        email = sandboxUser.email;
        role = "citizen";
      }
    }

    // 3. Register session for the verified new device
    const deviceId = challenge.deviceId || req.cookies.get(DEVICE_COOKIE_NAME)?.value || generateDeviceId();

    const sessionResult = await registerUserSession({
      userId: challenge.userId,
      email,
      role,
      orgId,
      deviceFingerprint: challenge.deviceFingerprint,
      ipAddress: challenge.ipAddress,
      userAgent: challenge.userAgent,
    });

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "Device successfully authorized and registered.",
      accessToken: sessionResult.accessToken,
      user: {
        id: challenge.userId,
        email,
        role,
        orgId,
      },
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
  } catch (err) {
    console.error("[Device Verify API] Confirm error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

