import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { TargetGoalInputSchema } from "@/types/profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/advisor
 * Runs the dynamic AI Sovereign Target Advisor audit against the user's vault and active goals.
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

    const audit = await profileAndAdvisorStore.runAdvisorAudit(auth.user.userId);
    return NextResponse.json({ audit });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute sovereign advisor audit" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/user/advisor
 * Adds, updates, or manages active target goals (Job, Relocation, Academic, Procurement).
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
    const parsed = TargetGoalInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid target goal payload", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedGoal = await profileAndAdvisorStore.addOrUpdateGoal(auth.user.userId, parsed.data);
    const refreshedAudit = await profileAndAdvisorStore.runAdvisorAudit(auth.user.userId);

    return NextResponse.json({
      success: true,
      goal: updatedGoal,
      audit: refreshedAudit,
      message: "Target goal saved and audit refreshed",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update target goal" },
      { status: 500 }
    );
  }
}

