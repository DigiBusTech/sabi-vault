import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { authenticateAdmin } from "@/lib/auth/auth_guard";
import { getConfigValue } from "@/core/config/platform_config";

/**
 * GET /api/v1/admin/telemetry
 * Returns global network metrics, sovereign node health, and 60/40 fee stats. (Admin only)
 */
export async function GET(req: NextRequest) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  const telemetry = globalAdminStore.getTelemetry();
  const nodes = SovereignNodeRouter.getAllNodes();
  const platformShare = Number(await getConfigValue("billing.platform_fee_percent")) || 60;
  const hostShare = Number(await getConfigValue("billing.sovereign_host_fee_percent")) || 40;
  const queryFee = Number(await getConfigValue("billing.standard_query_fee_usd")) || 1.0;

  return NextResponse.json({
    status: "SUCCESS",
    telemetry,
    sovereignNodes: nodes,
    revenueModel: {
      platformSharePercent: platformShare,
      sovereignHostSharePercent: hostShare,
      standardQueryFeeUsd: queryFee,
      contract: "SabiRevenueSplitter.sol (Base Sepolia)",
    },
  });
}


