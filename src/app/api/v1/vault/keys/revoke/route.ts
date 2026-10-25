import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { revokeKeyId } from "@/core/crypto/scoped_key";
import { authenticateUser } from "@/lib/auth/auth_guard";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json({ error: "keyId is required." }, { status: 400 });
    }

    const keyOwner = globalUserStore.getKeyOwner(keyId);
    const ownerUserId = auth.user.role === "super_admin" ? (keyOwner || auth.user.userId) : auth.user.userId;
    const success = await globalUserStore.revokeKeyAsync(keyId, ownerUserId);
    if (!success) {
      return NextResponse.json({ error: "Key not found." }, { status: 404 });
    }

    // Register with cryptographic revocation registry
    revokeKeyId(keyId);

    return NextResponse.json({
      success: true,
      message: `Scoped Key ${keyId} revoked successfully.`,
      keyId,
      status: "REVOKED",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
