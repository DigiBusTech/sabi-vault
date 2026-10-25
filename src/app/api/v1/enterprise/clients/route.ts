import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { agencyClientService } from "@/core/enterprise/agency_client_service";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  const orgId = auth.user.orgId || "org_covenant_gate";
  const clients = agencyClientService.listClients(orgId);

  return NextResponse.json({
    success: true,
    totalClients: clients.length,
    clients,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { fullName, email, phone, nationality, destinationCountry, targetRoute, passportNumber } = body;

    if (!fullName || !email || !destinationCountry || !targetRoute) {
      return NextResponse.json(
        { error: "fullName, email, destinationCountry, and targetRoute are required." },
        { status: 400 }
      );
    }

    const orgId = auth.user.orgId || "org_covenant_gate";
    const dossier = agencyClientService.createClientDossier({
      orgId,
      fullName,
      email,
      phone,
      nationality: nationality || "Nigerian",
      destinationCountry,
      targetRoute,
      passportNumber,
    });

    return NextResponse.json({
      success: true,
      client: dossier,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create client dossier" }, { status: 500 });
  }
}
