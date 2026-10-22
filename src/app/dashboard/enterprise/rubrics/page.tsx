import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { EnterpriseScreeningView } from "@/components/EnterpriseScreeningView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseRubricsPage() {
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
          Criteria Studio & Grounding Rules
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure the rubric candidates are evaluated against. Missing data fails the category; it is never guessed.
        </p>
      </div>

      <EnterpriseScreeningView viewMode="rubrics" />
    </DashboardShell>
  );
}
