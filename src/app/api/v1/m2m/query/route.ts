import { NextRequest, NextResponse } from "next/server";
import { globalAdminStore } from "@/core/admin/admin_store";
import { verifyScopedApiKeyAsync, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { computeSha256 } from "@/core/crypto/hasher";
import { globalUserStore } from "@/core/vault/user_store";
import { authenticateM2M } from "@/lib/auth/auth_guard";

/**
 * POST /api/v1/m2m/query
 *
 * M2M Autonomous Query Endpoint with Dual-Key Handshake:
 * Requires:
 * 1. `X-Sabi-Org-Key` header (Enterprise/Govt Organization License)
 * 2. `Authorization: Bearer <candidate_scoped_api_key>` header (Citizen Consent Anchor)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Dual-Key Check: Header 1 - Organization Key
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }
    const org = orgAuth.org;

    // 2. Dual-Key Check: Header 2 - Candidate Scoped API Key
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed 'Authorization: Bearer <candidate_key>' header." },
        { status: 401 }
      );
    }

    const candidateApiKey = authHeader.substring(7).trim();
    const keyVerification = await verifyScopedApiKeyAsync(candidateApiKey, undefined, org.id);
    if (!keyVerification.isValid || !keyVerification.payload) {
      return NextResponse.json(
        { error: "Candidate API Key invalid, revoked, or expired", details: keyVerification.error },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes } = keyVerification.payload;

    // 3. User Status Check
    const user = globalAdminStore.getUser(vaultId);
    if (user && user.status === "FROZEN") {
      return NextResponse.json(
        { error: "Account Frozen: This citizen vault has been temporarily restricted by sovereign compliance." },
        { status: 403 }
      );
    }

    // 4. Resolve candidate data and redact un-permitted categories
    const candidateData = (await globalUserStore.findVaultAsync(vaultId)) || globalUserStore.findVault(vaultId);
    if (!candidateData) {
      return NextResponse.json({ error: "Candidate vault was not found." }, { status: 404 });
    }
    const scopedData = filterVaultByScope(candidateData, allowedScopes);
    const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedData as any)[scope]));
    if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
      return NextResponse.json(
        { error: "Candidate vault is missing one or more consented categories; integrity cannot be verified." },
        { status: 409 }
      );
    }

    // 5. Blockchain Proof Verification against Base Sepolia Ledger
    const ledgerClient = new BlockchainLedgerClient();
    const verificationResults: Record<string, any> = {};
    let allTamperFree = scopesToVerify.length > 0;

    const allowSimulation = process.env.NODE_ENV !== "production";
    for (const scope of allowedScopes) {
      if ((scopedData as any)[scope]) {
        const hash = computeSha256((scopedData as any)[scope]);
        const onChainCheck = await ledgerClient.verifyHash(vaultId, scope, hash);
        const isMatch = onChainCheck.isMatch && (allowSimulation || onChainCheck.isSimulated !== true);
        verificationResults[scope] = {
          sha256Hash: hash,
          isMatch,
          tier: onChainCheck.tier,
          timestamp: onChainCheck.timestamp,
          isSimulated: onChainCheck.isSimulated === true,
        };
        if (!isMatch) {
          allTamperFree = false;
        }
      }
    }

    // Fail closed if any hash does not match immutable ledger
    if (!allTamperFree) {
      await globalUserStore.recordAuditEntryAsync({
        keyId: keyVerification.payload.keyId,
        requestingOrg: org.name,
        orgType: org.type,
        accessedScopes: allowedScopes,
        purpose: "M2M Developer / Agent Direct Vault Query (TAMPER DETECTED)",
        integrityVerified: false,
        onChainTx: "",
        status: "TAMPER_DETECTED",
        targetVaultId: vaultId,
      });

      return NextResponse.json(
        {
          status: "REJECTED_TAMPER_DETECTED",
          error: "Critical integrity failure: database record does not match Base Sepolia on-chain hash.",
          blockchainProof: {
            tamperStatus: "HASH_MISMATCH_DETECTED",
            verifications: verificationResults,
          },
        },
        { status: 409 }
      );
    }

    // 6. Record Key Usage (atomic quota decrement)
    recordKeyExecution(keyVerification.payload.keyId);
    await globalUserStore.recordKeyUsageAsync(keyVerification.payload.keyId);

    // 7. Record Micro-Transaction Telemetry & Revenue Split
    globalAdminStore.recordQueryExecuted(1.0);
    const nodeConfig = SovereignNodeRouter.resolveSovereignNode(candidateData.residenceCountry || "NG");

    // 8. Record Citizen Transparency Audit Log
    await globalUserStore.recordAuditEntryAsync({
      keyId: keyVerification.payload.keyId,
      requestingOrg: org.name,
      orgType: org.type,
      accessedScopes: allowedScopes,
      purpose: "M2M Developer / Agent Direct Vault Query",
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: vaultId,
    });

    return NextResponse.json({
      status: "VERIFIED_SUCCESS",
      candidateId: vaultId,
      requestingOrganization: {
        id: org.id,
        name: org.name,
        type: org.type,
      },
      sovereignNode: {
        nodeId: nodeConfig.nodeId,
        jurisdiction: nodeConfig.jurisdiction,
        regionName: nodeConfig.regionName,
        framework: nodeConfig.complianceFramework,
      },
      allowedScopes,
      verifiedData: scopedData,
      blockchainProof: {
        tamperStatus: "TAMPER_FREE_VERIFIED",
        network: "Base Sepolia L2",
        verifications: verificationResults,
      },
      govTechMicroTransaction: {
        totalFeeUSD: 1.0,
        platformTreasurySplitUSD: 0.6,
        sovereignHostSplitUSD: 0.4,
        sovereignHostPayoutWallet: nodeConfig.payoutAddress,
        contract: "SabiRevenueSplitter.sol",
      },
      queriedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "M2M Query pipeline error", details: err.message },
      { status: 500 }
    );
  }
}
