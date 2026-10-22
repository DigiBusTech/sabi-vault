import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { EnterpriseScreeningView } from "@/components/EnterpriseScreeningView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseOverviewPage() {
  const { user, role, organization } = await getDashboardAuthContext(["enterprise_admin", "super_admin"]);
  const navItems = NAV_BY_ROLE.enterprise_admin;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Screening Workspace Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Define grounding rubrics and evaluate candidates against on-chain proof.
        </p>
      </div>

      <EnterpriseScreeningView viewMode="overview" />
    </DashboardShell>
  );
}
