import { NextRequest, NextResponse } from "next/server";
import { authenticateM2M } from "@/lib/auth/auth_guard";
import { verifyScopedApiKey, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { IntegrityAgent } from "@/agents/integrity_agent";
import { StrictRAGEvaluationAgent } from "@/agents/evaluation_agent";
import { CriteriaAgent } from "@/agents/criteria_agent";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { globalUserStore } from "@/core/vault/user_store";
import { globalAdminStore } from "@/core/admin/admin_store";

/**
 * POST /api/v1/m2m/batch-verify
 *
 * Parallel screening queue for batches of candidate keys against job criteria.
 */
export async function POST(req: NextRequest) {
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const { candidateKeys, jobCriteriaText, vertical = "labour" } = body;

    if (!candidateKeys || !Array.isArray(candidateKeys) || candidateKeys.length === 0) {
      return NextResponse.json(
        { error: "candidateKeys array is required and must contain at least 1 key." },
        { status: 400 }
      );
    }

    const gateway = new MultiLLMGateway();
    const criteriaAgent = new CriteriaAgent(gateway);
    const rubric = await criteriaAgent.parseRequirements(
      jobCriteriaText || "Standard requirements: Relevant engineering degree, solid experience, verified credentials.",
      vertical
    );

    const evalAgent = new StrictRAGEvaluationAgent(gateway);
    const integrityAgent = new IntegrityAgent();
    const batchResults = [];

    for (const key of candidateKeys) {
      const verification = verifyScopedApiKey(key, undefined, orgAuth.org.id);
      if (!verification.isValid || !verification.payload) {
        batchResults.push({
          candidateKey: key.substring(0, 16) + "...",
          status: "KEY_REJECTED",
          error: verification.error || "Key invalid or revoked",
        });
        continue;
      }

      const { vaultId, allowedScopes } = verification.payload;
      const candidateVault = globalUserStore.findVault(vaultId);
      if (!candidateVault) {
        batchResults.push({
          candidateId: vaultId,
          status: "VAULT_NOT_FOUND",
          verdict: "REJECTED",
          compositeScore: 0,
        });
        continue;
      }
      const scopedData = filterVaultByScope(candidateVault, allowedScopes);
      const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedData as any)[scope]));
      if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
        batchResults.push({
          candidateId: vaultId,
          status: "INTEGRITY_UNAVAILABLE",
          verdict: "REJECTED",
          compositeScore: 0,
        });
        continue;
      }

      // Check integrity
      let tamperFree = scopesToVerify.length > 0;
      for (const scope of allowedScopes) {
        if ((scopedData as any)[scope]) {
          const check = await integrityAgent.verifyCategoryIntegrity(vaultId, scope, (scopedData as any)[scope]);
          if (!check.isTamperFree) tamperFree = false;
        }
      }

      if (!tamperFree) {
        batchResults.push({
          candidateId: vaultId,
          status: "TAMPER_DETECTED",
          verdict: "REJECTED",
          compositeScore: 0,
        });
        continue;
      }

      // Record quota usage
      recordKeyExecution(verification.payload.keyId);
      globalUserStore.recordKeyUsage(verification.payload.keyId);
      globalAdminStore.recordQueryExecuted(1.0);

      // Evaluate
      const dossier = await evalAgent.evaluateCandidate(scopedData, rubric);
      batchResults.push({
        candidateId: vaultId,
        status: "VERIFIED_EVALUATED",
        compositeScore: dossier.totalCompositeScore,
        verdict: dossier.verdict,
        strengths: dossier.keyStrengths,
        summary: dossier.summary,
      });
    }

    return NextResponse.json({
      status: "BATCH_SCREENING_COMPLETE",
      totalCandidatesSubmitted: candidateKeys.length,
      successfulEvaluations: batchResults.filter((b) => b.status === "VERIFIED_EVALUATED").length,
      rubricUsed: rubric.title,
      results: batchResults,
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Batch screening failed", details: err.message }, { status: 500 });
  }
}
