import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { SovereignAdvisorView } from "@/components/advisor/SovereignAdvisorView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AdvisorPage() {
  const { user, role, organization } = await getDashboardAuthContext("citizen");
  const navItems = NAV_BY_ROLE.citizen;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          AI Sovereign Target Advisor
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Autonomous guidance engine tracking your multi-target goals (visas, jobs, scholarships) with proactive gap alerts and readiness radar.
        </p>
      </div>

      <SovereignAdvisorView />
    </DashboardShell>
  );
}

