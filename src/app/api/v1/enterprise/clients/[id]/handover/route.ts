import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { agencyClientService } from "@/core/enterprise/agency_client_service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  try {
    const result = agencyClientService.generateClientHandoverAccess(params.id);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate client handover access" }, { status: 500 });
  }
}
