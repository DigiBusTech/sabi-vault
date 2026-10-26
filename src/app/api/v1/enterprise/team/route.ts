import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { globalTeamService, OrgRole, TeamMemberStatus } from "@/core/enterprise/team_service";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || auth.user.orgId || "org_covenant_gate";
  const members = globalTeamService.listMembers(orgId);

  return NextResponse.json({
    success: true,
    totalMembers: members.length,
    members,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { email, fullName, role } = body;

    if (!email || !fullName || !role) {
      return NextResponse.json(
        { error: "email, fullName, and role are required." },
        { status: 400 }
      );
    }

    const orgId = auth.user.orgId || "org_covenant_gate";
    const result = await globalTeamService.inviteMember({
      orgId,
      email,
      fullName,
      role: role as OrgRole,
      invitedBy: auth.user.userId,
      invitedByName: (auth.user as any).fullName || "Organization Admin",
    });

    return NextResponse.json({
      success: true,
      member: result.member,
      inviteLink: result.inviteLink,
      message: `Invitation generated for ${email}. Activation link is ready.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to invite team member." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { memberId, action, role, status } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required." }, { status: 400 });
    }

    if (action === "update_role" && role) {
      const updated = await globalTeamService.updateMemberRole(memberId, role as OrgRole);
      if (!updated) return NextResponse.json({ error: "Member not found." }, { status: 404 });
      return NextResponse.json({ success: true, member: updated });
    }

    if (action === "update_status" && status) {
      const updated = await globalTeamService.updateMemberStatus(memberId, status as TeamMemberStatus);
      if (!updated) return NextResponse.json({ error: "Member not found." }, { status: 404 });
      return NextResponse.json({ success: true, member: updated });
    }

    return NextResponse.json({ error: "Valid action ('update_role' or 'update_status') is required." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update member." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId parameter is required." }, { status: 400 });
  }

  const ok = await globalTeamService.removeMember(memberId);
  return NextResponse.json({ success: ok });
}
