import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for client components.
 * Configured with shared apex domain cookie options (.sabiprofile.com)
 * so PKCE code verifiers and session tokens persist smoothly across
 * both `www.sabiprofile.com` and `sabiprofile.com`.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser authentication is not configured.");
  }

  const isBrowser = typeof window !== "undefined";
  const hostname = isBrowser ? window.location.hostname.toLowerCase() : "";
  const isProduction = hostname.endsWith("sabiprofile.com");

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: isProduction ? ".sabiprofile.com" : undefined,
      path: "/",
      sameSite: "lax",
      secure: isBrowser ? window.location.protocol === "https:" : false,
    },
  });
}
