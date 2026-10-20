import { NextRequest, NextResponse } from "next/server";
import { getDeviceChallenge } from "@/lib/security/device_challenge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });
    }

    const challenge = await getDeviceChallenge(challengeId);
    if (!challenge) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      status: challenge.status,
      expiresAt: challenge.expiresAt,
    });
  } catch (err) {
    console.error("[Device Verify API] Status check error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
