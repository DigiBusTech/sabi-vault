import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { DeveloperApiKeysView } from "@/components/enterprise/DeveloperApiKeysView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DeveloperApiKeysPage() {
  const { user, role, organization } = await getDashboardAuthContext(["enterprise_admin", "super_admin"]);
  const navItems = NAV_BY_ROLE.enterprise_admin;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <DeveloperApiKeysView />
    </DashboardShell>
  );
}
