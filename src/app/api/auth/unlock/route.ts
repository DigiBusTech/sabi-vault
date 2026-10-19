import { NextRequest, NextResponse } from "next/server";
import { unlockAccount } from "@/lib/security/lockout";
import { authenticateAdmin } from "@/lib/auth/auth_guard";

/**
 * Support / Admin endpoint to unlock Tier 4 permanently locked accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const adminCheck = await authenticateAdmin(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: "Administrative authorization required to unlock account." },
        { status: 403 }
      );
    }

    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json({ error: "Missing identifier (email/userId)." }, { status: 400 });
    }

    const result = await unlockAccount(identifier);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to unlock account." }, { status: 500 });
  }
}
