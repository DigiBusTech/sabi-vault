"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup";
  role?: "citizen" | "enterprise_admin";
  next?: string;
  className?: string;
}

export function GoogleAuthButton({
  mode = "signin",
  role = "citizen",
  next = "/dashboard",
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);

    // 1. Primary Strategy: Supabase Managed Google OAuth
    // (Used when Google provider is enabled in the Supabase Project Console)
    try {
      const supabase = createClient();
      const callbackOrigin = window.location.origin;
      const cleanCallback = `${callbackOrigin}/auth/callback`;

      // When targeting default /dashboard and citizen role, provide exact clean callback URI
      // so Supabase exact-match against Redirect URLs list succeeds without wildcard rejection
      const redirectTo =
        next === "/dashboard" && role === "citizen"
          ? cleanCallback
          : `${cleanCallback}?next=${encodeURIComponent(next)}&role=${role}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (!error && data?.url) {
        window.location.href = data.url;
        return;
      }

      console.warn(
        "[GoogleAuth] Supabase provider unavailable or returned error, falling back to direct route:",
        error?.message
      );
    } catch (sbErr: any) {
      console.warn(
        "[GoogleAuth] Supabase OAuth client exception, falling back to direct route:",
        sbErr?.message
      );
    }

    // 2. Resilient Fallback Strategy: SabiProfile Managed Direct Google OAuth route
    // (Uses Google Client ID & Secret configured in Super Admin dashboard and whitelisted in Google Cloud Console)
    try {
      const res = await fetch(
        `/api/v1/auth/google/signin?next=${encodeURIComponent(next)}&role=${role}&mode=json`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Google authentication failed.");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No authentication URL returned from server.");
      }
    } catch (err: any) {
      console.error("[Google Auth Error]:", err);
      setErrorMessage(err.message || "Could not connect to Google.");
      setLoading(false);
    }
  };

  const label =
    mode === "signup" ? "Fast sign up with Google" : "Continue with Google";

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{label}</span>
      </button>

      {errorMessage && (
        <p className="text-xs text-rose-600 text-center font-medium animate-in fade-in duration-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
