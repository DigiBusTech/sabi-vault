"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Check,
  X,
  RefreshCw,
  Mail,
  UserCheck,
  Info,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  TeamMember,
  OrgRole,
  TeamMemberStatus,
  ROLE_PERMISSIONS,
} from "@/core/enterprise/team_service";

interface OrganizationTeamViewProps {
  initialOrgId?: string;
}

const ROLE_DEFINITIONS: Record<OrgRole, {
  label: string;
  badgeColor: string;
  immigrationTitle: string;
  educationTitle: string;
  enterpriseTitle: string;
  description: string;
}> = {
  ORG_OWNER: {
    label: "Organization Owner",
    badgeColor: "bg-purple-100 text-purple-800 ring-1 ring-purple-300",
    immigrationTitle: "Managing Partner",
    educationTitle: "Chancellor / Registrar",
    enterpriseTitle: "Managing Director",
    description: "Full sovereign control over workspace, billing, API keys, criteria rubrics, and team management.",
  },
  ORG_ADMIN: {
    label: "Organization Admin",
    badgeColor: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    immigrationTitle: "Lead Immigration Director",
    educationTitle: "Dean of Admissions",
    enterpriseTitle: "Head of Talent Acquisition",
    description: "Manages all criteria rubrics, invites case officers/recruiters, views all candidate dossiers, dispatches final decisions.",
  },
  CASE_OFFICER_RECRUITER: {
    label: "Case Officer / Recruiter",
    badgeColor: "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
    immigrationTitle: "Regulated Immigration Case Officer",
    educationTitle: "Admissions Officer",
    enterpriseTitle: "Senior Technical Recruiter",
    description: "Evaluates single and batch candidate Scoped Keys, advances candidate pipeline stages, adds case scorecards and notes.",
  },
  INTERVIEWER_EVALUATOR: {
    label: "Interviewer / Evaluator",
    badgeColor: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
    immigrationTitle: "Consular Interview Panelist",
    educationTitle: "Faculty Reviewer",
    enterpriseTitle: "Hiring Manager / Tech Interviewer",
    description: "Conducts live and Sabi AI interviews with assigned shortlisted candidates and submits scorecards; no access to raw API keys.",
  },
  COMPLIANCE_AUDITOR: {
    label: "Compliance & Legal Auditor",
    badgeColor: "bg-slate-100 text-slate-800 ring-1 ring-slate-300",
    immigrationTitle: "Sovereign Immigration Auditor",
    educationTitle: "Academic Records Auditor",
    enterpriseTitle: "Legal & Regulatory Compliance Officer",
    description: "Read-only access to blockchain hash receipts, tamper alerts, and institutional query audit trails.",
  },
};

export function OrganizationTeamView({ initialOrgId = "org_covenant_gate" }: OrganizationTeamViewProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteFullName, setInviteFullName] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("CASE_OFFICER_RECRUITER");
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/enterprise/team?orgId=${initialOrgId}`);
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
      } else {
        setError(data.error || "Failed to load team members.");
      }
    } catch {
      setError("Network error fetching team members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFullName.trim() || !inviteEmail.trim()) return;
    setIsInviting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/enterprise/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: inviteFullName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) => [...prev, data.member]);
        setInviteSuccessLink(data.inviteLink);
      } else {
        setError(data.error || "Failed to invite member.");
      }
    } catch {
      setError("Network error sending invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: OrgRole) => {
    try {
      const res = await fetch("/api/v1/enterprise/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          action: "update_role",
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) => prev.map((m) => (m.id === memberId ? data.member : m)));
      }
    } catch {
      console.error("Failed to update role");
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const nextStatus: TeamMemberStatus = member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/v1/enterprise/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          action: "update_status",
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        setMembers((prev) => prev.map((m) => (m.id === member.id ? data.member : m)));
      }
    } catch {
      console.error("Failed to toggle status");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member from the workspace?")) return;
    try {
      const res = await fetch(`/api/v1/enterprise/team?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch {
      console.error("Failed to delete member");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const pendingCount = members.filter((m) => m.status === "INVITED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Multi-User Workspace & Role-Based Access Control (RBAC)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Collaborate securely with case officers, admissions evaluators, and hiring managers under strict cryptographic permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowInviteModal(true);
            setInviteSuccessLink(null);
            setInviteFullName("");
            setInviteEmail("");
          }}
          className="flex items-center gap-1.5 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
        >
          <UserPlus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Seats</span>
          <p className="mt-1 text-2xl font-black text-slate-900">{members.length}</p>
          <span className="text-[11px] text-slate-400">Allocated workspace seats</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Members</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</p>
          <span className="text-[11px] text-slate-400">Collaborating actively</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Invites</span>
          <p className="mt-1 text-2xl font-black text-amber-600">{pendingCount}</p>
          <span className="text-[11px] text-slate-400">Awaiting token activation</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Role Spectrum</span>
          <p className="mt-1 text-2xl font-black text-indigo-600">5 Tiers</p>
          <span className="text-[11px] text-slate-400">Consular, Academic & Tech</span>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 p-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" /> Authorized Workspace Members ({members.length})
          </span>
          <button
            type="button"
            onClick={loadMembers}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading team members...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No team members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Workspace Role & Terminology</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invited By / Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((member) => {
                  const roleDef = ROLE_DEFINITIONS[member.role];
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-white text-xs">
                            {member.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{member.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <select
                            value={member.role}
                            disabled={member.role === "ORG_OWNER"}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value as OrgRole)}
                            className="rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-slate-900 outline-none disabled:bg-slate-50"
                          >
                            <option value="ORG_OWNER">👑 Organization Owner</option>
                            <option value="ORG_ADMIN">🛡️ Organization Admin</option>
                            <option value="CASE_OFFICER_RECRUITER">💼 Case Officer / Recruiter</option>
                            <option value="INTERVIEWER_EVALUATOR">🎤 Interviewer / Evaluator</option>
                            <option value="COMPLIANCE_AUDITOR">⚖️ Compliance & Legal Auditor</option>
                          </select>
                          <span className="block text-[10px] text-slate-400 italic">
                            Equivalent: {roleDef.immigrationTitle} / {roleDef.educationTitle}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                              : member.status === "INVITED"
                              ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                              : "bg-rose-100 text-rose-800 ring-1 ring-rose-300"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        <div>{member.invitedByName || member.invitedBy || "System Genesis"}</div>
                        <div className="text-[10px] text-slate-400">
                          {member.joinedAt ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}` : `Invited ${new Date(member.invitedAt).toLocaleDateString()}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {member.status === "INVITED" && member.activationToken && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`/login/organization?inviteToken=${member.activationToken}&email=${encodeURIComponent(member.email)}`)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-emerald-700"
                              title="Copy activation link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {member.role !== "ORG_OWNER" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(member)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                                title={member.status === "ACTIVE" ? "Suspend member" : "Activate member"}
                              >
                                {member.status === "ACTIVE" ? <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                title="Remove member"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Spectrum Reference Box */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Tri-Sector Role-Based Access Control Architecture
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          SabiProfile RBAC permissions map automatically across Sovereign Immigration, Academic Admissions, and High-Skilled Tech Recruitment.
          Team members assigned the <strong>Case Officer / Recruiter</strong> role can evaluate candidate vaults and advance applicant pipeline stages,
          while <strong>Interviewers</strong> are strictly restricted to assigned shortlisted candidates with zero access to organization billing or developer API keys.
        </p>
      </div>

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowInviteModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Invite team member"
            className="relative w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Invite Workspace Team Member</h3>
                <p className="text-xs text-slate-500">Provide role permissions to collaborate in this workspace</p>
              </div>
            </div>

            {inviteSuccessLink ? (
              <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Invitation Generated Successfully!
                </div>
                <p className="text-xs text-emerald-800">
                  Share this secure 1-click activation link with <strong>{inviteEmail}</strong>:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin + inviteSuccessLink}
                    className="w-full rounded-lg border border-emerald-200 bg-white p-2 font-mono text-[11px] text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(inviteSuccessLink)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteSuccessLink(null);
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    placeholder="e.g. Barrister David Adeyemi or Sarah Jenkins"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@institution.com"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-700">Assigned Workspace Role *</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 font-semibold outline-none focus:border-emerald-500"
                  >
                    <option value="ORG_ADMIN">🛡️ Organization Admin (Lead Director / Dean)</option>
                    <option value="CASE_OFFICER_RECRUITER">💼 Case Officer / Recruiter (Screening & Pipeline)</option>
                    <option value="INTERVIEWER_EVALUATOR">🎤 Interviewer / Evaluator (Shortlist & Scorecard)</option>
                    <option value="COMPLIANCE_AUDITOR">⚖️ Compliance & Legal Auditor (Ledger & Forensics)</option>
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {ROLE_DEFINITIONS[inviteRole].description}
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting || !inviteFullName || !inviteEmail}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isInviting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
