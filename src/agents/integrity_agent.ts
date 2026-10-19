import { computeSha256 } from "@/core/crypto/hasher";
import { VerificationTier } from "@/types/vault";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";

export interface IntegrityCheckResult {
  vaultId: string;
  category: string;
  isTamperFree: boolean;
  computedHash: string;
  onChainHash: string;
  verificationTier: VerificationTier;
  timestamp: number;
  isSimulated: boolean;
  notaryAttestationPresent: boolean;
  anomalyDetails?: string;
}

/**
 * Sabi Vault Integrity & Verification Agent
 *
 * Mathematically validates that structured candidate data has not been altered or
 * modified in the database by computing the current canonical SHA-256 hash
 * and comparing it directly against the on-chain blockchain registry anchor.
 */
export class IntegrityAgent {
  private ledgerClient: BlockchainLedgerClient;

  constructor(ledgerClient?: BlockchainLedgerClient) {
    this.ledgerClient = ledgerClient || new BlockchainLedgerClient();
  }

  /**
   * Verifies a candidate's structured JSON data against their on-chain recorded hash.
   * In a live production setting, this queries SabiVaultRegistry.sol on Base/Polygon.
   */
  async verifyCategoryIntegrity(
    vaultId: string,
    category: string,
    candidateCategoryData: object,
    mockOnChainHash?: string,
    tier: VerificationTier = VerificationTier.TIER_1_STANDARD_HASHED
  ): Promise<IntegrityCheckResult> {
    // 1. Deterministically compute current SHA-256 hash of the candidate's active JSON data
    const computedHash = computeSha256(candidateCategoryData);

    let onChainHash = mockOnChainHash;
    let isTamperFree = false;
    let verificationTier = tier;
    let timestamp = Math.floor(Date.now() / 1000);
    let isSimulated = false;

    if (mockOnChainHash) {
      isTamperFree = computedHash.toLowerCase() === mockOnChainHash.toLowerCase();
    } else {
      const ledgerResult = await this.ledgerClient.verifyHash(vaultId, category, computedHash);
      isSimulated = ledgerResult.isSimulated === true;
      const allowSimulation = process.env.NODE_ENV !== "production";
      isTamperFree = ledgerResult.isMatch && (allowSimulation || !isSimulated);
      if (ledgerResult.tier) verificationTier = ledgerResult.tier;
      if (ledgerResult.timestamp) timestamp = ledgerResult.timestamp;
      onChainHash = isTamperFree ? computedHash : "UNCOMMITTED_OR_MISMATCH";
    }


    return {
      vaultId,
      category,
      isTamperFree,
      computedHash,
      onChainHash: onChainHash || "NO_LEDGER_RECORD",
      verificationTier,
      timestamp,
      isSimulated,
      notaryAttestationPresent: verificationTier === VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED,
      anomalyDetails: isTamperFree
        ? undefined
        : isSimulated
          ? "Integrity verification used a local simulation and is not accepted as on-chain proof."
          : `CRITICAL INTEGRITY FAILURE: Local JSON hash (${computedHash}) does not match immutable on-chain ledger hash (${onChainHash}). Document or database records have been tampered with or never committed.`,
    };
  }
}

