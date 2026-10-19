import { NextRequest, NextResponse } from "next/server";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { authorizeRoles } from "@/lib/auth/auth_guard";

/**
 * POST /api/v1/notary/attest
 *
 * Tier 2 Notary & Institutional Attestation Endpoint
 * Binds accredited notary identity, digital seal signature, and document hash on-chain.
 */
export async function POST(req: NextRequest) {
  try {
    const authCheck = await authorizeRoles(req, ["notary", "super_admin"]);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const body = await req.json();
    const { vaultId, category, documentHash, notaryId, notaryJurisdiction, sealSignature, notaryWalletAddress } = body;

    if (!vaultId || !category || !documentHash || !notaryId || !sealSignature) {
      return NextResponse.json(
        { error: "Missing required parameters: vaultId, category, documentHash, notaryId, sealSignature" },
        { status: 400 }
      );
    }

    // Commit Tier-2 attestation on-chain via SabiVaultRegistry.sol
    const ledgerClient = new BlockchainLedgerClient();
    const commitResult = await ledgerClient.commitTier2NotarizedHash(
      vaultId,
      category,
      documentHash,
      sealSignature,
      notaryWalletAddress
    );

    return NextResponse.json({
      status: "ATTESTATION_COMMITTED_ON_CHAIN",
      vaultId,
      category,
      documentHash,
      verificationTier: "Tier 2 (Authenticated / Legalized)",
      notaryAttestation: {
        notaryId,
        jurisdiction: notaryJurisdiction || "Federal Republic of Nigeria / West Africa",
        sealSignature,
        onChainTxHash: commitResult.txHash,
        timestamp: commitResult.timestamp,
        blockchainNetwork: "Base Sepolia L2",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to commit notary attestation", details: err.message },
      { status: 500 }
    );
  }
}


