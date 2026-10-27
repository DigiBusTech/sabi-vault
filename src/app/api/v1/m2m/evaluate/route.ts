import { NextRequest, NextResponse } from "next/server";
import { authenticateM2M } from "@/lib/auth/auth_guard";
import { verifyScopedApiKeyAsync, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { StrictRAGEvaluationAgent } from "@/agents/evaluation_agent";
import { FraudDetectionAgent } from "@/agents/fraud_detection_agent";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { globalUserStore } from "@/core/vault/user_store";
import { globalAdminStore } from "@/core/admin/admin_store";
import { EvaluationCriteriaRubric } from "@/agents/criteria_agent";

/**
 * POST /api/v1/m2m/evaluate
 *
 * Grounding & Screening Engine for autonomous AI agents and enterprises.
 * Evaluates candidate data against a custom rubric with zero LLM hallucinations.
 */
export async function POST(req: NextRequest) {
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const candidateApiKey =
      body.candidateApiKey || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null);

    if (!candidateApiKey) {
      return NextResponse.json(
        { error: "Missing candidateApiKey in body or Authorization header" },
        { status: 400 }
      );
    }

    const { customRubric, vertical = "labour" } = body;
    if (!customRubric) {
      return NextResponse.json({ error: "customRubric specification is required" }, { status: 400 });
    }

    // 1. Verify candidate scoped key
    const keyVerification = await verifyScopedApiKeyAsync(candidateApiKey, undefined, orgAuth.org.id);
    if (!keyVerification.isValid || !keyVerification.payload) {
      return NextResponse.json(
        { error: "Candidate API Key invalid, revoked, or expired", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes } = keyVerification.payload;
    const candidateVault = (await globalUserStore.findVaultAsync(vaultId)) || globalUserStore.findVault(vaultId);
    if (!candidateVault) {
      return NextResponse.json({ error: "Candidate vault was not found." }, { status: 404 });
    }
    const scopedCandidateData = filterVaultByScope(candidateVault, allowedScopes);

    // 2. Mathematically verify candidate data against on-chain ledger
    const integrityAgent = new IntegrityAgent();
    const integrityResults: Record<string, any> = {};
    const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedCandidateData as any)[scope]));
    if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
      return NextResponse.json(
        { error: "Candidate vault is missing one or more consented categories; integrity cannot be verified." },
        { status: 409 }
      );
    }
    let allTamperFree = scopesToVerify.length > 0;

    for (const scope of allowedScopes) {
      if ((scopedCandidateData as any)[scope]) {
        const check = await integrityAgent.verifyCategoryIntegrity(
          vaultId,
          scope,
          (scopedCandidateData as any)[scope]
        );
        integrityResults[scope] = check;
        if (!check.isTamperFree) allTamperFree = false;
      }
    }

    if (!allTamperFree) {
      await globalUserStore.recordAuditEntryAsync({
        keyId: keyVerification.payload.keyId,
        requestingOrg: orgAuth.org.name,
        orgType: orgAuth.org.type,
        accessedScopes: allowedScopes,
        purpose: `M2M Custom Evaluation: ${customRubric.title || vertical} (TAMPER DETECTED)`,
        integrityVerified: false,
        onChainTx: "",
        status: "TAMPER_DETECTED",
        targetVaultId: vaultId,
        screeningVertical: (vertical || "labour").toLowerCase(),
      });

      return NextResponse.json(
        {
          status: "REJECTED_TAMPER_DETECTED",
          error: "Blockchain anchor mismatch: candidate data fails on-chain integrity check.",
          integrityResults,
        },
        { status: 409 }
      );
    }

    // 3. Record Key Usage (atomic quota decrement)
    recordKeyExecution(keyVerification.payload.keyId);
    await globalUserStore.recordKeyUsageAsync(keyVerification.payload.keyId);
    globalAdminStore.recordQueryExecuted(1.0);

    // 4. Strict RAG Evaluation
    const gateway = new MultiLLMGateway();
    const evalAgent = new StrictRAGEvaluationAgent(gateway);
    const standardRubric: EvaluationCriteriaRubric = {
      vertical: (vertical as any) || "labour",
      title: customRubric.title || "Custom Enterprise Rubric",
      minimumAcademicDegree: customRubric.minimumAcademicDegree,
      requiredCertifications: customRubric.requiredCertifications || [],
      requiredSkills: customRubric.requiredSkills || [],
      minimumLiquidFunds: customRubric.minimumLiquidFunds || { currency: "USD", amount: 10000 },
      mandatoryNotarizationRequired: Boolean(customRubric.mandatoryNotarizationRequired),
      scoringWeights: {
        academics: customRubric.scoringWeights?.academics ?? 25,
        experience: customRubric.scoringWeights?.experience ?? 25,
        certifications: customRubric.scoringWeights?.certifications ?? 25,
        finance: customRubric.scoringWeights?.finance ?? 25,
      },
    };

    const evaluationDossier = await evalAgent.evaluateCandidate(scopedCandidateData, standardRubric);

    // 5. Fraud Detection Agent
    const fraudAgent = new FraudDetectionAgent();
    const fraudAudit = fraudAgent.auditCandidateVault(scopedCandidateData, vertical === "immigration");

    // 6. Citizen Audit Log
    await globalUserStore.recordAuditEntryAsync({
      keyId: keyVerification.payload.keyId,
      requestingOrg: orgAuth.org.name,
      orgType: orgAuth.org.type,
      accessedScopes: allowedScopes,
      purpose: `M2M Custom Evaluation: ${customRubric.title || vertical}`,
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: vaultId,
      screeningVertical: (vertical || "labour").toLowerCase(),
      compositeScore: evaluationDossier.totalCompositeScore,
      verdict: evaluationDossier.verdict,
    });

    return NextResponse.json({
      status: "EVALUATION_COMPLETE",
      candidateId: vaultId,
      compositeScore: evaluationDossier.totalCompositeScore,
      verdict: evaluationDossier.verdict,
      rubricBreakdown: evaluationDossier.categoryBreakdown.map((cat) => ({
        category: cat.category,
        score: cat.score,
        status: cat.status,
        proof: cat.cites.join("; ") || "Verified on Base Sepolia L2",
      })),
      fraudAudit: {
        overallRisk: fraudAudit.overallRiskLevel,
        riskScore: fraudAudit.riskScore,
        passedChecks: fraudAudit.passedChecks,
        flags: fraudAudit.flags,
      },
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "M2M evaluation failed", details: err.message }, { status: 500 });
  }
}
