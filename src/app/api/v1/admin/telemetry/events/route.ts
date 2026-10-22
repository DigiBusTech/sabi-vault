import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { liveTelemetry, TelemetryQueryFilter } from "@/lib/telemetry/live_logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/telemetry/events
 * Returns live streaming events and aggregated metrics for the Super Admin Mission Control.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
  }

  // Allow super_admin and govt_auditor to inspect telemetry
  const allowedRoles = ["super_admin", "govt_auditor"];
  if (!allowedRoles.includes(auth.user.role)) {
    return NextResponse.json(
      { error: "Access restricted: Live Telemetry is only accessible to super administrators and auditors." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const filter: TelemetryQueryFilter = {
    subsystem: searchParams.get("subsystem") || undefined,
    level: searchParams.get("level") || undefined,
    minDurationMs: searchParams.get("minDurationMs") ? Number(searchParams.get("minDurationMs")) : undefined,
    search: searchParams.get("search") || undefined,
    limit: searchParams.get("limit") ? Math.min(Number(searchParams.get("limit")), 500) : 100,
  };

  const events = liveTelemetry.query(filter);
  const stats = liveTelemetry.getStats();

  return NextResponse.json({
    status: "OK",
    events,
    stats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * DELETE /api/v1/admin/telemetry/events
 * Clears the in-memory circular ring buffer.
 */
export async function DELETE(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user || auth.user.role !== "super_admin") {
    return NextResponse.json(
      { error: "Administrative privilege required to reset telemetry buffer." },
      { status: 403 }
    );
  }

  liveTelemetry.clear();
  return NextResponse.json({
    status: "CLEARED",
    message: "Live telemetry buffer successfully cleared.",
    stats: liveTelemetry.getStats(),
  });
}

/**
 * POST /api/v1/admin/telemetry/events
 * Allows recording custom diagnostic probe events or triggering a test ping.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user || auth.user.role !== "super_admin") {
    return NextResponse.json({ error: "Access restricted" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const event = liveTelemetry.record({
      subsystem: body.subsystem || "API_ROUTER",
      level: body.level || "INFO",
      action: body.action || "MANUAL_DIAGNOSTIC_PROBE",
      durationMs: body.durationMs || 0,
      statusCode: body.statusCode || 200,
      errorCode: body.errorCode,
      message: body.message || "Manual diagnostic probe sent from Super Admin console.",
      metadata: body.metadata || {},
      userId: auth.user.userId,
    });

    return NextResponse.json({ status: "RECORDED", event });
  } catch (err: any) {
    return NextResponse.json({ error: "Invalid telemetry payload", details: err.message }, { status: 400 });
  }
}

