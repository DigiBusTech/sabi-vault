import { NextRequest, NextResponse } from "next/server";
import { verifyScopedApiKey, filterVaultByScope, recordKeyExecution } from "@/core/crypto/scoped_key";
import { SovereignNodeRouter } from "@/core/sovereign/node_router";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { computeSha256 } from "@/core/crypto/hasher";
import { globalUserStore } from "@/core/vault/user_store";
import { authenticateM2M } from "@/lib/auth/auth_guard";

/**
 * POST /api/v1/vault/query
 *
 * Enterprise Scoped Query Endpoint
 * Accepts a Scoped API Key (`sbk_live_v1_...`), verifies signature and TTL,
 * redacts un-scoped data categories, and performs live on-chain hash verification.
 */
export async function POST(req: NextRequest) {
  try {
    const orgAuth = await authenticateM2M(req);
    if (!orgAuth.isValid || !orgAuth.org) {
      return NextResponse.json({ error: orgAuth.error || "Unauthorized organization" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing required 'apiKey' parameter" }, { status: 400 });
    }

    // 1. Verify Cryptographic API Key
    const verification = verifyScopedApiKey(apiKey, undefined, orgAuth.org.id);
    if (!verification.isValid || !verification.payload) {
      return NextResponse.json(
        {
          error: "Cryptographic API key rejected",
          details: verification.error,
        },
        { status: 401 }
      );
    }

    const { vaultId, allowedScopes, sovereignNode, expiresAt, maxQueries } = verification.payload;

    // 2. Fetch Structured Data from Sovereign Node Storage
    const rawVault = globalUserStore.findVault(vaultId);
    if (!rawVault) {
      return NextResponse.json(
        { error: `Vault '${vaultId}' not found on sovereign node '${sovereignNode}'` },
        { status: 404 }
      );
    }

    // 3. Redact Un-Permitted Categories
    const scopedVault = filterVaultByScope(rawVault, allowedScopes);
    const scopesToVerify = allowedScopes.filter((scope) => Boolean((scopedVault as any)[scope]));
    if (scopesToVerify.length === 0 || scopesToVerify.length !== allowedScopes.length) {
      return NextResponse.json(
        { error: `Vault '${vaultId}' is missing one or more consented categories; integrity cannot be verified.` },
        { status: 409 }
      );
    }

    // 4. Verify Document Hashes Against Blockchain Ledger
    const ledgerClient = new BlockchainLedgerClient();
    const verificationResults: Record<string, any> = {};
    let allTamperFree = scopesToVerify.length > 0;

    for (const scope of allowedScopes) {
      if ((scopedVault as any)[scope]) {
        const currentDataHash = computeSha256((scopedVault as any)[scope]);
        const onChainCheck = await ledgerClient.verifyHash(vaultId, scope, currentDataHash);
        verificationResults[scope] = {
          sha256Hash: currentDataHash,
          onChainVerified: onChainCheck.isMatch && onChainCheck.isSimulated !== true,
          tier: onChainCheck.tier,
          ledgerTimestamp: onChainCheck.timestamp,
          isSimulated: onChainCheck.isSimulated === true,
        };
        if (!onChainCheck.isMatch || onChainCheck.isSimulated === true) allTamperFree = false;
      }
    }

    if (!allTamperFree) {
      globalUserStore.recordAuditEntry({
        requestingOrg: orgAuth.org.name,
        orgType: "ENTERPRISE",
        accessedScopes: allowedScopes,
        purpose: "Cryptographic Scoped Vault Query (TAMPER DETECTED)",
        integrityVerified: false,
        onChainTx: "",
        status: "TAMPER_DETECTED",
        targetVaultId: vaultId,
      });

      return NextResponse.json(
        {
          status: "REJECTED_TAMPER_DETECTED",
          error: "Critical integrity failure: database record does not match on-chain ledger hash.",
          integrityVerifications: verificationResults,
        },
        { status: 409 }
      );
    }

    // 5. Record Quota Usage and Citizen Audit Log
    recordKeyExecution(verification.payload.keyId);
    globalUserStore.recordKeyUsage(verification.payload.keyId);

    globalUserStore.recordAuditEntry({
      requestingOrg: orgAuth.org.name,
      orgType: "ENTERPRISE",
      accessedScopes: allowedScopes,
      purpose: "Cryptographic Scoped Vault Query",
      integrityVerified: true,
      onChainTx: "",
      status: "VERIFIED_ACCESSED",
      targetVaultId: vaultId,
    });

    // 6. Calculate GovTech 60/40 Micro-Transaction Accounting
    const queryFeeUsd = 1.0;
    const platformShareUsd = 0.6;
    const sovereignHostShareUsd = 0.4;
    const nodeConfig = SovereignNodeRouter.resolveSovereignNode(rawVault.residenceCountry || "NG");

    return NextResponse.json({
      status: "SUCCESS",
      vaultId,
      sovereignNode: {
        id: nodeConfig.nodeId,
        region: nodeConfig.regionName,
        jurisdiction: nodeConfig.jurisdiction,
        complianceFramework: nodeConfig.complianceFramework,
      },
      allowedScopes,
      data: scopedVault,
      integrityVerifications: verificationResults,
      auditReceipt: {
        queryId: `qry_${Math.random().toString(36).substring(2, 10)}`,
        queryingOrganization: orgAuth.org.name,
        feeUsd: queryFeeUsd,
        revenueSplit: {
          platformUsd: platformShareUsd,
          sovereignHostUsd: sovereignHostShareUsd,
          payoutWallet: nodeConfig.payoutAddress,
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal error processing scoped query", details: err.message },
      { status: 500 }
    );
  }
}
