import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { TalentPoolCRMView } from "@/components/enterprise/TalentPoolCRMView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseTalentPoolPage() {
  const { user, role, organization } = await getDashboardAuthContext(["enterprise_admin", "super_admin"]);
  const navItems = NAV_BY_ROLE.enterprise_admin;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-900 tracking-tight">
            Institutional Talent Pool & Dossier CRM
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Every candidate queried via Scoped Keys is captured here. Manage your pipeline across Immigration, Education, and Labour with verified two-tier cryptographic provenance.
          </p>
        </div>

        <TalentPoolCRMView initialOrgId={organization?.id || "org_covenant_gate"} />
      </div>
    </DashboardShell>
  );
}
