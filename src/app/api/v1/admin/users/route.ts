import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";

/**
 * GET /api/v1/admin/users
 * Returns list of managed citizen vaults.
 */
export async function GET() {
  const users = globalAdminStore.getAllUsers();
  return NextResponse.json({ status: "SUCCESS", count: users.length, users });
}

/**
 * PATCH /api/v1/admin/users
 * Updates a user's status (ACTIVE vs FROZEN).
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId, status } = await req.json();
    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields: userId, status" }, { status: 400 });
    }

    const updated = globalAdminStore.updateUserStatus(userId, status);
    if (!updated) {
      return NextResponse.json({ error: `User '${userId}' not found` }, { status: 404 });
    }

    return NextResponse.json({ status: "USER_STATUS_UPDATED", user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update user", details: err.message }, { status: 500 });
  }
}
