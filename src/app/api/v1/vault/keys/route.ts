import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { VaultCategory } from "@/types/vault";
import { authenticateUser } from "@/lib/auth/auth_guard";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
  }

  const keys = globalUserStore.listKeys(auth.user.userId);
  return NextResponse.json({
    success: true,
    totalKeys: keys.length,
    keys,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const body = await req.json();
    const { allowedScopes, ttlDays = 30, maxQueries = 10, label } = body;

    if (!allowedScopes || !Array.isArray(allowedScopes) || allowedScopes.length === 0) {
      return NextResponse.json(
        { error: "allowedScopes array is required." },
        { status: 400 }
      );
    }

    const mintedKey = globalUserStore.mintKey({
      allowedScopes: allowedScopes as VaultCategory[],
      ttlDays: Number(ttlDays),
      maxQueries: Number(maxQueries),
      label,
      userId: auth.user.userId,
    });

    return NextResponse.json({
      success: true,
      key: mintedKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



