import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { globalUserStore } from "@/core/vault/user_store";
import { STORAGE_TIER_CONFIGS } from "@/types/vault";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/quota
 * Returns the current authenticated user's tiered space quota,
 * dynamic structured JSON bytes used, Base Sepolia crypto gas spent,
 * and total documents count across sovereign categories.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const quota = globalUserStore.getUserQuota(auth.user.userId);

    return NextResponse.json({
      status: "SUCCESS",
      quota,
      tierConfigs: STORAGE_TIER_CONFIGS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to retrieve user storage quota", details: err.message },
      { status: 500 }
    );
  }
}
