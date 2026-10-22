import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REFRESH_COOKIE_NAME, validateActiveUserSession } from "@/lib/security/session";
import { UserRole } from "@/lib/auth/auth_guard";
import { globalAdminStore } from "@/core/admin/admin_store";
import { findOrganizationById } from "@/core/enterprise/org_repository";
import { ensureVaultProfile } from "@/core/vault/profile_service";

export async function getDashboardAuthContext(requiredRole?: UserRole | UserRole[]) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const cookieStore = cookies();
  const refreshCookie = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const sessionCheck = await validateActiveUserSession(user.id, refreshCookie);
  if (sessionCheck.isTerminated) {
    redirect("/login?terminated=concurrent");
  }

  const claimedRole = user.app_metadata?.role as UserRole | undefined;
  const role: UserRole = claimedRole || "citizen";

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(role)) {
      if (role === "enterprise_admin") redirect("/dashboard/enterprise");
      if (role === "govt_auditor") redirect("/dashboard/government");
      if (role === "super_admin") redirect("/dashboard/admin");
      redirect("/dashboard");
    }
  }

  const orgId = typeof user.app_metadata?.org_id === "string" ? user.app_metadata.org_id : undefined;
  const organization = orgId
    ? globalAdminStore.getOrganization(orgId) ?? (await findOrganizationById(orgId))
    : undefined;

  try {
    await ensureVaultProfile({ id: user.id, email: user.email });
  } catch {
    // Non-fatal
  }

  return { user, role, organization };
}
