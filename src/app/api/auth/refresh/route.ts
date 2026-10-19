import { NextRequest, NextResponse } from "next/server";
import {
  rotateSessionToken,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_DAYS,
} from "@/lib/security/session";

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!rawRefreshToken) {
      return NextResponse.json(
        { error: "No refresh session token found.", code: "NO_SESSION" },
        { status: 401 }
      );
    }

    let incomingFingerprint: string | undefined;
    try {
      const body = await req.json();
      incomingFingerprint = body.deviceFingerprint;
    } catch {
      // Body may be empty on simple silent refresh calls
    }

    const refreshResult = await rotateSessionToken(rawRefreshToken, incomingFingerprint);

    if (!refreshResult.success) {
      const response = NextResponse.json(
        { error: refreshResult.error, code: refreshResult.code },
        { status: 401 }
      );
      // Clear invalidated cookie on client
      response.cookies.set({
        name: REFRESH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    const response = NextResponse.json({
      success: true,
      accessToken: refreshResult.accessToken,
      userId: refreshResult.session?.userUuid,
    });

    if (refreshResult.newRefreshToken) {
      response.cookies.set({
        name: REFRESH_COOKIE_NAME,
        value: refreshResult.newRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("[Auth API] Refresh exception:", error);
    return NextResponse.json({ error: "Failed to refresh token." }, { status: 500 });
  }
}
