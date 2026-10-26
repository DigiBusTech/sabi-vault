import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles } from "@/lib/auth/auth_guard";
import { globalEmailService } from "@/core/notifications/email_service";

export async function POST(req: NextRequest) {
  const auth = await authorizeRoles(req, ["super_admin"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  try {
    const body = await req.json();
    const { templateId, recipientEmail, variables } = body;

    if (!templateId || !recipientEmail) {
      return NextResponse.json(
        { error: "templateId and recipientEmail are required." },
        { status: 400 }
      );
    }

    const result = await globalEmailService.sendEmail({
      templateId,
      recipientEmail,
      variables: variables || {
        recipient_name: "Test Administrator",
        organization_name: "Apex Global Capital",
        target_role: "Principal Systems Architect",
        accessed_scopes: "academics, experience, finance",
        on_chain_tx: "0x89f7a21345dc67e89ab0123456789abcdef0123456789abcdef0123456789abcd",
        audit_url: "https://sabiprofile.com/dashboard/audit",
        interview_type: "Sabi AI Consular Assessment",
        interview_link: "https://sabiprofile.com/interview/live_demo",
        scheduled_time: "October 30, 2026 at 14:00 UTC",
        destination_country: "United Kingdom",
        target_route: "Global Talent Tech Visa",
        current_holding_days: "14",
        shortfall_amount: "£1,270 GBP",
        advisor_url: "https://sabiprofile.com/dashboard/advisor",
        institution_name: "University of Cambridge",
        program_name: "Postgraduate STEM Fellowship",
        document_name: "Undergraduate Degree Transcript",
        upload_url: "https://sabiprofile.com/dashboard/documents",
        category_name: "academics",
        blockchain_hash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        computed_hash: "0x60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f508c36cb05",
      },
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      interpolatedSubject: result.interpolatedSubject,
      interpolatedHtml: result.interpolatedHtml,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to test send email." },
      { status: 500 }
    );
  }
}

