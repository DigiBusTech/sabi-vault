import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { SuperAdminView } from "@/components/SuperAdminView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  const { user, role, organization } = await getDashboardAuthContext("super_admin");
  const navItems = NAV_BY_ROLE.super_admin;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Enterprise Organizations & KYC Verification
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review, approve, and bind enterprise screening clients to regional sovereign data nodes.
        </p>
      </div>

      <SuperAdminView viewMode="organizations" />
    </DashboardShell>
  );
}

