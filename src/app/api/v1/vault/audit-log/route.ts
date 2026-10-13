import { NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";

export async function GET() {
  const auditLogs = globalUserStore.getAuditLogs();
  return NextResponse.json({
    success: true,
    totalQueriesLogged: auditLogs.length,
    auditLogs,
  });
}
