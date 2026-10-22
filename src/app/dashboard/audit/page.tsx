import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { CitizenVaultView } from "@/components/CitizenVaultView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
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
          Immutable Privacy & Transparency Ledger
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cryptographic access receipts logged in real time. Zero dark surveillance of your records.
        </p>
      </div>

      <CitizenVaultView viewMode="audit" />
    </DashboardShell>
  );
}
