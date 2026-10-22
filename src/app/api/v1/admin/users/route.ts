import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { globalUserStore } from "@/core/vault/user_store";
import { StorageTierEnum, StorageTier } from "@/types/vault";
import { authenticateAdmin, UserRole } from "@/lib/auth/auth_guard";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const VALID_ROLES: UserRole[] = ["citizen", "enterprise_admin", "notary", "govt_auditor", "super_admin"];

/**
 * GET /api/v1/admin/users
 * Lists real Supabase Auth accounts merged with their vault profile,
 * quota metrics, and compliance status. Falls back to the in-memory
 * registry when the service role is unconfigured. (Super Admin only)
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
      // Hydrate admin-assigned tier/allocation from Supabase app_metadata so
      // quota state survives restarts and is consistent across instances.
      globalUserStore.hydrateQuotaFromMetadata(u.id, u.app_metadata);
      const quota = globalUserStore.getUserQuota(u.id);
      return {
        id: u.id,
        email: u.email || "",
        role: (u.app_metadata?.role as UserRole) || "citizen",
        orgId: typeof u.app_metadata?.org_id === "string" ? u.app_metadata.org_id : null,
        accountStatus:
          (u.app_metadata?.account_status as string) || storeRecord?.status || "ACTIVE",
        sovereignNode: profile?.sovereign_node_id || u.app_metadata?.sovereignNode || quota.sovereignNode,
        residenceCountry: profile?.residence_country || null,
        emailConfirmed: !!u.email_confirmed_at,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        storageTier: quota.tier,
        allocatedMB: quota.allocatedMB,
        usedMB: quota.usedMB,
        usedBytes: quota.usedBytes,
        percentageUsed: quota.percentageUsed,
        totalDocuments: quota.totalDocumentsCount,
        cryptoHashGasSpentUSD: quota.cryptoHashGasSpentUSD,
        cryptoTransactionsCount: quota.cryptoTransactionsCount,
      };
    });

    return NextResponse.json({ status: "SUCCESS", count: users.length, users, source: "supabase" });
  } catch {
    // Service role unconfigured: fall back to the in-memory registry.
    const rawUsers = globalAdminStore.getAllUsers();
    const users = rawUsers.map((u) => {
      const quota = globalUserStore.getUserQuota(u.id);
      return {
        id: u.id,
        email: u.email,
        role: "citizen" as UserRole,
        orgId: null,
        accountStatus: u.status,
        sovereignNode: u.sovereignNode || quota.sovereignNode,
        residenceCountry: u.residenceCountry || "NG",
        emailConfirmed: true,
        createdAt: u.createdAt,
        lastSignInAt: null,
        storageTier: quota.tier,
        allocatedMB: quota.allocatedMB,
        usedMB: quota.usedMB,
        usedBytes: quota.usedBytes,
        percentageUsed: quota.percentageUsed,
        totalDocuments: quota.totalDocumentsCount,
        cryptoHashGasSpentUSD: quota.cryptoHashGasSpentUSD,
        cryptoTransactionsCount: quota.cryptoTransactionsCount,
      };
    });
    return NextResponse.json({ status: "SUCCESS", count: users.length, users, source: "memory" });
  }
}

/**
 * PATCH /api/v1/admin/users
 * Updates a user's role, account status, and/or tiered storage quota.
 * Writes to Supabase app_metadata when available, and mirrors to
 * globalUserStore and globalAdminStore. (Super Admin only)
 *
 * Body: { userId, role?, status?, storageTier?, allocatedMB?, resetCryptoGas? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error || "Admin credentials required" }, { status: 401 });
    }

    const { userId, role, status, storageTier, allocatedMB, resetCryptoGas } = await req.json();
    if (!userId || (!role && !status && !storageTier && allocatedMB === undefined && !resetCryptoGas)) {
      return NextResponse.json(
        { error: "Missing required fields: userId and at least one parameter to update" },
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
    if (storageTier && !StorageTierEnum.safeParse(storageTier).success) {
      return NextResponse.json(
        { error: `Invalid storageTier. Expected one of: FREE, PRO, ENTERPRISE, SOVEREIGN` },
        { status: 400 }
      );
    }
    // Strict numeric validation: reject NaN, non-finite, non-positive or absurd allocations
    if (allocatedMB !== undefined) {
      const parsedMB = Number(allocatedMB);
      if (!Number.isFinite(parsedMB) || parsedMB <= 0 || parsedMB > 1048576) {
        return NextResponse.json(
          { error: "Invalid allocatedMB. Expected a positive finite number of megabytes (max 1048576)." },
          { status: 400 }
        );
      }
    }

    // Update storage quota and crypto gas in globalUserStore
    let updatedQuota = null;
    if (storageTier || allocatedMB !== undefined || resetCryptoGas) {
      updatedQuota = globalUserStore.updateUserQuota(userId, {
        tier: storageTier as StorageTier,
        allocatedMB: allocatedMB !== undefined ? Number(allocatedMB) : undefined,
        resetGas: !!resetCryptoGas,
      });
    } else {
      updatedQuota = globalUserStore.getUserQuota(userId);
    }

    // Mirror compliance status to in-memory admin store
    if (status) {
      globalAdminStore.updateUserStatus(userId, status);
    }

    // Update Supabase app_metadata if configured
    try {
      const admin = createAdminSupabaseClient();
      const { data: existing, error: readError } = await admin.auth.admin.getUserById(userId);
      if (!readError && existing?.user) {
        const nextMetadata = {
          ...existing.user.app_metadata,
          ...(role ? { role } : {}),
          ...(status ? { account_status: status } : {}),
          ...(storageTier ? { storage_tier: storageTier } : {}),
          ...(allocatedMB !== undefined ? { allocated_mb: Number(allocatedMB) } : {}),
        };

        await admin.auth.admin.updateUserById(userId, {
          app_metadata: nextMetadata,
        });
      }
    } catch {
      // Supabase unconfigured or offline: in-memory state updated successfully
    }

    return NextResponse.json({
      status: "USER_UPDATED",
      user: {
        id: userId,
        role: role || "citizen",
        accountStatus: status || "ACTIVE",
        storageTier: updatedQuota.tier,
        allocatedMB: updatedQuota.allocatedMB,
        usedMB: updatedQuota.usedMB,
        usedBytes: updatedQuota.usedBytes,
        percentageUsed: updatedQuota.percentageUsed,
        totalDocuments: updatedQuota.totalDocumentsCount,
        cryptoHashGasSpentUSD: updatedQuota.cryptoHashGasSpentUSD,
        cryptoTransactionsCount: updatedQuota.cryptoTransactionsCount,
      },
      message: "User account and storage quota updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update user", details: err.message }, { status: 500 });
  }
}
