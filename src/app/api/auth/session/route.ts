import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  REFRESH_COOKIE_NAME,
  getActiveSession,
  validateActiveUserSession,
} from "@/lib/security/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const refreshCookie = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

    // 1. Check Bearer Token
    if (bearer) {
      const verifyResult = verifyAccessToken(bearer);
      if (verifyResult.isValid && verifyResult.payload) {
        // Enforce active session check: verify this specific session is still active
        const activeSession = await getActiveSession(verifyResult.payload.sessionId);
        if (!activeSession || !activeSession.isActive) {
          const res = NextResponse.json(
            {
              isAuthenticated: false,
              terminated: true,
              code: "SESSION_TERMINATED_CONCURRENT",
              error: "This session has been terminated because your account was logged in from another device/browser.",
            },
            { status: 401 }
          );
          if (refreshCookie) {
            res.cookies.set({
              name: REFRESH_COOKIE_NAME,
              value: "",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 0,
            });
          }
          return res;
        }

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

    // 2. Check Refresh Cookie status
    if (refreshCookie) {
      const sessionCheck = await validateActiveUserSession("", refreshCookie);
      if (sessionCheck.isTerminated) {
        const res = NextResponse.json(
          {
            isAuthenticated: false,
            terminated: true,
            code: "SESSION_TERMINATED_CONCURRENT",
            error: "This session has been terminated because your account was logged in from another device/browser.",
          },
          { status: 401 }
        );
        res.cookies.set({
          name: REFRESH_COOKIE_NAME,
          value: "",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 0,
        });
        return res;
      }
    }

    // 3. Check Supabase Server Session
    try {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        // Check if single-session policy invalidated this user's current device
        const sessionValidation = await validateActiveUserSession(user.id, refreshCookie);
        if (sessionValidation.isTerminated) {
          const res = NextResponse.json(
            {
              isAuthenticated: false,
              terminated: true,
              code: "SESSION_TERMINATED_CONCURRENT",
              error: "This session has been terminated because your account was logged in from another device/browser.",
            },
            { status: 401 }
          );
          res.cookies.set({
            name: REFRESH_COOKIE_NAME,
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0,
          });
          return res;
        }

        return NextResponse.json({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.app_metadata?.role || "citizen",
            orgId: user.app_metadata?.org_id,
          },
        });
      }
    } catch {
      // Supabase unavailable
    }

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

