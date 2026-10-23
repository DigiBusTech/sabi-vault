import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { VisionExtractor } from "@/core/parser/vision_extractor";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/user/profile/extract-cv
 *
 * Ephemeral Multimodal Ingestion of CV, Resume, or LinkedIn Profile PDF Export.
 * Architectural Invariant: ZERO RAW DOCUMENT CENTRALIZATION.
 * - The raw uploaded buffer is never written to disk or centralized database.
 * - In-memory bytes are strictly wiped with buffer.fill(0) in a finally block.
 * - Returns structured candidate profile data ready for 1-click hydration into Human Profile.
 */
export async function POST(req: NextRequest) {
  let rawBuffer: Buffer | null = null;

  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No CV or LinkedIn PDF file provided in form data" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    rawBuffer = Buffer.from(arrayBuffer);

    if (rawBuffer.length === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    // Convert to base64 for ephemeral vision LLM processing
    const base64Data = rawBuffer.toString("base64");
    const mimeType = file.type || "application/pdf";
    const fileName = file.name || "resume.pdf";

    const extractor = new VisionExtractor();
    const extractedData = await extractor.extractResumeOrCv(base64Data, mimeType, fileName);

    return NextResponse.json({
      success: true,
      data: extractedData,
      fileName,
      message: "CV/LinkedIn profile successfully analyzed and structured.",
    });
  } catch (err: any) {
    console.error("[extract-cv] Extraction failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse CV / LinkedIn PDF document." },
      { status: 500 }
    );
  } finally {
    // Zero-out the in-memory buffer immediately
    if (rawBuffer) {
      try {
        rawBuffer.fill(0);
      } catch {
        // Buffer already freed or garbage collected
      }
    }
  }
}
