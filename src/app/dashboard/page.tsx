import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/auth/auth_guard";
import { globalAdminStore } from "@/core/admin/admin_store";
import { findOrganizationById } from "@/core/enterprise/org_repository";
import { ensureVaultProfile } from "@/core/vault/profile_service";
import { CitizenVaultView } from "@/components/CitizenVaultView";
import { EnterpriseScreeningView } from "@/components/EnterpriseScreeningView";
import { SovereignGovtView } from "@/components/SovereignGovtView";
import { SuperAdminView } from "@/components/SuperAdminView";
import { DashboardShell, ShellNavItem } from "@/components/dashboard/DashboardShell";

const roles: UserRole[] = ["citizen", "enterprise_admin", "notary", "govt_auditor", "super_admin"];

const NAV_BY_ROLE: Record<string, ShellNavItem[]> = {
  citizen: [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Add documents" },
    { id: "vault", label: "Vault" },
    { id: "keys", label: "Scoped keys" },
    { id: "audit", label: "Audit trail" },
  ],
  enterprise_admin: [
    { id: "overview", label: "Overview" },
    { id: "organization", label: "Organization" },
    { id: "rubrics", label: "Criteria studio" },
    { id: "screening", label: "Screening" },
  ],
  govt_auditor: [
    { id: "overview", label: "Overview" },
    { id: "nodes", label: "Regional nodes" },
    { id: "ledger", label: "Settlement ledger" },
    { id: "fraud", label: "Fraud radar" },
  ],
  super_admin: [
    { id: "overview", label: "Overview" },
    { id: "users", label: "System users" },
    { id: "organizations", label: "Organizations" },
    { id: "config", label: "Configuration" },
  ],
};

const ROLE_HEADLINES: Record<string, { title: string; sub: string }> = {
  citizen: {
    title: "Your sovereign vault",
    sub: "Scan documents, mint scoped keys, and watch every access in real time.",
  },
  enterprise_admin: {
    title: "Screening workspace",
    sub: "Define grounding rubrics and evaluate candidates against on-chain proof.",
  },
  govt_auditor: {
    title: "Regional oversight",
    sub: "Data-residency telemetry, settlement ledger, and the national fraud radar.",
  },
  super_admin: {
    title: "Control plane",
    sub: "Manage users, organizations, and runtime configuration from one place.",
  },
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const claimedRole = user.app_metadata?.role;
  const role = roles.includes(claimedRole as UserRole) ? (claimedRole as UserRole) : "citizen";
  const orgId = typeof user.app_metadata?.org_id === "string" ? user.app_metadata.org_id : undefined;
  const organization = orgId
    ? globalAdminStore.getOrganization(orgId) ?? (await findOrganizationById(orgId))
    : undefined;

  // Provision the sovereign-node vault profile on first authenticated landing.
  try {
    await ensureVaultProfile({ id: user.id, email: user.email });
  } catch {
    // Non-fatal: profile provisioning is retried on the next landing.
  }

  const headline = ROLE_HEADLINES[role] ?? {
    title: "Authenticated workspace",
    sub: "Privileged workspaces are provisioned by an administrator.",
  };
  const navItems = NAV_BY_ROLE[role] ?? [{ id: "overview", label: "Overview" }];

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {headline.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{headline.sub}</p>
      </div>

      {role === "citizen" && <CitizenVaultView />}

      {role === "enterprise_admin" && (
        <div className="space-y-10">
          <section id="organization" className="scroll-mt-24 lg:scroll-mt-8">
            {organization ? (
              <div className="clean-card dash-card-in rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-heading font-semibold text-slate-900">
                        {organization.name}
                      </h2>
                      <p className="text-xs capitalize text-slate-500">
                        {organization.type.replace(/_/g, " ").toLowerCase()} ·{" "}
                        {organization.jurisdiction}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {organization.status}
                    </span>
                    <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
                      org key issued at registration
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="font-semibold text-amber-900">Organization setup incomplete</h2>
                <p className="mt-1 text-sm text-amber-800">
                  Your account holds the enterprise role but is not bound to a registered
                  organization on this node.{" "}
                  <Link href="/signup/organization" className="font-bold underline">
                    Complete organization setup
                  </Link>
                </p>
              </div>
            )}
          </section>
          <EnterpriseScreeningView />
        </div>
      )}

      {role === "govt_auditor" && <SovereignGovtView />}

      {role === "super_admin" && <SuperAdminView />}

      {role === "notary" && (
        <section id="overview" className="scroll-mt-24 lg:scroll-mt-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-slate-900">
              Workspace provisioning required
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This account is authenticated, but a dedicated {role.replace(/_/g, " ")} workspace has
              not been connected yet. Privileged roles are assigned from the super admin control
              plane.
            </p>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
