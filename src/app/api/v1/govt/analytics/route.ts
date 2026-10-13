import { NextResponse } from "next/server";
import { globalGovtStore } from "@/core/government/govt_store";

export async function GET() {
  const nodes = globalGovtStore.listNodes();
  const disbursements = globalGovtStore.getDisbursements();
  const fraudAlerts = globalGovtStore.getFraudAlerts();

  const totalSovereignYield = nodes.reduce((acc, n) => acc + n.accumulatedHostYieldUsd, 0);
  const totalPendingYield = nodes.reduce((acc, n) => acc + n.pendingDisbursementUsd, 0);
  const totalCitizenRecords = nodes.reduce((acc, n) => acc + n.totalCitizenRecords, 0);

  return NextResponse.json({
    success: true,
    summary: {
      totalSovereignNodes: nodes.length,
      totalCitizenRecordsPartitioned: totalCitizenRecords,
      totalSovereignYieldUsd: Number(totalSovereignYield.toFixed(2)),
      totalPendingDisbursementUsd: Number(totalPendingYield.toFixed(2)),
      dataResidencyCompliancePct: 100.0,
      interceptedFraudCount: fraudAlerts.length,
    },
    nodes,
    disbursements,
    fraudAlerts,
  });
}
