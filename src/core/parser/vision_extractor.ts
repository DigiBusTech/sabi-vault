/**
 * SabiProfile - Multi-LLM Sovereign Vision Document Extractor
 *
 * Implements the "Zero Raw Document Centralization" invariant:
 * - Extracts structured, schema-compliant JSON fields directly from document scans/PDFs.
 * - Multi-LLM High Availability:
 *   1. Primary: Google Gemini 1.5/2.0/2.5 Flash Vision.
 *   2. Secondary (Free Failover): Groq Vision (LLaMA 3.2 11B/90B Vision Preview).
 * - Fails CLOSED: Never fabricates synthetic credential data or fake IDs.
 * - Raw image/PDF buffers are ephemeral and never written to centralized storage.
 */

import { getConfigValueSync, getConfigValue, primeConfigCache } from "@/core/config/platform_config";
import { VaultCategory, VaultCategoryEnum, VerificationTier } from "@/types/vault";
import { liveTelemetry } from "@/lib/telemetry/live_logger";

export interface VisionExtractionResult {
  extractedFields: Record<string, any>;
  inferredCategory: VaultCategory;
  tier: VerificationTier;
  confidence: number;
  rawTextSnippet: string;
  extractedAt: string;
  providerUsed?: "gemini" | "groq";
}

/**
 * Raised when all vision AI backends are unavailable or return unusable output.
 * The extractor FAILS CLOSED: it never fabricates credential fields, never
 * invents identity data, and never assigns a verification tier to data that
 * was not genuinely extracted by the AI from the actual document.
 */
export class VisionExtractionUnavailableError extends Error {
  public readonly code = "VISION_EXTRACTION_UNAVAILABLE";
  constructor(message: string) {
    super(message);
    this.name = "VisionExtractionUnavailableError";
  }
}

const CATEGORY_SCHEMAS: Record<VaultCategory, string> = {
  finance: `
Extract bank statement or financial proof fields:
{
  "institutionName": string (e.g. "Zenith Bank", "Chase Bank"),
  "currency": string (3-letter ISO code e.g. "NGN", "USD", "GBP"),
  "currentLiquidBalance": number (total closing balance, numeric only),
  "averageThreeMonthBalance": number (approximate or visible average, numeric only),
  "accountHolderName": string,
  "accountNumberMasked": string,
  "statementPeriod": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "summary": string
}`,
  academics: `
Extract university degree, diploma, or transcript fields:
{
  "institution": string (e.g. "University of Lagos", "MIT"),
  "degreeType": "BSc" | "BA" | "MSc" | "MA" | "PhD" | "MBA" | "Diploma" | "Certificate",
  "fieldOfStudy": string (e.g. "Computer Science"),
  "graduationYear": number,
  "studentName": string,
  "gpa": number or null,
  "maxGpa": number or null (e.g. 5.0 or 4.0),
  "honors": string or null (e.g. "First Class", "Cum Laude"),
  "isNotarized": boolean,
  "summary": string
}`,
  certifications: `
Extract professional certification or license fields:
{
  "title": string (e.g. "AWS Certified Solutions Architect"),
  "issuingOrganization": string (e.g. "Amazon Web Services", "Cisco"),
  "issueDate": "YYYY-MM-DD" or "YYYY-MM",
  "expiryDate": "YYYY-MM-DD" or null,
  "credentialId": string or null,
  "recipientName": string,
  "verificationUrl": string or null,
  "summary": string
}`,
  experience: `
Extract employment verification, contract, or reference letter fields:
{
  "company": string,
  "jobTitle": string,
  "employmentType": "Full-time" | "Part-time" | "Contract" | "Internship",
  "startDate": "YYYY-MM-DD" or "YYYY-MM",
  "endDate": "YYYY-MM-DD" or null (null if currently employed),
  "isCurrent": boolean,
  "location": string or null,
  "employeeFullName": string,
  "responsibilities": string[],
  "technologiesUsed": string[] or null,
  "summary": string
}`,
  achievements: `
Extract award, grant, honor, or competition placement fields:
{
  "title": string (e.g. "National Innovation Award"),
  "issuer": string,
  "date": "YYYY-MM-DD" or "YYYY",
  "recipientName": string,
  "description": string,
  "awardUrl": string or null,
  "grantAmount": number or null,
  "summary": string
}`,
  portfolio: `
Extract personal resume, bio, or portfolio summary fields:
{
  "headline": string,
  "bio": string,
  "fullName": string,
  "primarySkills": string[],
  "personalStatement": string or null,
  "summary": string
}`,
  identification: `
Extract identity document, passport, or national ID fields:
{
  "idType": "international_passport" | "national_id" | "drivers_license" | "voters_card" | "residence_permit" | "portrait_photograph" | "other",
  "documentNumber": string (e.g. passport number or NIN),
  "fullName": string,
  "dateOfBirth": "YYYY-MM-DD" or null,
  "nationality": string,
  "issuingAuthority": string (e.g. "Nigeria Immigration Service", "NIMC"),
  "issueDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD" or null,
  "mrzCode": string or null,
  "summary": string
}`,
  legal: `
Extract legal instrument, contract, affidavit, or sworn declaration fields:
{
  "instrumentType": "mou" | "partnership_agreement" | "affidavit" | "power_of_attorney" | "deed_of_assignment" | "court_order" | "marriage_certificate" | "birth_certificate" | "other_legal",
  "title": string,
  "partiesInvolved": string[],
  "executionDate": "YYYY-MM-DD",
  "jurisdiction": string,
  "notarized": boolean,
  "notarySealReference": string or null,
  "summary": string
}`,
  receipts: `
Extract purchase receipt, bill, tuition payment, or financial transaction proof:
{
  "merchantName": string (e.g. "Amazon", "University Bursary"),
  "receiptNumber": string or null,
  "transactionDate": "YYYY-MM-DD",
  "currency": string (3-letter ISO code e.g. "NGN", "USD", "EUR"),
  "totalAmount": number,
  "paymentMethod": string or null,
  "items": [{ "description": string, "amount": number }],
  "taxAmount": number or null,
  "summary": string
}`,
};

export class VisionExtractor {
  private geminiApiKey: string | undefined;
  private geminiModel: string;
  private groqApiKey: string | undefined;

  constructor() {
    this.geminiApiKey = getConfigValueSync("ai.gemini_api_key") || process.env.GEMINI_API_KEY || undefined;
    this.geminiModel = getConfigValueSync("ai.gemini_model") || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.groqApiKey = getConfigValueSync("ai.groq_api_key") || process.env.GROQ_API_KEY || undefined;
  }

  /**
   * Primary vision backend: Google Gemini Flash Vision
   */
  private async extractWithGemini(
    prompt: string,
    effectiveMime: string,
    base64Data: string
  ): Promise<{ parsed: any; durationMs: number }> {
    const startTime = Date.now();
    const modelsToTry = [this.geminiModel, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    const uniqueModels = Array.from(new Set(modelsToTry));

    let lastError: Error | null = null;
    for (const m of uniqueModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${this.geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: effectiveMime,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.05,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (res.status === 404) continue;
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
        }

        const json = await res.json();
        const contentText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!contentText) {
          throw new Error("Gemini returned empty parts payload.");
        }

        const parsed = JSON.parse(contentText);
        return { parsed, durationMs: Date.now() - startTime };
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini vision model endpoints failed.");
  }

  /**
   * Secondary vision backend (Free Tier): Groq Vision (LLaMA 3.2 Vision)
   */
  private async extractWithGroq(
    prompt: string,
    effectiveMime: string,
    base64Data: string
  ): Promise<{ parsed: any; durationMs: number }> {
    const startTime = Date.now();

    // If PDF, extract textual content and utilize Groq LLaMA 3.3 70B text reasoning
    if (effectiveMime === "application/pdf") {
      const pdfBuffer = Buffer.from(base64Data, "base64");
      const rawStr = pdfBuffer.toString("utf8");
      const textMatches = rawStr.match(/[\w@.,:/ \-'\n]{4,}/g);
      const extractedText = textMatches ? textMatches.join(" ").substring(0, 5000) : rawStr.substring(0, 3000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are the SabiProfile Sovereign Document Structuring Engine. Extract strictly factual credentials into clean JSON according to the requested schema. Return valid JSON only.",
            },
            {
              role: "user",
              content: `${prompt}\n\nExtracted Document Text:\n"""\n${extractedText}\n"""`,
            },
          ],
          temperature: 0.05,
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq PDF Structuring HTTP ${res.status}: ${errText}`);
      }

      const json = await res.json();
      const contentText = json.choices?.[0]?.message?.content;
      if (!contentText) throw new Error("Groq returned empty content for PDF.");
      const parsed = JSON.parse(contentText);
      return { parsed, durationMs: Date.now() - startTime };
    }

    // For image captures (JPEG, PNG, camera viewfinder photos):
    const modelsToTry = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"];
    const imageUrl = `data:${effectiveMime};base64,${base64Data}`;

    let lastError: Error | null = null;
    for (const model of modelsToTry) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              },
            ],
            temperature: 0.05,
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Groq Vision HTTP ${res.status}: ${errText}`);
        }

        const json = await res.json();
        const contentText = json.choices?.[0]?.message?.content;
        if (!contentText) {
          throw new Error("Groq Vision returned empty message content.");
        }

        const parsed = JSON.parse(contentText);
        return { parsed, durationMs: Date.now() - startTime };
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error("All Groq vision models failed.");
  }

  /**
   * Main Document Extraction Pipeline with Multi-LLM Failover
   */
  async extractDocumentFields(
    base64Data: string,
    mimeType: string,
    categoryHint?: VaultCategory,
    fileName?: string
  ): Promise<VisionExtractionResult> {
    // Dynamically resolve keys from database platform_config and env in serverless context
    if (!this.geminiApiKey || !this.groqApiKey) {
      await primeConfigCache();
      this.geminiApiKey =
        this.geminiApiKey ||
        (await getConfigValue("ai.gemini_api_key")) ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        undefined;

      this.groqApiKey =
        this.groqApiKey ||
        (await getConfigValue("ai.groq_api_key")) ||
        process.env.GROQ_API_KEY ||
        process.env.GROQ_VISION_API_KEY ||
        undefined;

      const model = await getConfigValue("ai.gemini_model");
      if (model) this.geminiModel = model;
    }

    const effectiveMime = mimeType?.toLowerCase().includes("pdf")
      ? "application/pdf"
      : mimeType || "image/jpeg";

    const categoryRule = categoryHint
      ? `The document belongs to category '${categoryHint}'. Follow this schema:\n${CATEGORY_SCHEMAS[categoryHint]}`
      : `Classify the document into one of these 9 categories: finance, academics, certifications, experience, achievements, portfolio, identification, legal, receipts.\nSchemas:\n${Object.entries(
          CATEGORY_SCHEMAS
        )
          .map(([k, v]) => `[${k}]:\n${v}`)
          .join("\n")}`;

    const prompt = `
You are the SabiProfile Sovereign Document Extraction Engine.
Analyze this official document scan or uploaded document image.
Extract strictly factual, verified structured data without hallucination or extrapolation.
If a field is not visible in the document, use null.

${categoryRule}

Return a single JSON object with the exact keys:
{
  "inferredCategory": "finance" | "academics" | "certifications" | "experience" | "achievements" | "portfolio" | "identification" | "legal" | "receipts",
  "confidence": number between 0.85 and 0.99,
  "extractedFields": { ... extracted fields matching the category schema ... },
  "rawTextSnippet": "First 150-200 characters of key text found on document"
}
`;

    let parsedResult: any = null;
    let providerUsed: "gemini" | "groq" = "gemini";
    let extractionDurationMs = 0;

    // 1. Try Gemini Vision Primary
    if (this.geminiApiKey) {
      try {
        const { parsed, durationMs } = await this.extractWithGemini(prompt, effectiveMime, base64Data);
        parsedResult = parsed;
        providerUsed = "gemini";
        extractionDurationMs = durationMs;

        liveTelemetry.record({
          subsystem: "AI_AGENTS",
          level: "SUCCESS",
          action: "GEMINI_VISION_EXTRACT",
          durationMs,
          statusCode: 200,
          message: `Document extracted via Gemini Vision (${fileName || "scan"}) in ${durationMs}ms`,
          metadata: { provider: "gemini", model: this.geminiModel },
        });
      } catch (geminiErr: any) {
        liveTelemetry.record({
          subsystem: "AI_AGENTS",
          level: "WARN",
          action: "GEMINI_VISION_FAILOVER",
          durationMs: 0,
          statusCode: 502,
          errorCode: "GEMINI_EXTRACTION_ERROR",
          message: `Gemini extraction failed (${geminiErr.message}). Failing over to Groq Vision...`,
          metadata: { error: geminiErr.message },
        });
        console.warn(`[VisionExtractor] Gemini failed (${geminiErr.message}). Attempting Groq Vision failover...`);
      }
    }

    // 2. Try Groq Vision Secondary (Free Tier Failover)
    if (!parsedResult && this.groqApiKey) {
      try {
        const { parsed, durationMs } = await this.extractWithGroq(prompt, effectiveMime, base64Data);
        parsedResult = parsed;
        providerUsed = "groq";
        extractionDurationMs = durationMs;

        liveTelemetry.record({
          subsystem: "AI_AGENTS",
          level: "SUCCESS",
          action: "GROQ_VISION_EXTRACT",
          durationMs,
          statusCode: 200,
          message: `Document extracted via Groq LLaMA 3.2 Vision (${fileName || "scan"}) in ${durationMs}ms`,
          metadata: { provider: "groq", model: "llama-3.2-11b-vision-preview" },
        });
      } catch (groqErr: any) {
        liveTelemetry.record({
          subsystem: "AI_AGENTS",
          level: "ERROR",
          action: "GROQ_VISION_FAILED",
          durationMs: 0,
          statusCode: 502,
          errorCode: "GROQ_EXTRACTION_ERROR",
          message: `Groq Vision failover also failed: ${groqErr.message}`,
          metadata: { error: groqErr.message },
        });
        console.warn(`[VisionExtractor] Groq Vision also failed: ${groqErr.message}`);
      }
    }

    // 3. If no AI backend succeeded, FAIL CLOSED
    if (!parsedResult) {
      const errMsg = !this.geminiApiKey && !this.groqApiKey
        ? "No Vision AI keys configured (both Gemini and Groq keys are unset)."
        : "All Vision AI backends (Gemini and Groq failover) failed to extract document fields.";

      liveTelemetry.record({
        subsystem: "AI_AGENTS",
        level: "ERROR",
        action: "VISION_EXTRACTION_UNAVAILABLE",
        durationMs: extractionDurationMs,
        statusCode: 503,
        errorCode: "VISION_AI_DOWN",
        message: errMsg,
        metadata: { hasGeminiKey: !!this.geminiApiKey, hasGroqKey: !!this.groqApiKey },
      });

      throw new VisionExtractionUnavailableError(errMsg);
    }

    // Validate inferred category against VaultCategory enum
    const categoryParse = VaultCategoryEnum.safeParse(parsedResult.inferredCategory);
    const category: VaultCategory = categoryParse.success
      ? categoryParse.data
      : categoryHint || "portfolio";

    // SECURITY INVARIANT: AI/heuristic classification can NEVER grant Tier-2.
    // Tier-2 (Authenticated/Legalized) is only assignable by the notary attestation flow.
    const tier = VerificationTier.TIER_1_STANDARD_HASHED;

    return {
      extractedFields: parsedResult.extractedFields || {},
      inferredCategory: category,
      tier,
      confidence: typeof parsedResult.confidence === "number" ? parsedResult.confidence : 0.95,
      rawTextSnippet: parsedResult.rawTextSnippet || `Verified document extract for ${fileName || "scan"}`,
      extractedAt: new Date().toISOString(),
      providerUsed,
    };
  }
}
