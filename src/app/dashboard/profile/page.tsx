import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { HumanProfileEditor } from "@/components/profile/HumanProfileEditor";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
          Human Profile & Verified Attributes
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Comprehensive human identity: social presence, CEFR language levels, skill depth, cultural hobbies, and target roles.
        </p>
      </div>

      <HumanProfileEditor />
    </DashboardShell>
  );
}
