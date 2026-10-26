import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { globalTalentPoolService, UniversalSector, UniversalPipelineStage } from "@/core/enterprise/talent_pool_service";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin", "citizen"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId") || auth.user.orgId || "org_covenant_gate";
  const search = searchParams.get("search") || undefined;
  const sector = (searchParams.get("sector") as UniversalSector) || undefined;
  const stage = (searchParams.get("stage") as UniversalPipelineStage) || undefined;
  const verdict = searchParams.get("verdict") || undefined;
  const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : undefined;

  const applicants = globalTalentPoolService.listApplicants(orgId, {
    search,
    sector,
    stage,
    verdict,
    minScore,
  });

  return NextResponse.json({
    success: true,
    totalApplicants: applicants.length,
    applicants,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
  if (!auth.authorized || !auth.user) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { applicantId, action, stage, note, tags } = body;

    if (!applicantId) {
      return NextResponse.json({ error: "applicantId is required." }, { status: 400 });
    }

    if (action === "update_stage" && stage) {
      const ok = await globalTalentPoolService.updateStage(applicantId, stage as UniversalPipelineStage);
      if (!ok) return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
      return NextResponse.json({ success: true, applicant: globalTalentPoolService.getApplicant(applicantId) });
    }

    if (action === "add_note" && note) {
      const createdNote = await globalTalentPoolService.addNote(applicantId, {
        authorId: auth.user.userId,
        authorName: (auth.user as any).fullName || "Enterprise Evaluator",
        authorRole: (auth.user as any).role || "ORG_ADMIN",
        text: note,
      });
      if (!createdNote) return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
      return NextResponse.json({ success: true, note: createdNote, applicant: globalTalentPoolService.getApplicant(applicantId) });
    }

    if (action === "update_tags" && Array.isArray(tags)) {
      const ok = await globalTalentPoolService.updateTags(applicantId, tags);
      if (!ok) return NextResponse.json({ error: "Applicant not found." }, { status: 404 });
      return NextResponse.json({ success: true, applicant: globalTalentPoolService.getApplicant(applicantId) });
    }

    return NextResponse.json({ error: "Valid action ('update_stage', 'add_note', 'update_tags') is required." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update applicant record." }, { status: 500 });
  }
}
