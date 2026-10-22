import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { UserHumanProfileSchema } from "@/types/profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/profile
 * Returns the human profile for the authenticated citizen.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const profile = profileAndAdvisorStore.getProfile(auth.user.userId);
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve human profile" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/user/profile
 * Updates the human profile attributes (socials, CEFR languages, skills, hobbies, targets).
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const updated = profileAndAdvisorStore.updateProfile(auth.user.userId, body);

    return NextResponse.json({
      success: true,
      profile: updated,
      message: "Human profile updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update human profile" },
      { status: 500 }
    );
  }
}

