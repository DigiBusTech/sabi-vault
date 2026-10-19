import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Ensures an authenticated Supabase user has a vault_profiles row on the
 * sovereign node. Defaults to the West Africa hub; users update citizenship
 * and residency during onboarding. Non-fatal by design: callers wrap this so
 * a missing service key never blocks sign-in.
 */
export async function ensureVaultProfile(user: { id: string; email?: string }): Promise<void> {
  const admin = createAdminSupabaseClient();

  const { data: existing, error: lookupError } = await admin
    .from("vault_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    console.error("[Vault] Profile lookup failed.", lookupError);
    return;
  }
  if (existing) return;

  const { error } = await admin.from("vault_profiles").insert({
    auth_user_id: user.id,
    user_id: user.id,
    email: user.email ?? "",
    citizenship_country: "NGA",
    residence_country: "NGA",
    sovereign_node_id: "ng-west-africa",
    status: "ACTIVE",
  });

  if (error) {
    console.error("[Vault] Profile creation failed.", error);
  }
}
