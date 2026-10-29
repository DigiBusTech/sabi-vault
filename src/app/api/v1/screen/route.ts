import { NextRequest, NextResponse } from "next/server";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { CriteriaAgent } from "@/agents/criteria_agent";
import { StrictRAGEvaluationAgent } from "@/agents/evaluation_agent";
import { FraudDetectionAgent } from "@/agents/fraud_detection_agent";
import { verifyScopedApiKeyAsync, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { globalUserStore } from "@/core/vault/user_store";
import { authenticateM2M } from "@/lib/auth/auth_guard";
import { liveTelemetry } from "@/lib/telemetry/live_logger";

/**
 * POST /api/v1/screen
 *
 * Full Multi-Agent Enterprise Screening Pipeline
 * 1. Validates scoped API key
 * 2. Integrity Agent: Recomputes SHA-256 and checks on-chain ledger
 * 3. Criteria Ingestion Agent: Parses requirements text into structured rubric
 * 4. Strict RAG Evaluator: Zero hallucination scoring
 * 5. Fraud Detection Agent: Timeline and anomaly check
 * 6. GovTech 60/40 fee split receipt
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      liveTelemetry.record({
        subsystem: "SECURITY_AUTH",
        level: "WARN",
        action: "M2M_AUTH_REJECTED",
        durationMs: Date.now() - startTime,
        statusCode: 401,
        message: orgAuth.error || "Unauthorized organization",
      });
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, criteriaText, vertical, requestingOrg } = body;

    if (!apiKey) {
      liveTelemetry.record({
        subsystem: "API_ROUTER",
        level: "WARN",
        action: "SCREENING_MISSING_APIKEY",
        durationMs: Date.now() - startTime,
        statusCode: 400,
        message: "Missing candidate 'apiKey'",
      });
      return NextResponse.json({ error: "Missing candidate 'apiKey'" }, { status: 400 });
    }

    // Step 1: Validate Scoped Key & Redact Non-Permitted Scopes
    const keyVerification = await verifyScopedApiKeyAsync(apiKey, undefined, orgAuth.org.id);
    if (!keyVerification.isValid || !keyVerification.payload) {
      liveTelemetry.record({
        subsystem: "SECURITY_AUTH",
        level: "WARN",
        action: "INVALID_SCOPED_KEY",
        durationMs: Date.now() - startTime,
        statusCode: 401,
        errorCode: "INVALID_KEY_SIGNATURE",
        message: keyVerification.error || "Invalid or expired candidate API key",
      });
      return NextResponse.json(
        { error: "Invalid or expired candidate API key", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes } = keyVerification.payload;
    const candidateVault = (await globalUserStore.findVaultAsync(vaultId)) || globalUserStore.findVault(vaultId);
    if (!candidateVault) {
      liveTelemetry.record({
        subsystem: "API_ROUTER",
        level: "WARN",
        action: "CANDIDATE_VAULT_NOT_FOUND",
        durationMs: Date.now() - startTime,
        statusCode: 404,
        message: `Candidate vault ${vaultId} was not found.`,
      });
      return NextResponse.json({ error: "Candidate vault was not found." }, { status: 404 });
    }
    const scopedCandidateData = filterVaultByScope(candidateVault, allowedScopes);
    const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedCandidateData as any)[scope]));
    if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
      liveTelemetry.record({
        subsystem: "SECURITY_AUTH",
        level: "WARN",
        action: "CANDIDATE_MISSING_CONSENTED_SCOPES",
        durationMs: Date.now() - startTime,
        statusCode: 409,
        message: "Candidate vault is missing one or more consented categories; integrity cannot be verified.",
      });
      return NextResponse.json(
        { error: "Candidate vault is missing one or more consented categories; integrity cannot be verified." },
        { status: 409 }
      );
    }

    // Step 2: Agent 1 - Document Integrity & Blockchain Ledger Verification
    const integrityAgent = new IntegrityAgent();
    const integrityResults: Record<string, any> = {};
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
      liveTelemetry.record({
        subsystem: "BLOCKCHAIN_LEDGER",
        level: "ERROR",
        action: "TAMPER_DETECTED",
        durationMs: Date.now() - startTime,
        statusCode: 409,
        errorCode: "ON_CHAIN_HASH_MISMATCH",
        message: `Tamper detected on candidate ${vaultId}: database hash does not match Base Sepolia ledger.`,
        metadata: { vaultId, checkedCategories: Object.keys(integrityResults) },
      });

      await globalUserStore.recordAuditEntryAsync({
        keyId: keyVerification.payload.keyId,
        requestingOrg: requestingOrg || "Enterprise Screener Portal",
        orgType: "ENTERPRISE",
        accessedScopes: allowedScopes,
        purpose: `${(vertical || "labour").toUpperCase()} Multi-Agent Screening (TAMPER DETECTED)`,
        integrityVerified: false,
        onChainTx: "",
        status: "TAMPER_DETECTED",
        targetVaultId: vaultId,
        screeningVertical: (vertical || "labour").toLowerCase(),
      });

      return NextResponse.json(
        {
          status: "REJECTED_TAMPER_DETECTED",
          error: "Critical integrity failure: database record does not match on-chain ledger hash.",
          integrityResults,
        },
        { status: 409 }
      );
    }

    // Record Key Usage Quota
    recordKeyExecution(keyVerification.payload.keyId);
    await globalUserStore.recordKeyUsageAsync(keyVerification.payload.keyId);

    // Step 3: Agent 2 - Criteria Ingestion Agent
    const gateway = new MultiLLMGateway();
    const criteriaAgent = new CriteriaAgent(gateway);
    const selectedVertical = vertical || "labour";
    const rubric = await criteriaAgent.parseRequirements(
      criteriaText || "Standard requirements: Bachelor degree in engineering or relevant experience with solid financial standing.",
      selectedVertical
    );

    // Step 4: Agent 3 - Strict RAG Evaluator
    const evalAgent = new StrictRAGEvaluationAgent(gateway);
    const evaluationDossier = await evalAgent.evaluateCandidate(scopedCandidateData, rubric);

    // Step 5: Agent 4 - Fraud & Anomaly Detection Agent
    const fraudAgent = new FraudDetectionAgent();
    const fraudAudit = fraudAgent.auditCandidateVault(
      scopedCandidateData,
      selectedVertical === "immigration"
    );

    // Step 6: 60/40 Micro-Transaction Accounting
    const sovereignNode = SovereignNodeRouter.resolveSovereignNode(candidateVault.residenceCountry || "NG");

    // Step 7: Record Citizen Privacy Transparency Log
    await globalUserStore.recordAuditEntryAsync({
      keyId: keyVerification.payload.keyId,
      requestingOrg: requestingOrg || "Enterprise Screener Portal",
      orgType: "ENTERPRISE",
      accessedScopes: allowedScopes,
      purpose: `${selectedVertical.toUpperCase()} Multi-Agent Screening`,
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: vaultId,
      screeningVertical: selectedVertical.toLowerCase(),
      compositeScore: evaluationDossier.totalCompositeScore,
      verdict: evaluationDossier.verdict,
    });

    const durationMs = Date.now() - startTime;
    liveTelemetry.record({
      subsystem: "AI_AGENTS",
      level: "SUCCESS",
      action: "SCREENING_COMPLETE",
      durationMs,
      statusCode: 200,
      message: `Candidate ${vaultId} screened for ${selectedVertical}: score ${evaluationDossier.totalCompositeScore}/100 (${evaluationDossier.verdict}).`,
      metadata: {
        candidateId: vaultId,
        vertical: selectedVertical,
        compositeScore: evaluationDossier.totalCompositeScore,
        verdict: evaluationDossier.verdict,
      },
    });

    return NextResponse.json({
      status: "SCREENING_COMPLETE",
      candidateId: vaultId,
      sovereignNode: {
        id: sovereignNode.nodeId,
        jurisdiction: sovereignNode.jurisdiction,
        framework: sovereignNode.complianceFramework,
      },
      evaluationDossier,
      fraudAudit,
      integrityCheck: {
        allTamperFree: true,
        blockchainNetwork: "Base Sepolia L2",
        checkedCategories: Object.keys(integrityResults),
      },
      govTechMicroTransaction: {
        feeUsd: 1.0,
        platformShare: "$0.60 (60% to Sabi Platform Treasury)",
        sovereignHostShare: `$0.40 (40% to ${sovereignNode.regionName})`,
        payoutAddress: sovereignNode.payoutAddress,
        contract: "SabiRevenueSplitter.sol (Base Sepolia)",
      },
      screenedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    liveTelemetry.record({
      subsystem: "AI_AGENTS",
      level: "ERROR",
      action: "SCREENING_PIPELINE_ERROR",
      durationMs,
      statusCode: 500,
      errorCode: "PIPELINE_UNHANDLED_EXCEPTION",
      message: err.message || "Screening pipeline execution error",
      metadata: { errorStack: err.stack?.substring(0, 500) },
    });

    return NextResponse.json(
      { error: "Screening pipeline execution error", details: err.message },
      { status: 500 }
    );
  }
}
