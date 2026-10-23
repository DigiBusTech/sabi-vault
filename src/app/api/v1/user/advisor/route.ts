import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { profileAndAdvisorStore } from "@/core/vault/profile_store";
import { TargetGoalInputSchema } from "@/types/profile";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/user/advisor
 * Runs the dynamic AI Sovereign Target Advisor audit against the user's vault and active goals.
 * Pass ?liveAi=true to trigger deep multimodal LLM live audit analysis with dynamic suggestions.
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

    const liveAi = req.nextUrl.searchParams.get("liveAi") === "true";
    const audit = liveAi
      ? await profileAndAdvisorStore.runLiveAiAdvisorAudit(auth.user.userId)
      : await profileAndAdvisorStore.runAdvisorAudit(auth.user.userId);

    return NextResponse.json({ audit, isLiveAi: liveAi });
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

/**
 * PATCH /api/v1/user/advisor
 * Updates an existing target goal.
 */
export async function PATCH(req: NextRequest) {
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
      message: "Target goal updated and audit refreshed",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update target goal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/user/advisor
 * Deletes a target goal by goalId passed in search query (?id=xyz) or JSON body.
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

    let goalId = req.nextUrl.searchParams.get("id") || req.nextUrl.searchParams.get("goalId");

    if (!goalId) {
      try {
        const body = await req.json();
        goalId = body.id || body.goalId;
      } catch {
        // Body reading optional if passed in query string
      }
    }

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required to delete target goal" },
        { status: 400 }
      );
    }

    await profileAndAdvisorStore.deleteGoal(auth.user.userId, goalId);
    const refreshedAudit = await profileAndAdvisorStore.runAdvisorAudit(auth.user.userId);

    return NextResponse.json({
      success: true,
      deletedGoalId: goalId,
      audit: refreshedAudit,
      message: "Target goal deleted successfully and readiness score recalculated",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete target goal" },
      { status: 500 }
    );
  }
}

