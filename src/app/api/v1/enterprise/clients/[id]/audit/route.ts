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
    const updatedClient = await agencyClientService.runConsularPreScreen(params.id);
    return NextResponse.json({
      success: true,
      client: updatedClient,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to execute consular audit" }, { status: 500 });
  }
}
