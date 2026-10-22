import { redirect } from "next/navigation";
import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE, ROLE_HEADLINES } from "@/lib/dashboard/nav";
import { CitizenVaultView } from "@/components/CitizenVaultView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, role, organization } = await getDashboardAuthContext();

  if (role === "enterprise_admin") redirect("/dashboard/enterprise");
  if (role === "govt_auditor") redirect("/dashboard/government");
  if (role === "super_admin") redirect("/dashboard/admin");

  const headline = ROLE_HEADLINES[role] ?? {
    title: "Your sovereign vault",
    sub: "Scan documents, mint scoped keys, and watch every access in real time.",
  };
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.citizen;

  return (
    <DashboardShell
      role={role}
      email={user.email || ""}
      orgName={organization?.name}
      navItems={navItems}
    >
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {headline.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{headline.sub}</p>
      </div>

      <CitizenVaultView viewMode="overview" />
    </DashboardShell>
  );
}
