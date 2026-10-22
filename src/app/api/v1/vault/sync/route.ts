import { NextRequest, NextResponse } from "next/server";
import { EphemeralDocumentParser } from "@/core/parser/ephemeral_parser";
import { MultiLLMGateway } from "@/agents/gateway/llm_gateway";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { VaultCategory, VaultCategoryEnum, CloudFileRef } from "@/types/vault";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { globalUserStore } from "@/core/vault/user_store";
import { liveTelemetry } from "@/lib/telemetry/live_logger";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/v1/vault/sync
 *
 * Ephemeral Document Synchronization Endpoint
 * Receives file content ephemerally (via multipart/form-data or JSON base64),
 * parses into standardized category JSON, sanitizes in-memory buffer,
 * and commits the hash on-chain.
 * ZERO raw physical files are saved on disk or server.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      liveTelemetry.record({
        subsystem: "SECURITY_AUTH",
        level: "WARN",
        action: "POST /api/v1/vault/sync",
        durationMs: Date.now() - startTime,
        statusCode: auth.status,
        errorCode: "AUTH_REQUIRED",
        message: auth.error || "Authentication required for document sync.",
      });
      return NextResponse.json({ error: auth.error || "Authentication required" }, { status: auth.status });
    }

    const targetVaultId = auth.user.userId;
    let fileName = "";
    let category: string | undefined = undefined;
    let fileBuffer: Buffer | null = null;
    let cloudProvider: any = undefined;
    let cloudFileId: string | undefined = undefined;
    let cloudWebViewLink: string | undefined = undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Missing required file in multipart form data." }, { status: 400 });
      }
      fileName = file.name || "uploaded_document";
      const rawCat = (formData.get("category") as string) || undefined;
      category = rawCat === "auto_detect" ? undefined : rawCat;
      cloudProvider = formData.get("cloudProvider") || undefined;
      cloudFileId = (formData.get("cloudFileId") as string) || undefined;
      cloudWebViewLink = (formData.get("cloudWebViewLink") as string) || undefined;

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      const { vaultId, fileName: jsonFileName, fileBase64, category: jsonCat, cloudProvider: cp, cloudFileId: cfId, cloudWebViewLink: cLink } = body;

      if (vaultId && vaultId !== targetVaultId) {
        return NextResponse.json({ error: "You may only sync documents to your own vault." }, { status: 403 });
      }

      if (!jsonFileName || !fileBase64) {
        return NextResponse.json(
          { error: "Missing required fields: fileName or fileBase64" },
          { status: 400 }
        );
      }

      fileName = jsonFileName;
      category = jsonCat === "auto_detect" ? undefined : jsonCat;
      cloudProvider = cp;
      cloudFileId = cfId;
      cloudWebViewLink = cLink;
      fileBuffer = Buffer.from(fileBase64, "base64");
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: "Empty file payload provided." }, { status: 400 });
    }

    // Strictly allowlist the caller-supplied category against the VaultCategory enum
    if (category !== undefined && !VaultCategoryEnum.safeParse(category).success) {
      return NextResponse.json({ error: "Invalid vault category supplied" }, { status: 400 });
    }

    // Cap raw file at 16 MB ephemeral processing limit
    if (fileBuffer.length > 16 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds the 16 MB ephemeral processing limit." },
        { status: 413 }
      );
    }

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

    // 4. Build cloud file reference if saved to citizen's private storage
    const cloudFileRef: CloudFileRef | undefined = cloudFileId
      ? {
          provider: cloudProvider || "google_drive",
          fileId: cloudFileId,
          webViewLink: cloudWebViewLink,
          uploadedAt: new Date().toISOString(),
        }
      : undefined;

    // 5. Update structured vault state in sovereign store (quota-enforced)
    const structuredRecord = {
      ...parsedResult.structuredData,
      documentName: parsedResult.documentName,
      hashRef: parsedResult.sha256Hash,
      tier: parsedResult.tier,
      cloudFileRef,
    };

    const incomingBytes = Buffer.byteLength(JSON.stringify(structuredRecord), "utf8");
    const allowance = globalUserStore.checkQuotaAllowance(targetVaultId, incomingBytes);
    if (!allowance.allowed) {
      liveTelemetry.record({
        subsystem: "API_ROUTER",
        level: "WARN",
        action: "POST /api/v1/vault/sync",
        durationMs: Date.now() - startTime,
        statusCode: 413,
        errorCode: "QUOTA_EXCEEDED",
        message: `Quota exceeded for ${targetVaultId}: ${allowance.usedBytes}+${incomingBytes} > ${allowance.allocatedBytes} bytes.`,
        userId: targetVaultId,
      });
      return NextResponse.json(
        {
          error: "Storage quota exceeded for your tier. Upgrade your storage tier or remove existing records.",
          code: "QUOTA_EXCEEDED",
          quota: {
            usedBytes: allowance.usedBytes,
            allocatedBytes: allowance.allocatedBytes,
            remainingBytes: allowance.remainingBytes,
            requiredBytes: incomingBytes,
          },
        },
        { status: 413 }
      );
    }

    globalUserStore.addCredential(
      parsedResult.category,
      structuredRecord,
      targetVaultId,
      {
        isSimulated: commitResult.isSimulated === true,
        gasUsedUnits: commitResult.gasUsed,
      }
    );

    const durationMs = Date.now() - startTime;
    liveTelemetry.record({
      subsystem: "API_ROUTER",
      level: "SUCCESS",
      action: "POST /api/v1/vault/sync",
      durationMs,
      statusCode: 200,
      message: `Document "${parsedResult.documentName}" successfully parsed, hashed, and anchored to ${commitResult.isSimulated ? "Simulation" : "Base Sepolia"}.`,
      metadata: {
        category: parsedResult.category,
        sha256: parsedResult.sha256Hash,
        txHash: commitResult.txHash,
        isSimulated: commitResult.isSimulated === true,
      },
      userId: targetVaultId,
    });

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
      cloudFileRef,
      zeroRawFileGuarantee: {
        bufferOverwrittenInMemory: true,
        savedToDisk: false,
        sovereignCompliance: "NDPC / GDPR Compliant",
      },
      syncedAt: parsedResult.processedAt,
    });
  } catch (err: any) {
    liveTelemetry.record({
      subsystem: "API_ROUTER",
      level: "ERROR",
      action: "POST /api/v1/vault/sync",
      durationMs: Date.now() - startTime,
      statusCode: 500,
      errorCode: "SYNC_PIPELINE_ERROR",
      message: `Sync pipeline failure: ${err?.message || String(err)}`,
      metadata: { stack: err?.stack?.substring(0, 300) },
    });

    return NextResponse.json(
      { error: "Failed to ephemerally sync document", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
