import { NextRequest, NextResponse } from "next/server";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { CriteriaAgent } from "@/agents/criteria_agent";
import { StrictRAGEvaluationAgent } from "@/agents/evaluation_agent";
import { FraudDetectionAgent } from "@/agents/fraud_detection_agent";
import { verifyScopedApiKey, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { globalUserStore } from "@/core/vault/user_store";
import { authenticateM2M } from "@/lib/auth/auth_guard";





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
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, criteriaText, vertical, requestingOrg } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing candidate 'apiKey'" }, { status: 400 });
    }

    // Step 1: Validate Scoped Key & Redact Non-Permitted Scopes
    const keyVerification = verifyScopedApiKey(apiKey, undefined, orgAuth.org.id);
    if (!keyVerification.isValid || !keyVerification.payload) {
      return NextResponse.json(
        { error: "Invalid or expired candidate API key", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes } = keyVerification.payload;
    const candidateVault = globalUserStore.findVault(vaultId);
    if (!candidateVault) {
      return NextResponse.json({ error: "Candidate vault was not found." }, { status: 404 });
    }
    const scopedCandidateData = filterVaultByScope(candidateVault, allowedScopes);
    const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedCandidateData as any)[scope]));
    if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
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
      globalUserStore.recordAuditEntry({
        requestingOrg: requestingOrg || "Enterprise Screener Portal",
        orgType: "ENTERPRISE",
        accessedScopes: allowedScopes,
        purpose: `${(vertical || "labour").toUpperCase()} Multi-Agent Screening (TAMPER DETECTED)`,
        integrityVerified: false,
        onChainTx: "",
        status: "TAMPER_DETECTED",
        targetVaultId: vaultId,
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
    globalUserStore.recordKeyUsage(keyVerification.payload.keyId);

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
    globalUserStore.recordAuditEntry({
      requestingOrg: requestingOrg || "Enterprise Screener Portal",
      orgType: "ENTERPRISE",
      accessedScopes: allowedScopes,
      purpose: `${selectedVertical.toUpperCase()} Multi-Agent Screening`,
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: vaultId,
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
    return NextResponse.json(
      { error: "Screening pipeline execution error", details: err.message },
      { status: 500 }
    );
  }
}
