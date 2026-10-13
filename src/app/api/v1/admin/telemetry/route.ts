import { NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";

/**
 * GET /api/v1/admin/telemetry
 * Returns global network metrics, sovereign node health, and 60/40 fee stats.
 */
export async function GET() {
  const telemetry = globalAdminStore.getTelemetry();
  const nodes = SovereignNodeRouter.getAllNodes();

  return NextResponse.json({
    status: "SUCCESS",
    telemetry,
    sovereignNodes: nodes,
    revenueModel: {
      platformSharePercent: 60,
      sovereignHostSharePercent: 40,
      contract: "SabiRevenueSplitter.sol (Base Sepolia)",
    },
  });
}
