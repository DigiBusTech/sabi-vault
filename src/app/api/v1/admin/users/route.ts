import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { authenticateAdmin, UserRole } from "@/lib/auth/auth_guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const VALID_ROLES: UserRole[] = ["citizen", "enterprise_admin", "notary", "govt_auditor", "super_admin"];

/**
 * GET /api/v1/admin/users
 * Lists real Supabase Auth accounts merged with their vault profile and
 * in-memory compliance status. Falls back to the in-memory registry when
 * the service role is unconfigured. (Super Admin only)
 */
export async function GET(req: NextRequest) {
  const adminCheck = await authenticateAdmin(req);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
  }

  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    const { data: profiles } = await admin
      .from("vault_profiles")
      .select("auth_user_id, sovereign_node_id, residence_country, citizenship_country, created_at");

    const profileByUserId = new Map((profiles || []).map((p: any) => [p.auth_user_id, p]));

    const users = data.users.map((u) => {
      const profile = profileByUserId.get(u.id) as any;
      const storeRecord = globalAdminStore.getUser(u.id);
      return {
        id: u.id,
        email: u.email || "",
        role: (u.app_metadata?.role as UserRole) || "citizen",
        orgId: typeof u.app_metadata?.org_id === "string" ? u.app_metadata.org_id : null,
        accountStatus:
          (u.app_metadata?.account_status as string) || storeRecord?.status || "ACTIVE",
        sovereignNode: profile?.sovereign_node_id || u.app_metadata?.sovereignNode || null,
        residenceCountry: profile?.residence_country || null,
        emailConfirmed: !!u.email_confirmed_at,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
      };
    });

    return NextResponse.json({ status: "SUCCESS", count: users.length, users, source: "supabase" });
  } catch {
    // Service role unconfigured: fall back to the in-memory registry.
    const users = globalAdminStore.getAllUsers();
    return NextResponse.json({ status: "SUCCESS", count: users.length, users, source: "memory" });
  }
}

/**
 * PATCH /api/v1/admin/users
 * Updates a user's role and/or account status. Role and status are written
 * to Supabase app_metadata (server-managed claims) and mirrored to the
 * in-memory compliance registry. (Super Admin only)
 *
 * Body: { userId, role?, status? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
    }

    const { userId, role, status } = await req.json();
    if (!userId || (!role && !status)) {
      return NextResponse.json(
        { error: "Missing required fields: userId and at least one of role/status" },
        { status: 400 }
      );
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Expected one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    if (status && !["ACTIVE", "FROZEN"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Expected ACTIVE or FROZEN." }, { status: 400 });
    }

    // Write server-managed claims first (fail closed when DB is unreachable).
    const admin = createAdminSupabaseClient();
    const { data: existing, error: readError } = await admin.auth.admin.getUserById(userId);
    if (readError || !existing?.user) {
      return NextResponse.json({ error: `User '${userId}' not found in Supabase Auth.` }, { status: 404 });
    }

    const nextMetadata = {
      ...existing.user.app_metadata,
      ...(role ? { role } : {}),
      ...(status ? { account_status: status } : {}),
    };

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: nextMetadata,
    });
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user claims", details: updateError.message },
        { status: 500 }
      );
    }

    // Mirror compliance status to the in-memory registry when the record exists.
    if (status) {
      globalAdminStore.updateUserStatus(userId, status);
    }

    return NextResponse.json({
      status: "USER_UPDATED",
      user: {
        id: userId,
        role: nextMetadata.role || "citizen",
        accountStatus: nextMetadata.account_status || "ACTIVE",
      },
      message: "Claims updated. The change applies on the user's next token refresh.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update user", details: err.message }, { status: 500 });
  }
}
