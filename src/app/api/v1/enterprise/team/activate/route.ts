import { NextRequest, NextResponse } from "next/server";
import { globalTeamService } from "@/core/enterprise/team_service";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token is required." }, { status: 400 });
  }

  // Check in-memory first
  let member = Array.from((globalTeamService as any).members.values() as any[]).find(
    (m: any) => m.activationToken === token
  );

  // If not found, check Supabase
  if (!member) {
    try {
      const admin = createAdminSupabaseClient();
      const { data, error } = await admin
        .from("enterprise_team_members")
        .select("*")
        .eq("activation_token", token)
        .single();
      if (!error && data) {
        member = {
          id: data.id,
          orgId: data.org_id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          status: data.status,
          activationToken: data.activation_token,
        };
      }
    } catch (err: any) {
      console.warn("[TeamActivationAPI] DB lookup notice:", err.message);
    }
  }

  if (!member) {
    return NextResponse.json(
      { valid: false, error: "Invitation token not found or already redeemed." },
      { status: 404 }
    );
  }

  if (member.status === "ACTIVE") {
    return NextResponse.json(
      { valid: false, error: "This invitation has already been accepted. Please sign in directly." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    email: member.email,
    fullName: member.fullName,
    role: member.role,
    orgId: member.orgId,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, fullName } = body;

    if (!token) {
      return NextResponse.json({ error: "Activation token is required." }, { status: 400 });
    }

    const activatedMember = await globalTeamService.acceptInvitation(token, fullName);

    if (!activatedMember) {
      return NextResponse.json(
        { error: "Invalid, expired, or already redeemed invitation token." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Workspace invitation successfully accepted. You may now access the organizational dashboard.",
      member: activatedMember,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error during invitation acceptance.", details: err.message },
      { status: 500 }
    );
  }
}

