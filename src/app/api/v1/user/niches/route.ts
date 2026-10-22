import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { UserProfileNicheInputSchema } from "@/types/profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/niches
 * Lists all persona niches for the authenticated user.
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

    const niches = await profileAndAdvisorStore.listNiches(auth.user.userId);
    return NextResponse.json({ niches });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to list persona niches" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/user/niches
 * Creates or updates a persona niche.
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
    const parsed = UserProfileNicheInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid niche payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const niche = await profileAndAdvisorStore.createOrUpdateNiche(auth.user.userId, parsed.data);

    return NextResponse.json({
      success: true,
      niche,
      message: "Persona niche saved successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save persona niche" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/user/niches?id=niche_...
 * Deletes a persona niche.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const nicheId = searchParams.get("id");
    if (!nicheId) {
      return NextResponse.json({ error: "Missing niche ID" }, { status: 400 });
    }

    const success = await profileAndAdvisorStore.deleteNiche(auth.user.userId, nicheId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete persona niche" },
      { status: 500 }
    );
  }
}

