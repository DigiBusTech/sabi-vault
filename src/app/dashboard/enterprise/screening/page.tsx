import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { EnterpriseScreeningView } from "@/components/EnterpriseScreeningView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseScreeningPage() {
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
          Candidate Evaluation & On-Chain Proof
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter a candidate scoped key to trigger multi-agent evaluation verified against the Base Sepolia ledger.
        </p>
      </div>

      <EnterpriseScreeningView viewMode="screening" />
    </DashboardShell>
  );
}
