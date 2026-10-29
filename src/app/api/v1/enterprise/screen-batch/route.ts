import { NextRequest, NextResponse } from "next/server";
import { globalCriteriaStore } from "@/core/enterprise/criteria_store";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { liveTelemetry } from "@/lib/telemetry/live_logger";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let rubricId = "";
  let keysCount = 0;

  try {
    const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
    if (!auth.authorized) {
      liveTelemetry.record({
        subsystem: "SECURITY_AUTH",
        level: "WARN",
        action: "SCREEN_BATCH_UNAUTHORIZED",
        durationMs: Date.now() - startTime,
        statusCode: 401,
        message: "Unauthorized attempt to run enterprise batch screening",
      });
      return auth.response!;
    }

    const body = await req.json();
    const { keys, rubricId: rId, requestingOrg = "Enterprise Recruiter" } = body;
    rubricId = rId;
    keysCount = Array.isArray(keys) ? keys.length : 0;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      liveTelemetry.record({
        subsystem: "API_ROUTER",
        level: "WARN",
        action: "SCREEN_BATCH_INVALID_PAYLOAD",
        durationMs: Date.now() - startTime,
        statusCode: 400,
        message: "Batch screening invoked without candidate keys",
      });
      return NextResponse.json(
        { error: "keys array with at least one candidate scoped key is required." },
        { status: 400 }
      );
    }

    if (!rubricId) {
      liveTelemetry.record({
        subsystem: "API_ROUTER",
        level: "WARN",
        action: "SCREEN_BATCH_MISSING_RUBRIC",
        durationMs: Date.now() - startTime,
        statusCode: 400,
        message: "Batch screening invoked without rubricId",
      });
      return NextResponse.json(
        { error: "rubricId is required to define grounding criteria." },
        { status: 400 }
      );
    }

    const batchResult = await globalCriteriaStore.screenBatch(keys, rubricId, requestingOrg);
    const durationMs = Date.now() - startTime;

    liveTelemetry.record({
      subsystem: "AI_AGENTS",
      level: "SUCCESS",
      action: "SCREEN_BATCH_EVALUATED",
      durationMs,
      statusCode: 200,
      message: `Batch screening evaluated ${batchResult.totalCandidates} candidates against rubric '${rubricId}': ${batchResult.qualifiedCount} qualified, ${batchResult.rejectedCount} rejected.`,
      metadata: {
        rubricId,
        requestingOrg,
        totalCandidates: batchResult.totalCandidates,
        qualifiedCount: batchResult.qualifiedCount,
        conditionallyQualifiedCount: batchResult.conditionallyQualifiedCount,
        rejectedCount: batchResult.rejectedCount,
      },
    });

    return NextResponse.json({
      success: true,
      ...batchResult,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    liveTelemetry.record({
      subsystem: "AI_AGENTS",
      level: "ERROR",
      action: "SCREEN_BATCH_FAILED",
      durationMs,
      statusCode: 500,
      errorCode: "SCREENING_PIPELINE_ERROR",
      message: error?.message || "Unknown error during enterprise candidate screening",
      metadata: {
        rubricId,
        keysCount,
        errorStack: error?.stack?.substring(0, 500),
      },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
