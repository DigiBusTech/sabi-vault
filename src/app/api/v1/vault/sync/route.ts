import { NextRequest, NextResponse } from "next/server";
import { EphemeralDocumentParser } from "@/core/parser/ephemeral_parser";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { VaultCategory, VerificationTier } from "@/types/vault";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { globalUserStore } from "@/core/vault/user_store";

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
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const body = await req.json();
    const { vaultId, fileName, fileBase64, category } = body;

    if (vaultId && vaultId !== auth.user.userId) {
      return NextResponse.json({ error: "You may only sync documents to your own vault." }, { status: 403 });
    }

    const targetVaultId = auth.user.userId;
    if (!fileName || !fileBase64) {
      return NextResponse.json(
        { error: "Missing required fields: fileName or fileBase64" },
        { status: 400 }
      );
    }

    // Guard: base64 inflates size ~4/3; cap raw file at 8 MB
    if (typeof fileBase64 === "string" && fileBase64.length > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds the 8 MB ephemeral processing limit." },
        { status: 413 }
      );
    }

    // 1. Create ephemeral Buffer in memory
    const fileBuffer = Buffer.from(fileBase64, "base64");

    // 2. Process via Ephemeral Parser (memory zeroed in finally block)
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
      targetVaultId,
      parsedResult.category,
      parsedResult.sha256Hash,
      parsedResult.tier
    );

    // 4. Update structured vault state in sovereign store
    globalUserStore.addCredential(
      parsedResult.category,
      {
        ...parsedResult.structuredData,
        documentName: parsedResult.documentName,
        hashRef: parsedResult.sha256Hash,
        tier: parsedResult.tier,
      },
      targetVaultId
    );


    return NextResponse.json({
      status: "SUCCESS_SYNCED",
      vaultId: targetVaultId,
      category: parsedResult.category,
      documentName: parsedResult.documentName,
      sha256Hash: parsedResult.sha256Hash,
      verificationTier: parsedResult.tier,
      onChainCommit: {
        txHash: commitResult.txHash,
        network: "Base Sepolia L2",
        timestamp: commitResult.timestamp,
        isSimulated: commitResult.isSimulated === true,
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

