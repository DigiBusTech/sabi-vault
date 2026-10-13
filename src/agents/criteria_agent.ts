import { MultiLLMGateway } from "./gateway/llm_gateway";

export interface EvaluationCriteriaRubric {
  vertical: "immigration" | "education" | "labour" | "enterprise";
  title: string;
  minimumAcademicDegree?: string;
  minimumGpa?: number;
  requiredCertifications: string[];
  minimumYearsExperience?: number;
  requiredSkills: string[];
  minimumLiquidFunds?: {
    currency: string;
    amount: number;
  };
  mandatoryNotarizationRequired: boolean;
  scoringWeights: {
    academics: number;
    experience: number;
    certifications: number;
    finance: number;
  };
}

/**
 * Sabi Vault Criteria Ingestion Agent
 *
 * Ingests unstructured requirement documents (job descriptions, visa eligibility policies,
 * or university admissions guidelines) and translates them into an objective, deterministic
 * evaluation rubric for the screening pipeline.
 */
export class CriteriaAgent {
  private gateway: MultiLLMGateway;

  constructor(gateway: MultiLLMGateway) {
    this.gateway = gateway;
  }

  async parseRequirements(
    rawText: string,
    vertical: "immigration" | "education" | "labour" | "enterprise"
  ): Promise<EvaluationCriteriaRubric> {
    const prompt = `
You are the Sabi Vault Criteria Ingestion Agent.
Analyze the following unstructured requirements text for the vertical '${vertical}' and extract a strictly structured evaluation rubric JSON.

Rules:
1. Return strictly valid JSON conforming to the schema.
2. Be conservative and objective. Do not invent criteria not mentioned.
3. If funds or degrees are not mentioned, omit or set to null.

Schema:
{
  "vertical": "${vertical}",
  "title": "string",
  "minimumAcademicDegree": "string or null",
  "minimumGpa": number or null,
  "requiredCertifications": ["string"],
  "minimumYearsExperience": number or null,
  "requiredSkills": ["string"],
  "minimumLiquidFunds": { "currency": "string", "amount": number } or null,
  "mandatoryNotarizationRequired": boolean,
  "scoringWeights": {
    "academics": number,
    "experience": number,
    "certifications": number,
    "finance": number
  }
}

Requirements Text:
"""
${rawText}
"""
`;

    const response = await this.gateway.complete({
      messages: [
        { role: "system", content: "You extract structured criteria rubrics for Sabi Vault screening." },
        { role: "user", content: prompt },
      ],
      jsonSchema: true,
      temperature: 0.0,
    });

    try {
      const parsed = JSON.parse(response.content);
      return {
        vertical,
        title: parsed.title || "Standard Evaluation Criteria",
        minimumAcademicDegree: parsed.minimumAcademicDegree ?? undefined,
        minimumGpa: parsed.minimumGpa ?? undefined,
        requiredCertifications: Array.isArray(parsed.requiredCertifications) ? parsed.requiredCertifications : [],
        minimumYearsExperience: parsed.minimumYearsExperience ?? undefined,
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        minimumLiquidFunds: parsed.minimumLiquidFunds ?? undefined,
        mandatoryNotarizationRequired: Boolean(parsed.mandatoryNotarizationRequired),
        scoringWeights: parsed.scoringWeights || {
          academics: 25,
          experience: 35,
          certifications: 20,
          finance: 20,
        },
      };
    } catch {
      // Deterministic fallback rubric
      return {
        vertical,
        title: "Default Baseline Evaluation Rubric",
        requiredCertifications: [],
        requiredSkills: ["Problem Solving", "Communication"],
        mandatoryNotarizationRequired: vertical === "immigration",
        scoringWeights: {
          academics: 25,
          experience: 35,
          certifications: 20,
          finance: 20,
        },
      };
    }
  }
}
