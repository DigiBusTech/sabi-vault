"use client";

/**
 * Client-Side In-Memory Token Manager & Silent Refresh Service
 * Keeps access tokens in memory (immune to localStorage XSS token theft),
 * refreshes silently via HttpOnly cookies before expiry, and handles full session wipe on logout.
 */

let inMemoryAccessToken: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshingPromise: Promise<string | null> | null = null;

export function getStoredAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredAccessToken(token: string | null): void {
  inMemoryAccessToken = token;

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (token) {
    // Access token is valid for 15 minutes. Schedule silent refresh at 13 minutes (780 seconds).
    const refreshDelayMs = 13 * 60 * 1000;
    refreshTimer = setTimeout(() => {
      silentRefreshToken().catch((err) => {
        console.warn("[Auth] Silent background refresh failed:", err);
      });
    }, refreshDelayMs);
  }
}

/**
 * Requests a new access token using the HttpOnly refresh token cookie.
 * Deduplicates concurrent requests using a shared promise.
 */
export async function silentRefreshToken(): Promise<string | null> {
  if (isRefreshingPromise) {
    return isRefreshingPromise;
  }

  isRefreshingPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send HttpOnly refresh cookie
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === "SESSION_TERMINATED_CONCURRENT") {
          // Alert user that another device logged in
          console.warn("[Auth] Session terminated: logged in from another device.");
        } else if (errorData.code === "SESSION_ABSOLUTE_EXPIRY") {
          // GAP-8: Session exceeded 30-day absolute lifetime — force re-authentication
          console.warn("[Auth] Session expired: absolute lifetime exceeded (30 days). Re-authentication required.");
        }
        setStoredAccessToken(null);
        return null;
      }


      const data = await response.json();
      if (data.accessToken) {
        setStoredAccessToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch (error) {
      console.error("[Auth] Silent token refresh network error:", error);
      return null;
    } finally {
      isRefreshingPromise = null;
    }
  })();

  return isRefreshingPromise;
}

/**
 * Authenticated Fetch wrapper.
 * Automatically injects the in-memory Bearer token.
 * Automatically attempts a silent refresh and retries if a 401 is encountered.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let token = getStoredAccessToken();

  if (!token) {
    token = await silentRefreshToken();
  }

  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // If unauthorized, attempt silent refresh once and retry
  if (response.status === 401 && token) {
    const newToken = await silentRefreshToken();
    if (newToken) {
      const retryHeaders = new Headers(init?.headers || {});
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  return response;
}

/**
 * Session Cookie Reset & Client Cache Wipe:
 * Explicitly wipes tokens, clears local/session storage, and invalidates server-side session rows.
 */
export async function logoutAndResetSession(): Promise<void> {
  // 1. Invalidate server-side session
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("[Auth] Logout request failed:", error);
  }

  // 2. Clear in-memory token and background timers
  setStoredAccessToken(null);

  // 3. Selectively clear storage — preserve the device fingerprint seed so that
  // subsequent logins from this device are recognized (GAP-5 fix).
  // Previously: localStorage.clear() wiped the device seed, making every post-logout
  // login appear as a NEW_DEVICE_LOGIN event, defeating the device recognition system.
  if (typeof window !== "undefined") {
    try {
      const DEVICE_SEED_KEY = "sb_persistent_device_seed";
      const deviceSeed = localStorage.getItem(DEVICE_SEED_KEY); // Preserve

      // Clear all app-specific auth caches
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== DEVICE_SEED_KEY) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Restore device seed immediately after clearing
      if (deviceSeed) {
        localStorage.setItem(DEVICE_SEED_KEY, deviceSeed);
      }

      sessionStorage.clear();
    } catch {
      // Storage access blocked
    }

    // 4. Redirect to login
    window.location.href = "/login";
  }
}
