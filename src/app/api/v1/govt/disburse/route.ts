import { NextRequest, NextResponse } from "next/server";
import { globalGovtStore } from "@/core/government/govt_store";
import { authorizeRoles } from "@/lib/auth/auth_guard";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await authorizeRoles(req, ["govt_auditor", "super_admin"]);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const body = await req.json();
    const { nodeId } = body;

    if (!nodeId) {
      return NextResponse.json({ error: "nodeId is required for disbursement." }, { status: 400 });
    }

    const result = globalGovtStore.executeDisbursement(nodeId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "GovTech 40% sovereign regional host micro-transaction disbursed via SabiRevenueSplitter.sol",
      disbursement: result.disbursement,
      nodes: globalGovtStore.listNodes(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


