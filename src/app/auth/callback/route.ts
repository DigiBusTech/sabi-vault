import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedPath = requestUrl.searchParams.get("next") || "/dashboard";
  const requestedUrl = new URL(requestedPath, requestUrl.origin);
  const safePath = requestedUrl.origin === requestUrl.origin
    ? `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
    : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation_failed", requestUrl.origin));
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[Auth] Email confirmation callback failed.", error);
    return NextResponse.redirect(new URL("/login?error=confirmation_failed", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(safePath, requestUrl.origin));
}
