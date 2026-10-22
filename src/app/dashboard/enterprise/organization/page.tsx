import Link from "next/link";
import { Building2, ShieldCheck, Landmark } from "lucide-react";
import { getDashboardAuthContext } from "@/lib/dashboard/auth_context";
import { NAV_BY_ROLE } from "@/lib/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function EnterpriseOrganizationPage() {
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
          Organization Profile & Sovereign Binding
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your verified enterprise credentials, legal jurisdiction, and sovereign database binding.
        </p>
      </div>

      {organization ? (
        <div className="space-y-6">
          <div className="clean-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Building2 className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">{organization.name}</h2>
                  <p className="text-xs capitalize text-slate-500">
                    {organization.type?.replace(/_/g, " ").toLowerCase()} · {organization.jurisdiction}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {organization.status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization ID</span>
                <p className="mt-1 font-mono text-xs font-bold text-slate-900 truncate">{organization.id}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jurisdiction Node</span>
                <p className="mt-1 text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-600" />
                  {organization.jurisdiction || "West Africa (NG-LOS)"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate Limit</span>
                <p className="mt-1 text-xs font-bold text-slate-900">{organization.rateLimitPerMin || 60} evaluations / min</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">Organization setup incomplete</h2>
          <p className="mt-1 text-sm text-amber-800">
            Your account holds the enterprise role but is not bound to a registered organization on this node.{" "}
            <Link href="/signup/organization" className="font-bold underline">
              Complete organization setup
            </Link>
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
