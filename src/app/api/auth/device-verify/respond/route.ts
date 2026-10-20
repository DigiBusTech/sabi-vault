import { NextRequest, NextResponse } from "next/server";
import { approveDeviceChallenge, rejectDeviceChallenge } from "@/lib/security/device_challenge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAccessToken, logSecurityEvent } from "@/lib/security/session";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    let userEmail: string | undefined;

    // Authenticate caller (must be active session)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const verified = verifyAccessToken(token);
      if (verified.isValid && verified.payload?.sub) {
        userId = verified.payload.sub;
        userEmail = verified.payload.email;
      }
    }

    if (!userId) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userEmail = user.email;
        }
      } catch {
        // Fall through
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized active session required." }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, action } = body;

    if (!challengeId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
    }

    let success = false;
    if (action === "approve") {
      success = await approveDeviceChallenge(challengeId, userId);
      if (success) {
        await logSecurityEvent({
          userUuid: userId,
          identifier: userEmail,
          eventType: "DEVICE_AUTHORIZATION_APPROVED",
          metadata: { challengeId },
        });
      }
    } else {
      success = await rejectDeviceChallenge(challengeId, userId);
      if (success) {
        await logSecurityEvent({
          userUuid: userId,
          identifier: userEmail,
          eventType: "DEVICE_AUTHORIZATION_REJECTED",
          metadata: { challengeId },
        });
      }
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to respond to challenge. It may have expired." }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error("[Device Verify API] Respond error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
