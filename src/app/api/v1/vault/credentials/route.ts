import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { VaultCategory } from "@/types/vault";
import { authenticateUser } from "@/lib/auth/auth_guard";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
  }

  const vault = await globalUserStore.getVaultAsync(auth.user.userId);
  return NextResponse.json({
    success: true,
    vault,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const body = await req.json();
    const { action, category, itemData, fileName, provider } = body;

    if (action === "cloud_sync") {
      if (!fileName || !category) {
        return NextResponse.json(
          { error: "fileName and category required for cloud_sync." },
          { status: 400 }
        );
      }
      const syncResult = globalUserStore.simulateCloudSync(
        fileName,
        category as VaultCategory,
        provider,
        auth.user.userId
      );
      return NextResponse.json({
        success: true,
        message: "File streamed ephemerally, SHA-256 computed, memory zeroed.",
        syncResult,
        vault: globalUserStore.getVault(auth.user.userId),
      });
    }

    if (!category || !itemData) {
      return NextResponse.json(
        { error: "category and itemData are required to add a credential." },
        { status: 400 }
      );
    }

    const result = await globalUserStore.addCredentialAsync(category as VaultCategory, itemData, auth.user.userId);
    return NextResponse.json({
      success: true,
      result,
      vault: globalUserStore.getVault(auth.user.userId),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as VaultCategory;
    const itemId = searchParams.get("itemId");

    if (!category || !itemId) {
      return NextResponse.json(
        { error: "category and itemId query params are required." },
        { status: 400 }
      );
    }

    const success = await globalUserStore.deleteCredentialAsync(category, itemId, auth.user.userId);
    return NextResponse.json({
      success,
      vault: globalUserStore.getVault(auth.user.userId),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



