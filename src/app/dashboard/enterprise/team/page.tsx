import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { OrganizationTeamView } from "@/components/enterprise/OrganizationTeamView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseTeamPage() {
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
            Team Members & Workspace Roles
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage multi-user collaboration across your organization. Assign granular role permissions across Consular, Academic, and Tech hiring tracks.
          </p>
        </div>

        <OrganizationTeamView initialOrgId={organization?.id || "org_covenant_gate"} />
      </div>
    </DashboardShell>
  );
}
