import { NextRequest, NextResponse } from "next/server";
import { broadcastStore } from "@/core/notifications/broadcast_store";
import { BroadcastAudience } from "@/types/broadcast";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/broadcasts?audience=citizen|enterprise|all
 * Returns active, non-expired broadcast announcements for the requested audience scope.
 * Public/authenticated endpoint called by client dashboard banner listeners.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const audienceParam = (searchParams.get("audience") || "all") as BroadcastAudience;

    const validAudiences: BroadcastAudience[] = ["all", "citizen", "enterprise", "super_admin"];
    const targetAudience = validAudiences.includes(audienceParam) ? audienceParam : "all";

    const broadcasts = await broadcastStore.getActiveBroadcasts(targetAudience);

    return NextResponse.json({
      success: true,
      count: broadcasts.length,
      broadcasts,
    });
  } catch (err: any) {
    console.error("[Broadcasts API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch broadcasts", broadcasts: [] },
      { status: 500 }
    );
  }
}

