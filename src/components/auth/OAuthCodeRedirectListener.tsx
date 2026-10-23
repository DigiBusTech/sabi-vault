"use client";

import { useEffect } from "react";

/**
 * OAuthCodeRedirectListener
 * Client-side safety net that inspects the window URL for OAuth codes or access tokens
 * landing unexpectedly on pages like `/` or `/login`, and redirects to `/auth/callback`.
 *
 * This catches edge cases where:
 * 1. An identity provider (Supabase / Google) redirects to the default Site URL (`/`)
 * 2. Static page cache or service worker served the marketing page without hitting edge middleware
 * 3. Implicit OAuth hash fragments (#access_token=...) are present which are never sent to the server
 */
export function OAuthCodeRedirectListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const { pathname, search, hash } = window.location;

      // Only intervene if we are on root or login page and have OAuth payload
      if (pathname === "/" || pathname === "/login") {
        const urlParams = new URLSearchParams(search);
        // Do not redirect if there's already an error parameter on the login page
        if (urlParams.has("error")) return;

        const hasCode = urlParams.has("code");
        const hasHashToken = hash && (hash.includes("access_token=") || hash.includes("code="));

        if (hasCode || hasHashToken) {
          const target = `/auth/callback${search}${hash}`;
          window.location.replace(target);
        }
      }
    } catch (e) {
      console.warn("[OAuthCodeRedirectListener] Error checking OAuth parameters:", e);
    }
  }, []);

  return null;
}
