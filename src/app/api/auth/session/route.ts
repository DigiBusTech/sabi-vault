import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, REFRESH_COOKIE_NAME, getActiveSession } from "@/lib/security/session";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (bearer) {
      const verifyResult = verifyAccessToken(bearer);
      if (verifyResult.isValid && verifyResult.payload) {
        return NextResponse.json({
          isAuthenticated: true,
          user: {
            id: verifyResult.payload.sub,
            email: verifyResult.payload.email,
            role: verifyResult.payload.role,
            orgId: verifyResult.payload.orgId,
          },
          sessionId: verifyResult.payload.sessionId,
        });
      }
    }

    // Check refresh cookie
    const refreshCookie = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (refreshCookie) {
      return NextResponse.json({
        isAuthenticated: false,
        canRefresh: true,
        message: "Access token missing or expired; refresh available.",
      });
    }

    return NextResponse.json({ isAuthenticated: false, canRefresh: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to query session." }, { status: 500 });
  }
}
