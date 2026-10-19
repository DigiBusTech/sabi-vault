import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client for client components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase browser authentication is not configured.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
