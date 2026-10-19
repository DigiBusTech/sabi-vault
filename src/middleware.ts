import { NextRequest, NextResponse } from "next/server";
import { isScraperOrHeadless, applyStrictSecurityHeaders } from "@/lib/security/bot_defense";
import { REFRESH_COOKIE_NAME } from "@/lib/security/constants";

// Routes that require an active authenticated session
const PROTECTED_PAGE_PREFIXES = ["/dashboard"];
const PROTECTED_API_PREFIXES = [
  "/api/v1/vault",
  "/api/v1/enterprise",
  "/api/v1/admin",
  "/api/v1/govt",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // 1. Bot & AI Scraper Defense System
  const scraperCheck = isScraperOrHeadless(userAgent);
  const isProtectedPath =
    PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // If a scraper/headless agent targets protected routes without a valid machine org key, block it immediately
  if (isProtectedPath && scraperCheck.isDetected) {
    const orgKey = req.headers.get("x-sabi-org-key") || req.headers.get("X-Sabi-Org-Key");
    const adminKey = req.headers.get("x-sabi-admin-key") || req.headers.get("X-Sabi-Admin-Key");

    if (!orgKey && !adminKey) {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            error: "Automated scraper or unverified headless crawler blocked.",
            type: scraperCheck.type,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      } else {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("blocked", "bot_detected");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 2. Dashboard Route Guard
  const isDashboardPage = PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isDashboardPage) {
    // GAP-3 fix: Validate structural format of the refresh token, not just presence.
    // The refresh token is crypto.randomBytes(32).toString("hex") → 64 lowercase hex chars.
    // An attacker who sets a random/stale/expired cookie value will be rejected here.
    const refreshCookieValue = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    const hasValidRefreshCookie =
      typeof refreshCookieValue === "string" &&
      /^[0-9a-f]{64}$/.test(refreshCookieValue); // 64 lowercase hex chars — structural check only

    const hasSupabaseCookie = Array.from(req.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasValidRefreshCookie && !hasSupabaseCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }


  // 3. Forward request and apply strict enterprise security headers
  const response = NextResponse.next();
  applyStrictSecurityHeaders(response.headers);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public asset directories (images, fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
