import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";
import { VaultCategory } from "@/types/vault";

export async function GET() {
  const keys = globalUserStore.listKeys();
  return NextResponse.json({
    success: true,
    totalKeys: keys.length,
    keys,
  });
}

export async function POST(req: NextRequest) {
  try {
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
    });

    return NextResponse.json({
      success: true,
      key: mintedKey,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
