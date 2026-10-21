import { NextRequest, NextResponse } from "next/server";
import { getPendingChallengeForUser } from "@/lib/security/device_challenge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAccessToken } from "@/lib/security/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;

    // 1. Try bearer token
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const verified = verifyAccessToken(token);
      if (verified.isValid && verified.payload?.sub) {
        userId = verified.payload.sub;
      }
    }

    // 2. Try Supabase SSR session
    if (!userId) {
      try {
        const supabase = createServerSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {
        // Fall through
      }
    }

    if (!userId) {
      return NextResponse.json({ hasPending: false }, { status: 200 });
    }

    const pending = await getPendingChallengeForUser(userId);
    if (!pending) {
      return NextResponse.json({ hasPending: false }, { status: 200 });
    }

    // 3. Caller Device Guard: The requesting device must never be prompted to authorize itself
    const callerFingerprint =
      req.headers.get("x-device-fingerprint") ||
      req.nextUrl.searchParams.get("fingerprint");

    if (callerFingerprint && pending.deviceFingerprint === callerFingerprint) {
      return NextResponse.json({ hasPending: false }, { status: 200 });
    }

    return NextResponse.json({
      hasPending: true,
      challenge: {
        id: pending.id,
        deviceFingerprint: pending.deviceFingerprint,
        ipAddress: pending.ipAddress || "Unknown IP",
        userAgent: pending.userAgent || "Unknown Device",
        verificationCode: pending.verificationCode,
        createdAt: pending.createdAt,
        expiresAt: pending.expiresAt,
      },
    });
  } catch (err) {
    console.error("[Device Verify API] Pending check error:", err);
    return NextResponse.json({ hasPending: false }, { status: 200 });
  }
}
