import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { VaultCategory } from "@/types/vault";

export async function GET() {
  const vault = globalUserStore.getVault();
  return NextResponse.json({
    success: true,
    vault,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, itemData, fileName, provider } = body;

    if (action === "cloud_sync") {
      if (!fileName || !category) {
        return NextResponse.json(
          { error: "fileName and category required for cloud_sync." },
          { status: 400 }
        );
      }
      const syncResult = globalUserStore.simulateCloudSync(fileName, category as VaultCategory, provider);
      return NextResponse.json({
        success: true,
        message: "File streamed ephemerally, SHA-256 computed, memory zeroed.",
        syncResult,
        vault: globalUserStore.getVault(),
      });
    }

    if (!category || !itemData) {
      return NextResponse.json(
        { error: "category and itemData are required to add a credential." },
        { status: 400 }
      );
    }

    const result = globalUserStore.addCredential(category as VaultCategory, itemData);
    return NextResponse.json({
      success: true,
      result,
      vault: globalUserStore.getVault(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as VaultCategory;
    const itemId = searchParams.get("itemId");

    if (!category || !itemId) {
      return NextResponse.json(
        { error: "category and itemId query params are required." },
        { status: 400 }
      );
    }

    const success = globalUserStore.deleteCredential(category, itemId);
    return NextResponse.json({
      success,
      vault: globalUserStore.getVault(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
