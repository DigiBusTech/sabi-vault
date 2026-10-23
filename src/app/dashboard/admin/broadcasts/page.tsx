import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BroadcastManager } from "@/components/admin/BroadcastManager";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastsPage() {
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
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Live Broadcast & Alert Console
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Publish real-time top-header announcement banners to all citizens, organizations, or platform-wide audiences.
        </p>
      </div>

      <BroadcastManager />
    </DashboardShell>
  );
}

