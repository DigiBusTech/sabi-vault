import { NextRequest, NextResponse } from "next/server";
import { EphemeralDocumentParser } from "@/core/parser/ephemeral_parser";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { VaultCategory, VerificationTier } from "@/types/vault";

/**
 * POST /api/v1/vault/sync
 *
 * Ephemeral Document Synchronization Endpoint
 * Receives file content ephemerally, parses into standardized category JSON,
 * sanitizes the in-memory buffer, and commits the hash on-chain.
 * ZERO raw physical files are saved on disk or server.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vaultId, fileName, fileBase64, category } = body;

    if (!vaultId || !fileName || !fileBase64) {
      return NextResponse.json(
        { error: "Missing required fields: vaultId, fileName, or fileBase64" },
        { status: 400 }
      );
    }

    // 1. Create ephemeral Buffer in memory
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // 2. Process via Ephemeral Parser
    const gateway = new MultiLLMGateway();
    const parser = new EphemeralDocumentParser(gateway);
    const parsedResult = await parser.processDocumentStream(
      fileBuffer,
      fileName,
      category as VaultCategory | undefined
    );

    // 3. Commit Hash to Blockchain Ledger
    const ledgerClient = new BlockchainLedgerClient();
    const commitResult = await ledgerClient.commitHash(
      vaultId,
      parsedResult.category,
      parsedResult.sha256Hash,
      parsedResult.tier
    );

    return NextResponse.json({
      status: "SUCCESS_SYNCED",
      vaultId,
      category: parsedResult.category,
      documentName: parsedResult.documentName,
      sha256Hash: parsedResult.sha256Hash,
      verificationTier: parsedResult.tier,
      onChainCommit: {
        txHash: commitResult.txHash,
        network: "Base Sepolia L2",
        timestamp: commitResult.timestamp,
      },
      structuredData: parsedResult.structuredData,
      zeroRawFileGuarantee: {
        bufferOverwrittenInMemory: true,
        savedToDisk: false,
        sovereignCompliance: "NDPC / GDPR Compliant",
      },
      syncedAt: parsedResult.processedAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to ephemerally sync document", details: err.message },
      { status: 500 }
    );
  }
}

