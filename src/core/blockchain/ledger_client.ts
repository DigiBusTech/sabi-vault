import { ethers } from "ethers";
import { VerificationTier } from "@/types/vault";
import { getConfigValueSync } from "@/core/config/platform_config";
import { liveTelemetry } from "@/lib/telemetry/live_logger";

export interface OnChainVerificationResponse {
  isMatch: boolean;
  tier: VerificationTier;
  timestamp: number;
  blockNumber?: number;
  txHash?: string;
  isSimulated?: boolean;
}


// Minimal ABI definitions for SabiProfile smart contracts
export const REGISTRY_ABI = [
  "function commitTier1Hash(string vaultId, string category, bytes32 categoryHash) external returns (bytes32)",
  "function commitTier2NotarizedHash(string vaultId, string category, bytes32 categoryHash, bytes notarySealSignature) external returns (bytes32)",
  "function verifyHash(string vaultId, string category, bytes32 expectedHash) external view returns (bool isMatch, uint8 tier, uint256 timestamp)",
  "function computeRecordKey(string vaultId, string category) public pure returns (bytes32)",
];

export const SPLITTER_ABI = [
  "function executeQueryWithSplit(string regionalNodeId) external payable",
  "function standardQueryFee() external view returns (uint256)",
  "function regionalNodeHosts(bytes32) external view returns (address)",
];

/**
 * SabiProfile Blockchain Ledger Client
 *
 * Interfaces with Base Sepolia / Polygon L2 smart contracts.
 * Enables decentralized immutability checks and 60/40 fee split execution.
 */
export class BlockchainLedgerClient {
  private rpcUrl: string;
  private registryAddress: string;
  private splitterAddress: string;
  private provider: ethers.JsonRpcProvider | null = null;

  // In-memory ledger cache for local simulation / zero-cost testnet runs
  private static localSimulationLedger: Map<string, { hash: string; tier: VerificationTier; timestamp: number }> = new Map();
  private get simulationEnabled(): boolean {
    if (process.env.NODE_ENV === "production") return false;
    const setting = getConfigValueSync("blockchain.simulation_mode");
    return setting !== "false";
  }


  constructor(
    rpcUrl: string = getConfigValueSync("blockchain.base_sepolia_rpc") || "https://sepolia.base.org",
    registryAddress: string =
      getConfigValueSync("blockchain.registry_contract_address") ||
      "0x1234567890123456789012345678901234567890",
    splitterAddress: string =
      getConfigValueSync("blockchain.splitter_contract_address") ||
      "0x0987654321098765432109876543210987654321"
  ) {
    this.rpcUrl = rpcUrl;
    this.registryAddress = (registryAddress || "").trim().toLowerCase();
    this.splitterAddress = (splitterAddress || "").trim().toLowerCase();

    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    } catch {
      this.provider = null;
    }
  }

  /**
   * Commits a document or structured record SHA-256 hash to the on-chain ledger.
   */
  async commitHash(
    vaultId: string,
    category: string,
    sha256Hex: string,
    tier: VerificationTier = VerificationTier.TIER_1_STANDARD_HASHED,
    signerPrivateKey?: string
  ): Promise<{ txHash: string; timestamp: number; isSimulated?: boolean; gasUsed?: string }> {

    const key = `${vaultId}:${category}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const rawKey = (signerPrivateKey || getConfigValueSync("blockchain.signer_private_key") || "").trim();
    let normalizedPrivateKey: string | undefined = undefined;

    if (rawKey) {
      if (rawKey.startsWith("0x") && rawKey.length === 42) {
        throw new Error(
          "Invalid private key configuration: A 42-character public wallet address (" +
          rawKey.substring(0, 10) +
          "...) was supplied instead of the private key. In MetaMask, tap Account Details -> Show Private Key to export your 64/66-character private key."
        );
      }
      normalizedPrivateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
      if (normalizedPrivateKey.length !== 66) {
        throw new Error(
          `Invalid private key length (${rawKey.length} chars). A standard EVM private key must be 64 hex characters (or 66 with 0x prefix).`
        );
      }
    }

    const registryConfigured =
      this.registryAddress !== "0x1234567890123456789012345678901234567890";

    const commitStart = Date.now();

    if (normalizedPrivateKey && this.provider && registryConfigured) {
      try {
        const wallet = new ethers.Wallet(normalizedPrivateKey, this.provider);
        const contract = new ethers.Contract(this.registryAddress, REGISTRY_ABI, wallet);
        const bytes32Hash = "0x" + sha256Hex;
        const tx = await contract.commitTier1Hash(vaultId, category, bytes32Hash);
        const receipt = await tx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error("Blockchain transaction was not confirmed successfully.");
        }
        liveTelemetry.record({
          subsystem: "BLOCKCHAIN_LEDGER",
          level: "SUCCESS",
          action: "COMMIT_HASH_BASE_SEPOLIA",
          durationMs: Date.now() - commitStart,
          statusCode: 200,
          message: `On-chain anchor mined successfully on Base Sepolia. Block: ${receipt.blockNumber}`,
          metadata: {
            contract: this.registryAddress,
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString(),
            category,
            vaultId,
          },
          userId: vaultId,
        });
        return {
          txHash: receipt.hash,
          timestamp,
          isSimulated: false,
          gasUsed: receipt.gasUsed?.toString(),
        };
      } catch (err: any) {
        liveTelemetry.record({
          subsystem: "BLOCKCHAIN_LEDGER",
          level: "ERROR",
          action: "COMMIT_HASH_BASE_SEPOLIA",
          durationMs: Date.now() - commitStart,
          statusCode: 500,
          errorCode: "LEDGER_TX_FAILED",
          message: `Base Sepolia on-chain commit reverted or rejected: ${err?.message || String(err)}`,
          metadata: { contract: this.registryAddress, category, vaultId },
          userId: vaultId,
        });
        if (!this.simulationEnabled) {
          const errMsg = err?.message || String(err);
          throw new Error(`Blockchain commit failed on Base Sepolia: ${errMsg}`, { cause: err });
        }
      }
    }

    if (!this.simulationEnabled) {
      liveTelemetry.record({
        subsystem: "BLOCKCHAIN_LEDGER",
        level: "ERROR",
        action: "COMMIT_HASH_VALIDATION",
        durationMs: Date.now() - commitStart,
        statusCode: 400,
        errorCode: "SIGNER_CONFIG_MISSING",
        message: "Signing private key is missing while simulation_mode is disabled.",
      });
      throw new Error(
        "Blockchain signing is not configured or private key is missing; refusing to simulate a production commit when simulation_mode is false."
      );
    }

    BlockchainLedgerClient.localSimulationLedger.set(key, {
      hash: sha256Hex.toLowerCase(),
      tier,
      timestamp,
    });
    const simTxHash = ethers.keccak256(ethers.toUtf8Bytes(`${key}:${sha256Hex}:${timestamp}`));

    liveTelemetry.record({
      subsystem: "BLOCKCHAIN_LEDGER",
      level: "INFO",
      action: "COMMIT_HASH_SIMULATED",
      durationMs: Date.now() - commitStart,
      statusCode: 200,
      message: `Simulated ledger commit generated for vault "${vaultId}" [${category}].`,
      metadata: { txHash: simTxHash, category, vaultId, tier },
      userId: vaultId,
    });
    return {
      txHash: simTxHash,
      timestamp,
      isSimulated: true,
    };
  }

  /**
   * Verifies if a given SHA-256 hash matches the on-chain recorded ledger hash.
   */
  async verifyHash(
    vaultId: string,
    category: string,
    expectedSha256Hex: string
  ): Promise<OnChainVerificationResponse> {
    const key = `${vaultId}:${category}`;
    const recorded = this.simulationEnabled
      ? BlockchainLedgerClient.localSimulationLedger.get(key)
      : undefined;

    if (recorded) {
      const isMatch = recorded.hash.toLowerCase() === expectedSha256Hex.toLowerCase();
      return {
        isMatch,
        tier: recorded.tier,
        timestamp: recorded.timestamp,
        isSimulated: true,
      };
    }

    // Attempt live on-chain check via JSON-RPC if configured
    if (this.provider && this.registryAddress && this.registryAddress !== "0x1234567890123456789012345678901234567890") {
      try {
        const contract = new ethers.Contract(this.registryAddress, REGISTRY_ABI, this.provider);
        const bytes32Hash = "0x" + expectedSha256Hex;
        const [isMatch, tier, timestamp] = await contract.verifyHash(vaultId, category, bytes32Hash);
        return {
          isMatch: Boolean(isMatch),
          tier: Number(tier) as VerificationTier,
          timestamp: Number(timestamp),
          isSimulated: false,
        };
      } catch (err: any) {
        console.warn(`[BlockchainClient] On-chain verification query failed: ${err.message}`);
      }
    }

    // Fail closed: Unknown or uncommitted document returns false
    return {
      isMatch: false,
      tier: VerificationTier.TIER_1_STANDARD_HASHED,
      timestamp: 0,
      isSimulated: false,
    };
  }

  /**
   * Commits a Tier 2 Notarized / Authenticated Hash with accredited notary seal signature.
   */
  async commitTier2NotarizedHash(
    vaultId: string,
    category: string,
    sha256Hex: string,
    sealSignature: string,
    notaryAddress?: string,
    signerPrivateKey?: string
  ): Promise<{ txHash: string; timestamp: number; isSimulated: boolean }> {
    const key = `${vaultId}:${category}`;
    const timestamp = Math.floor(Date.now() / 1000);

    const privateKey = signerPrivateKey || getConfigValueSync("blockchain.signer_private_key") || undefined;
    const registryConfigured =
      this.registryAddress !== "0x1234567890123456789012345678901234567890";

    if (privateKey && this.provider && registryConfigured) {
      try {
        const wallet = new ethers.Wallet(privateKey, this.provider);
        const contract = new ethers.Contract(this.registryAddress, REGISTRY_ABI, wallet);
        const bytes32Hash = "0x" + sha256Hex;
        const tx = await contract.commitTier2NotarizedHash(vaultId, category, bytes32Hash, sealSignature);
        const receipt = await tx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error("Blockchain transaction was not confirmed successfully.");
        }
        return { txHash: receipt.hash, timestamp, isSimulated: false };
      } catch (err) {
        if (!this.simulationEnabled) {
          throw new Error("Tier 2 blockchain commit failed; refusing to return a simulated receipt.", { cause: err });
        }
      }
    }

    if (!this.simulationEnabled) {
      throw new Error("Blockchain signing is not configured; refusing to simulate a Tier 2 production commit.");
    }

    BlockchainLedgerClient.localSimulationLedger.set(key, {
      hash: sha256Hex.toLowerCase(),
      tier: VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED,
      timestamp,
    });
    const simTxHash = ethers.keccak256(ethers.toUtf8Bytes(`${key}:tier2:${sealSignature}:${timestamp}`));
    return { txHash: simTxHash, timestamp, isSimulated: true };
  }

}
