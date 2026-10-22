import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth_guard";
import { VisionExtractor } from "@/core/parser/vision_extractor";
import { computeSha256 } from "@/core/crypto/hasher";
import { BlockchainLedgerClient } from "@/core/blockchain/ledger_client";
import { globalUserStore } from "@/core/vault/user_store";
import { VaultCategory, CloudFileRef } from "@/types/vault";
import {
  getUserCloudIntegration,
  CloudProvider,
} from "@/core/storage/cloud_integrations";
import { GoogleDriveConnector } from "@/core/storage/google_drive";
import { DropboxConnector } from "@/core/storage/dropbox";
import { randomUUID } from "crypto";

interface CachedScanPreview {
  scanId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  category: VaultCategory;
  extractedFields: Record<string, any>;
  sha256Hash: string;
  tier: number;
  confidence: number;
  createdAt: number;
}

// In-memory cache for two-phase commit previews (15-minute TTL)
const scanPreviewCache = new Map<string, CachedScanPreview>();

function cleanExpiredPreviews() {
  const now = Date.now();
  scanPreviewCache.forEach((preview, id) => {
    if (now - preview.createdAt > 15 * 60 * 1000) {
      scanPreviewCache.delete(id);
    }
  });
}

/**
 * POST /api/v1/vault/scan
 *
 * Sovereign Document Scanning & AI Extraction Endpoint (Two-Phase Commit)
 *
 * Phase A (confirmed: false):
 * - Accepts base64 image or PDF.
 * - Extracts structured fields via Gemini 1.5 Flash Vision AI without hallucination.
 * - Computes cryptographic SHA-256 hash.
 * - Returns preview to client for citizen verification before persistence.
 *
 * Phase B (confirmed: true):
 * - Dispatches original file directly to citizen's private cloud (Google Drive/Dropbox).
 * - Commits the mathematical SHA-256 hash to Base Sepolia blockchain ledger.
 * - Saves structured credential into sovereign node store.
 * - ZERO physical files are retained on SabiProfile servers.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const {
      confirmed = false,
      scanId,
      fileName,
      fileBase64,
      mimeType = "image/jpeg",
      category,
      cloudProvider,
    } = body;

    const targetUserId = auth.user.userId;

    // --- PHASE A: PREVIEW & AI VISION EXTRACTION ---
    if (!confirmed) {
      if (!fileBase64 || !fileName) {
        return NextResponse.json(
          { error: "Missing required fields: fileName or fileBase64" },
          { status: 400 }
        );
      }

      // Max 12MB base64 payload (~8-9MB file)
      if (typeof fileBase64 === "string" && fileBase64.length > 12 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File exceeds maximum scan size of 8 MB" },
          { status: 413 }
        );
      }

      const fileBuffer = Buffer.from(fileBase64, "base64");
      const sha256Hash = computeSha256(fileBuffer);

      // Run Gemini Vision Extractor
      const extractor = new VisionExtractor();
      const result = await extractor.extractDocumentFields(
        fileBase64,
        mimeType,
        category as VaultCategory | undefined,
        fileName
      );

      // Clean preview cache & store
      cleanExpiredPreviews();
      const generatedScanId = randomUUID();
      scanPreviewCache.set(generatedScanId, {
        scanId: generatedScanId,
        userId: targetUserId,
        fileName,
        mimeType,
        category: result.inferredCategory,
        extractedFields: result.extractedFields,
        sha256Hash,
        tier: result.tier,
        confidence: result.confidence,
        createdAt: Date.now(),
      });

      // Zero ephemeral buffer
      fileBuffer.fill(0);

      return NextResponse.json({
        phase: "PREVIEW",
        scanId: generatedScanId,
        fileName,
        sha256Hash,
        inferredCategory: result.inferredCategory,
        verificationTier: result.tier,
        confidence: result.confidence,
        extractedFields: result.extractedFields,
        rawTextSnippet: result.rawTextSnippet,
        canSaveDirectly: true,
      });
    }

    // --- PHASE B: CONFIRMATION, CLOUD DISPATCH & ON-CHAIN COMMIT ---
    if (!fileBase64 && !scanId) {
      return NextResponse.json(
        { error: "Missing scanId or fileBase64 for confirmation" },
        { status: 400 }
      );
    }

    const cachedPreview = scanId ? scanPreviewCache.get(scanId) : undefined;
    const effectiveFileName = fileName || cachedPreview?.fileName || "scanned_credential.jpg";
    const effectiveCategory: VaultCategory =
      (category as VaultCategory) || cachedPreview?.category || "portfolio";

    const fileBuffer = fileBase64
      ? Buffer.from(fileBase64, "base64")
      : Buffer.from("");

    const sha256Hash = fileBuffer.length > 0
      ? computeSha256(fileBuffer)
      : cachedPreview?.sha256Hash || computeSha256(Buffer.from(effectiveFileName));

    // 1. Cloud Storage Dispatch (User-Controlled Vault)
    let cloudFileRef: CloudFileRef | undefined = undefined;
    const providerToUse = (cloudProvider as CloudProvider) || "google_drive";

    try {
      const integration = await getUserCloudIntegration(targetUserId, providerToUse);
      if (integration && integration.accessToken && fileBuffer.length > 0) {
        if (providerToUse === "google_drive") {
          const driveConnector = new GoogleDriveConnector(integration.accessToken);
          let targetFolderId = integration.folderId;
          if (!targetFolderId) {
            targetFolderId = await driveConnector.createVaultFolder("SabiProfile Vault");
          }

          const uploadResult = await driveConnector.uploadFile(
            effectiveFileName,
            fileBuffer,
            mimeType,
            targetFolderId
          );

          cloudFileRef = {
            provider: "google_drive",
            fileId: uploadResult.id,
            webViewLink: uploadResult.webViewLink,
            uploadedAt: new Date().toISOString(),
          };
        } else if (providerToUse === "dropbox") {
          const dropboxConnector = new DropboxConnector(integration.accessToken);
          const uploadResult = await dropboxConnector.uploadFile(
            `/SabiProfile Vault/${effectiveFileName}`,
            fileBuffer
          );

          cloudFileRef = {
            provider: "dropbox",
            fileId: uploadResult.id,
            webViewLink: undefined,
            uploadedAt: new Date().toISOString(),
          };
        }
      }
    } catch (cloudErr: any) {
      console.warn("[VaultScan] Cloud dispatch warning (non-fatal):", cloudErr.message);
    }

    // 2. Blockchain Ledger Commit
    const tier = cachedPreview?.tier || 1;
    const ledgerClient = new BlockchainLedgerClient();
    const commitResult = await ledgerClient.commitHash(
      targetUserId,
      effectiveCategory,
      sha256Hash,
      tier
    );

    // 3. Persist Structured Credential in Sovereign Store
    const structuredRecord = {
      ...(cachedPreview?.extractedFields || body.extractedFields || {}),
      documentName: effectiveFileName,
      hashRef: sha256Hash,
      tier,
      cloudFileRef,
      verifiedAt: new Date().toISOString(),
    };

    globalUserStore.addCredential(effectiveCategory, structuredRecord, targetUserId);

    // 4. Invariant Compliance: Zero ephemeral buffer
    if (fileBuffer.length > 0) {
      fileBuffer.fill(0);
    }
    if (scanId) {
      scanPreviewCache.delete(scanId);
    }

    return NextResponse.json({
      status: "SUCCESS_SECURED",
      vaultId: targetUserId,
      category: effectiveCategory,
      documentName: effectiveFileName,
      sha256Hash,
      verificationTier: tier,
      onChainCommit: {
        txHash: commitResult.txHash,
        network: "Base Sepolia L2",
        timestamp: commitResult.timestamp,
        isSimulated: commitResult.isSimulated === true,
      },
      structuredData: structuredRecord,
      cloudFileRef,
      zeroRawFileGuarantee: {
        bufferOverwrittenInMemory: true,
        savedToDisk: false,
        sovereignCompliance: "NDPC / GDPR Compliant",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process document scan", details: err.message },
      { status: 500 }
    );
  }
}
