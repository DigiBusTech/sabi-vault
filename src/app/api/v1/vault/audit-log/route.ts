import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { authenticateUser } from "@/lib/auth/auth_guard";

/**
 * GET /api/v1/vault/audit-log
 * Returns privacy transparency audit log filtered strictly for the authenticated citizen.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
  }

  // Super admin can inspect all logs; citizen sees only their own vault's logs
  const auditLogs =
    auth.user.role === "super_admin"
      ? await globalUserStore.getAuditLogsAsync()
      : await globalUserStore.getAuditLogsAsync(auth.user.userId);

  return NextResponse.json({
    success: true,
    totalQueriesLogged: auditLogs.length,
    auditLogs,
  });
}
