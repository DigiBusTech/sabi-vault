import { NextRequest, NextResponse } from "next/server";
import { liveTelemetry, TelemetrySubsystem, TelemetryLevel } from "@/lib/telemetry/live_logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/telemetry/report
 * Ingestion point for client-side operational errors:
 * - Vercel HTTP 413 Function Payload Too Large rejections
 * - Mobile camera hardware and permission failures
 * - Client-side network dropouts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subsystem = "API_ROUTER",
      level = "ERROR",
      action = "CLIENT_ERROR_REPORT",
      statusCode = 500,
      errorCode = "CLIENT_ERROR",
      message = "Unspecified client error",
      metadata = {},
      userId,
    } = body;

    liveTelemetry.record({
      subsystem: subsystem as TelemetrySubsystem,
      level: level as TelemetryLevel,
      action: String(action),
      durationMs: 0,
      statusCode: Number(statusCode),
      errorCode: String(errorCode),
      message: String(message),
      metadata: typeof metadata === "object" ? metadata : {},
      userId: userId ? String(userId) : undefined,
    });

    return NextResponse.json({ status: "RECORDED" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record telemetry", details: err.message }, { status: 400 });
  }
}

