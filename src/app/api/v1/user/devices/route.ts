import { NextRequest, NextResponse } from "next/server";
import {
  getUserDeviceSessions,
  revokeUserDeviceSession,
  revokeAllUserDeviceSessions,
  deleteUserDeviceRecord,
  deleteAllUserDeviceRecords,
  verifyAccessToken,
  DEVICE_COOKIE_NAME,
} from "@/lib/security/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function resolveAuthenticatedUser(req: NextRequest): Promise<{
  userId: string;
  sessionId?: string;
} | null> {
  // 1. Check Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const verified = verifyAccessToken(token);
    if (verified.isValid && verified.payload?.sub) {
      return {
        userId: verified.payload.sub,
        sessionId: verified.payload.sessionId,
      };
    }
  }

  // 2. Check SSR Supabase session
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return {
        userId: user.id,
      };
    }
  } catch {
    // Non-fatal
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required to access device management." },
        { status: 401 }
      );
    }

    const currentFingerprint =
      req.headers.get("x-device-fingerprint") ||
      req.cookies.get(DEVICE_COOKIE_NAME)?.value ||
      undefined;

    const devices = await getUserDeviceSessions({
      userId: auth.userId,
      currentSessionId: auth.sessionId,
      currentFingerprint,
    });

    return NextResponse.json({
      success: true,
      devices,
    });
  } catch (err) {
    console.error("[User Devices API] GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve connected devices." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, sessionId } = body;

    if (action === "logout") {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Missing sessionId to log out." },
          { status: 400 }
        );
      }

      await revokeUserDeviceSession(auth.userId, sessionId);
      return NextResponse.json({
        success: true,
        message: "Device session has been logged out successfully.",
      });
    }

    if (action === "logout_all") {
      const revokedCount = await revokeAllUserDeviceSessions(
        auth.userId,
        auth.sessionId
      );
      return NextResponse.json({
        success: true,
        message: `Successfully logged out ${revokedCount} other active session(s).`,
        count: revokedCount,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'logout', 'logout_all'." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[User Devices API] POST error:", err);
    return NextResponse.json(
      { error: "Failed to perform session revocation." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await resolveAuthenticatedUser(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId, all } = body;

    if (all) {
      await deleteAllUserDeviceRecords(auth.userId);
      return NextResponse.json({
        success: true,
        message: "All device records successfully deleted from history.",
      });
    }

    if (sessionId) {
      await deleteUserDeviceRecord(auth.userId, sessionId);
      return NextResponse.json({
        success: true,
        message: "Device record deleted successfully.",
      });
    }

    return NextResponse.json(
      { error: "Provide 'sessionId' or 'all: true' to delete device history." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[User Devices API] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete device records." },
      { status: 500 }
    );
  }
}

