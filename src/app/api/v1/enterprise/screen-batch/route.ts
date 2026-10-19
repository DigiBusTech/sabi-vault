import { NextRequest, NextResponse } from "next/server";
import { globalCriteriaStore } from "@/core/enterprise/criteria_store";
import { authorizeRoles } from "@/lib/auth/auth_guard";

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();
    const { keys, rubricId, requestingOrg = "Enterprise Recruiter" } = body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: "keys array with at least one candidate scoped key is required." },
        { status: 400 }
      );
    }

    if (!rubricId) {
      return NextResponse.json(
        { error: "rubricId is required to define grounding criteria." },
        { status: 400 }
      );
    }

    const batchResult = await globalCriteriaStore.screenBatch(keys, rubricId, requestingOrg);

    return NextResponse.json({
      success: true,
      ...batchResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

