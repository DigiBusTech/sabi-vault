import { NextRequest, NextResponse } from "next/server";
import {
  invalidateSession,
  REFRESH_COOKIE_NAME,
  DEVICE_COOKIE_NAME,
} from "@/lib/security/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (rawRefreshToken) {
      await invalidateSession(rawRefreshToken);
    }

    // Also sign out from Supabase if active
    try {
      const supabase = createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Non-fatal
    }

    const response = NextResponse.json({
      success: true,
      message: "Session revoked and cookies cleared successfully.",
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Explicitly wipe refresh cookie
    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    // Device cookie can be cleared or kept; clear it on full reset
    response.cookies.set({
      name: DEVICE_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[Auth API] Logout exception:", error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
