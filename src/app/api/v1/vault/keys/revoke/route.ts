import { NextRequest, NextResponse } from "next/server";
import { globalUserStore } from "@/core/vault/user_store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json({ error: "keyId is required." }, { status: 400 });
    }

    const success = globalUserStore.revokeKey(keyId);
    if (!success) {
      return NextResponse.json({ error: "Key not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Scoped Key ${keyId} revoked successfully.`,
      keys: globalUserStore.listKeys(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
