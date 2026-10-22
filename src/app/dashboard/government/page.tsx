import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { SovereignGovtView } from "@/components/SovereignGovtView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function GovtOverviewPage() {
  const { user, role, organization } = await getDashboardAuthContext(["govt_auditor", "super_admin"]);
  const navItems = NAV_BY_ROLE.govt_auditor;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          National Sovereign Telemetry Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Regional data-residency health, host yield settlement, and the national fraud radar.
        </p>
      </div>

      <SovereignGovtView viewMode="overview" />
    </DashboardShell>
  );
}

