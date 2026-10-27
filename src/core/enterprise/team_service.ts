import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type OrgRole =
  | "ORG_OWNER"
  | "ORG_ADMIN"
  | "CASE_OFFICER_RECRUITER"
  | "INTERVIEWER_EVALUATOR"
  | "COMPLIANCE_AUDITOR";

export type TeamMemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface RolePermissions {
  canManageTeam: boolean;
  canManageRubrics: boolean;
  canScreenCandidates: boolean;
  canViewTalentPool: boolean;
  canUpdatePipelineStatus: boolean;
  canScheduleInterviews: boolean;
  canManageApiKeys: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<OrgRole, RolePermissions> = {
  ORG_OWNER: {
    canManageTeam: true,
    canManageRubrics: true,
    canScreenCandidates: true,
    canViewTalentPool: true,
    canUpdatePipelineStatus: true,
    canScheduleInterviews: true,
    canManageApiKeys: true,
    canViewAuditLogs: true,
  },
  ORG_ADMIN: {
    canManageTeam: true,
    canManageRubrics: true,
    canScreenCandidates: true,
    canViewTalentPool: true,
    canUpdatePipelineStatus: true,
    canScheduleInterviews: true,
    canManageApiKeys: true,
    canViewAuditLogs: true,
  },
  CASE_OFFICER_RECRUITER: {
    canManageTeam: false,
    canManageRubrics: false,
    canScreenCandidates: true,
    canViewTalentPool: true,
    canUpdatePipelineStatus: true,
    canScheduleInterviews: true,
    canManageApiKeys: false,
    canViewAuditLogs: true,
  },
  INTERVIEWER_EVALUATOR: {
    canManageTeam: false,
    canManageRubrics: false,
    canScreenCandidates: false,
    canViewTalentPool: true,
    canUpdatePipelineStatus: false,
    canScheduleInterviews: true,
    canManageApiKeys: false,
    canViewAuditLogs: false,
  },
  COMPLIANCE_AUDITOR: {
    canManageTeam: false,
    canManageRubrics: false,
    canScreenCandidates: false,
    canViewTalentPool: true,
    canUpdatePipelineStatus: false,
    canScheduleInterviews: false,
    canManageApiKeys: false,
    canViewAuditLogs: true,
  },
};

export interface TeamMember {
  id: string;
  orgId: string;
  email: string;
  fullName: string;
  role: OrgRole;
  status: TeamMemberStatus;
  invitedBy?: string;
  invitedByName?: string;
  invitedAt: string;
  joinedAt?: string;
  activationToken?: string;
  permissions: RolePermissions;
}

class OrganizationTeamService {
  private members: Map<string, TeamMember> = new Map();

  constructor() {
    this.seedInitialTeam();
  }

  private seedInitialTeam() {
    const orgId = "org_covenant_gate";
    const members: TeamMember[] = [
      {
        id: "mem_sarah_jenkins_owner",
        orgId,
        email: "sarah.jenkins@covenantgate.com",
        fullName: "Dr. Sarah Jenkins",
        role: "ORG_OWNER",
        status: "ACTIVE",
        invitedAt: "2026-08-01T08:00:00Z",
        joinedAt: "2026-08-01T08:05:00Z",
        permissions: ROLE_PERMISSIONS.ORG_OWNER,
      },
      {
        id: "mem_david_adeyemi_admin",
        orgId,
        email: "david.adeyemi@covenantgate.com",
        fullName: "Barrister David Adeyemi",
        role: "ORG_ADMIN",
        status: "ACTIVE",
        invitedBy: "Dr. Sarah Jenkins",
        invitedAt: "2026-08-15T10:00:00Z",
        joinedAt: "2026-08-15T11:30:00Z",
        permissions: ROLE_PERMISSIONS.ORG_ADMIN,
      },
      {
        id: "mem_tariq_almansoor_recruiter",
        orgId,
        email: "tariq.almansoor@covenantgate.com",
        fullName: "Tariq Al-Mansoor",
        role: "CASE_OFFICER_RECRUITER",
        status: "ACTIVE",
        invitedBy: "Barrister David Adeyemi",
        invitedAt: "2026-09-01T09:00:00Z",
        joinedAt: "2026-09-01T14:00:00Z",
        permissions: ROLE_PERMISSIONS.CASE_OFFICER_RECRUITER,
      },
      {
        id: "mem_elena_rostova_interviewer",
        orgId,
        email: "elena.rostova@covenantgate.com",
        fullName: "Prof. Elena Rostova",
        role: "INTERVIEWER_EVALUATOR",
        status: "INVITED",
        invitedBy: "Dr. Sarah Jenkins",
        invitedAt: "2026-10-20T12:00:00Z",
        activationToken: "tok_invite_elena_2026",
        permissions: ROLE_PERMISSIONS.INTERVIEWER_EVALUATOR,
      },
    ];

    members.forEach((m) => this.members.set(m.id, m));
  }

  public listMembers(orgId: string): TeamMember[] {
    return Array.from(this.members.values()).filter(
      (m) => (orgId === "org_all" ? true : m.orgId === orgId)
    );
  }

  public async listMembersAsync(orgId: string): Promise<TeamMember[]> {
    try {
      const admin = createAdminSupabaseClient();
      let query = admin.from("enterprise_team_members").select("*");
      if (orgId !== "org_all") {
        query = query.eq("org_id", orgId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        for (const row of data) {
          const role = (row.role as OrgRole) || "CASE_OFFICER_RECRUITER";
          const member: TeamMember = {
            id: row.id,
            orgId: row.org_id,
            email: row.email,
            fullName: row.full_name,
            role,
            status: row.status as TeamMemberStatus,
            invitedBy: row.invited_by,
            invitedByName: row.invited_by_name,
            invitedAt: row.invited_at,
            joinedAt: row.joined_at,
            activationToken: row.activation_token,
            permissions: row.permissions || ROLE_PERMISSIONS[role],
          };
          this.members.set(member.id, member);
        }
      }
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB list notice:", err.message);
    }
    return this.listMembers(orgId);
  }

  public getMember(id: string): TeamMember | undefined {
    return this.members.get(id);
  }

  public hasPermission(role: OrgRole, permission: keyof RolePermissions): boolean {
    return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
  }

  public async inviteMember(params: {
    orgId: string;
    email: string;
    fullName: string;
    role: OrgRole;
    invitedBy?: string;
    invitedByName?: string;
  }): Promise<{ member: TeamMember; inviteLink: string }> {
    const { orgId, email, fullName, role, invitedBy, invitedByName } = params;
    const token = `tok_invite_${randomBytes(12).toString("hex")}`;
    const memberId = `mem_${randomBytes(6).toString("hex")}`;

    const member: TeamMember = {
      id: memberId,
      orgId,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      status: "INVITED",
      invitedBy,
      invitedByName,
      invitedAt: new Date().toISOString(),
      activationToken: token,
      permissions: ROLE_PERMISSIONS[role],
    };

    this.members.set(memberId, member);

    // Persist to Supabase if configured
    try {
      const admin = createAdminSupabaseClient();
      await admin.from("enterprise_team_members").upsert(
        {
          id: member.id,
          org_id: member.orgId,
          email: member.email,
          full_name: member.fullName,
          role: member.role,
          status: member.status,
          invited_by: member.invitedBy,
          invited_at: member.invitedAt,
          activation_token: member.activationToken,
          created_at: member.invitedAt,
        },
        { onConflict: "id" }
      );
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB invite notice:", err.message);
    }

    const inviteLink = `/login/organization?inviteToken=${token}&email=${encodeURIComponent(member.email)}`;

    // Event-driven email dispatch for team invitation
    try {
      const { globalEmailService } = await import("@/core/notifications/email_service");
      await globalEmailService.sendEmail({
        templateId: "tpl_interview_invite",
        recipientEmail: member.email,
        customSubject: `Workspace Invitation: Join ${orgId} on SabiProfile`,
        overrideHtml: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="background-color: #064e3b; color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700;">SabiProfile Workspace Invitation</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${orgId} has invited you to collaborate</p>
            </div>
            <p style="font-size: 14px; color: #334155;">Hello <strong>${member.fullName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              You have been granted <strong>${role}</strong> role access to the <strong>${orgId}</strong> sovereign workspace on SabiProfile.
            </p>
            <a href="https://sabiprofile.com${inviteLink}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 16px 0;">Accept Invitation & Activate Account</a>
            <p style="font-size: 12px; color: #94a3b8;">If you did not anticipate this invitation, you may ignore this automated message.</p>
          </div>
        `,
      });
    } catch (emailErr: any) {
      console.warn("[OrganizationTeamService] Invite email dispatch notice:", emailErr.message);
    }

    return { member, inviteLink };
  }

  public async updateMemberRole(id: string, newRole: OrgRole): Promise<TeamMember | null> {
    const member = this.members.get(id);
    if (!member) return null;

    member.role = newRole;
    member.permissions = ROLE_PERMISSIONS[newRole];
    this.members.set(id, member);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_team_members")
        .update({ role: newRole })
        .eq("id", id);
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB role update notice:", err.message);
    }
    return member;
  }

  public async updateMemberStatus(id: string, status: TeamMemberStatus): Promise<TeamMember | null> {
    const member = this.members.get(id);
    if (!member) return null;

    member.status = status;
    if (status === "ACTIVE" && !member.joinedAt) {
      member.joinedAt = new Date().toISOString();
      member.activationToken = undefined;
    }
    this.members.set(id, member);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_team_members")
        .update({ status, joined_at: member.joinedAt })
        .eq("id", id);
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB status update notice:", err.message);
    }
    return member;
  }

  public async removeMember(id: string): Promise<boolean> {
    const deleted = this.members.delete(id);
    try {
      const admin = createAdminSupabaseClient();
      await admin.from("enterprise_team_members").delete().eq("id", id);
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB remove notice:", err.message);
    }
    return deleted;
  }

  public async acceptInvitation(token: string, newFullName?: string): Promise<TeamMember | null> {
    let member = Array.from(this.members.values()).find((m) => m.activationToken === token);

    if (!member) {
      try {
        const admin = createAdminSupabaseClient();
        const { data } = await admin.from("enterprise_team_members").select("*").eq("activation_token", token).single();
        if (data) {
          const role = (data.role as OrgRole) || "CASE_OFFICER_RECRUITER";
          member = {
            id: data.id,
            orgId: data.org_id,
            email: data.email,
            fullName: data.full_name,
            role,
            status: data.status as TeamMemberStatus,
            invitedBy: data.invited_by,
            invitedByName: data.invited_by_name,
            invitedAt: data.invited_at,
            joinedAt: data.joined_at,
            activationToken: data.activation_token,
            permissions: data.permissions || ROLE_PERMISSIONS[role],
          };
          this.members.set(member.id, member);
        }
      } catch (e: any) {
        console.warn("[OrganizationTeamService] DB token lookup notice:", e.message);
      }
    }

    if (!member) return null;

    if (newFullName && newFullName.trim()) {
      member.fullName = newFullName.trim();
    }
    member.status = "ACTIVE";
    member.joinedAt = new Date().toISOString();
    this.members.set(member.id, member);

    try {
      const admin = createAdminSupabaseClient();
      await admin
        .from("enterprise_team_members")
        .update({
          status: "ACTIVE",
          full_name: member.fullName,
          joined_at: member.joinedAt,
        })
        .eq("id", member.id);
    } catch (err: any) {
      console.warn("[OrganizationTeamService] DB accept notice:", err.message);
    }

    return member;
  }
}

export const globalTeamService = new OrganizationTeamService();
