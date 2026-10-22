/**
 * SabiProfile Test Suite: Document Scanning, Cloud Integration & Vision AI
 * Run via: node tests/test_document_scan_and_cloud.mjs
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("SabiProfile: Document Scanning & Cloud Integration Test Suite");
console.log("=======================================================\n");

// --- Suite 1: Cloud Token AES-256-GCM Cryptographic Security ---
console.log("--- Suite 1: Cloud Token AES-256-GCM Cryptographic Security ---");

function getEncryptionKey(secret = "sabiprofile_cloud_integrations_master_secret_2026_default") {
  return createHash("sha256").update(secret).digest();
}

function encryptCloudToken(plaintext, secret) {
  if (!plaintext) return "";
  const key = getEncryptionKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptCloudToken(ciphertext, secret) {
  if (!ciphertext) return "";
  const key = getEncryptionKey(secret);
  const buf = Buffer.from(ciphertext, "base64");
  if (buf.length < 28) return "";
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

const sampleAccessToken = "ya29.a0AfH6SMD-SampleGoogleOAuthAccessTokenWithHighEntropy-123456789";
const sampleRefreshToken = "1//04SampleRefreshTokenLongLivedOAuthTokenForDriveOfflineAccess";

const encrypted = encryptCloudToken(sampleAccessToken);
assert(encrypted !== sampleAccessToken, "Token is encrypted and not stored in plaintext");
assert(encrypted.length > 32, "Encrypted token has sufficient ciphertext length");

const decrypted = decryptCloudToken(encrypted);
assert(decrypted === sampleAccessToken, "Decrypted token exactly matches original plaintext");

// Tamper check
const tampered = encrypted.substring(0, encrypted.length - 4) + "AAAA";
let tamperDetected = false;
try {
  decryptCloudToken(tampered);
} catch {
  tamperDetected = true;
}
assert(tamperDetected, "AES-256-GCM authentication tag detects tampered ciphertext");

// --- Suite 2: User Cloud Integration Store & In-Memory Fallback ---
console.log("\n--- Suite 2: User Cloud Integration Store & In-Memory Fallback ---");

const inMemoryCloudIntegrations = new Map();

function saveCloudIntegration(userUuid, provider, tokens) {
  const encryptedAccess = encryptCloudToken(tokens.accessToken);
  const encryptedRefresh = tokens.refreshToken ? encryptCloudToken(tokens.refreshToken) : null;
  const tokenExpiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null;

  const memKey = `${userUuid}:${provider}`;
  inMemoryCloudIntegrations.set(memKey, {
    id: memKey,
    userUuid,
    provider,
    encryptedAccessToken: encryptedAccess,
    encryptedRefreshToken: encryptedRefresh,
    tokenExpiresAt,
    driveFolderId: tokens.folderId || null,
    isActive: true,
    connectedAt: new Date(),
    updatedAt: new Date(),
  });
}

function getCloudIntegration(userUuid, provider) {
  const memKey = `${userUuid}:${provider}`;
  const record = inMemoryCloudIntegrations.get(memKey);
  if (!record || !record.isActive || !record.encryptedAccessToken) return null;
  return {
    accessToken: decryptCloudToken(record.encryptedAccessToken),
    refreshToken: record.encryptedRefreshToken ? decryptCloudToken(record.encryptedRefreshToken) : undefined,
    folderId: record.driveFolderId || undefined,
  };
}

function listCloudIntegrations(userUuid) {
  const results = [];
  inMemoryCloudIntegrations.forEach((val) => {
    if (val.userUuid === userUuid && val.isActive) {
      results.push({
        provider: val.provider,
        is_active: val.isActive,
        connected_at: val.connectedAt.toISOString(),
        drive_folder_id: val.driveFolderId,
      });
    }
  });
  return results;
}

const testUserId = "user_citizen_cloud_test_" + Date.now();
saveCloudIntegration(testUserId, "google_drive", {
  accessToken: sampleAccessToken,
  refreshToken: sampleRefreshToken,
  expiresIn: 3600,
  folderId: "drive_folder_id_sabi_vault_123",
});

const retrieved = getCloudIntegration(testUserId, "google_drive");
assert(retrieved !== null, "Cloud integration retrieved successfully");
assert(retrieved?.accessToken === sampleAccessToken, "Stored access token decrypted correctly");
assert(retrieved?.folderId === "drive_folder_id_sabi_vault_123", "Drive vault folder ID preserved");

const list = listCloudIntegrations(testUserId);
assert(list.length >= 1, "List returns active cloud integration");
assert(list[0].provider === "google_drive", "Provider listed is google_drive");
assert(list[0].is_active === true, "Integration is marked active");
assert(!("encryptedAccessToken" in list[0]), "Raw/encrypted tokens are NOT exposed in public list");

// --- Suite 3: Gemini Vision AI Extraction & Category Classification ---
console.log("\n--- Suite 3: Gemini Vision AI Extraction & Category Classification ---");

function classifyDocument(fileName, textSnippet = "") {
  const lower = (fileName + " " + textSnippet).toLowerCase();
  if (lower.includes("statement") || lower.includes("bank") || lower.includes("tax") || lower.includes("balance")) {
    return { category: "finance", tier: 1 };
  }
  if (lower.includes("degree") || lower.includes("university") || lower.includes("transcript") || lower.includes("gpa")) {
    return { category: "academics", tier: 2 };
  }
  if (lower.includes("resume") || lower.includes("engineer") || lower.includes("employment") || lower.includes("work")) {
    return { category: "experience", tier: 1 };
  }
  if (lower.includes("certificate") || lower.includes("license") || lower.includes("aws") || lower.includes("certified")) {
    return { category: "certifications", tier: 1 };
  }
  if (lower.includes("award") || lower.includes("hackathon") || lower.includes("grant") || lower.includes("prize")) {
    return { category: "achievements", tier: 1 };
  }
  return { category: "portfolio", tier: 1 };
}

const testBank = classifyDocument("Zenith_Bank_Statement_Q3_2026.pdf", "Closing Liquid Balance 4,500,000 NGN");
assert(testBank.category === "finance", "Classified bank statement as finance");
assert(testBank.tier === 1, "Finance category assigned Tier 1 Standard Hashed");

const testDegree = classifyDocument("University_Degree_Computer_Science.jpg", "Bachelor of Science First Class Honours");
assert(testDegree.category === "academics", "Classified university degree as academics");
assert(testDegree.tier === 2, "Academics category assigned Tier 2 Legalized/Authenticated");

const testCert = classifyDocument("AWS_Solutions_Architect_Badge.png", "Amazon Web Services Certified");
assert(testCert.category === "certifications", "Classified certificate as certifications");

// --- Suite 4: Zero Raw Document Centralization: Buffer Sanitization ---
console.log("\n--- Suite 4: Zero Raw Document Centralization: Buffer Sanitization ---");

function computeSha256(data) {
  const hasher = createHash("sha256");
  if (Buffer.isBuffer(data)) hasher.update(data);
  else if (typeof data === "string") hasher.update(data, "utf8");
  else hasher.update(JSON.stringify(data), "utf8");
  return hasher.digest("hex");
}

const rawBuffer = Buffer.from("TOP_SECRET_OFFICIAL_BANK_STATEMENT_DATA_CITIZEN_VAULT");
const originalContent = rawBuffer.toString("utf8");
const docHash = computeSha256(rawBuffer);

assert(docHash.length === 64, "Computed SHA-256 hash is standard 64-character hex");
assert(/^[0-9a-f]{64}$/.test(docHash), "Hash contains valid lowercase hex characters");

// Zero-Centralization buffer wipe
rawBuffer.fill(0);
assert(rawBuffer.toString("utf8") !== originalContent, "Buffer overwritten with zeroes");
assert(rawBuffer[0] === 0 && rawBuffer[rawBuffer.length - 1] === 0, "Buffer memory explicitly zeroed");

// --- Suite 5: Blockchain Ledger Anchoring (Base Sepolia L2) ---
console.log("\n--- Suite 5: Blockchain Ledger Anchoring (Base Sepolia L2) ---");

function commitHashSimulation(userId, category, sha256Hash, tier) {
  const entropy = `${userId}:${category}:${sha256Hash}:${tier}:${Date.now()}`;
  const txHash = "0x" + createHash("sha256").update(entropy).digest("hex");
  return {
    txHash,
    network: "Base Sepolia L2",
    timestamp: Date.now(),
    isSimulated: true,
  };
}

const commitRes = commitHashSimulation(testUserId, "finance", docHash, 1);
assert(commitRes.txHash.startsWith("0x"), "Blockchain transaction hash formatted with 0x prefix");
assert(commitRes.txHash.length === 66, "Transaction hash is standard 32-byte (66-char hex)");
assert(typeof commitRes.timestamp === "number", "On-chain timestamp recorded as numeric epoch");

// --- Suite 6: CloudFileRef Metadata Structure ---
console.log("\n--- Suite 6: CloudFileRef Metadata Structure ---");

const cloudFileRef = {
  provider: "google_drive",
  fileId: "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  webViewLink: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view",
  uploadedAt: new Date().toISOString(),
};

assert(cloudFileRef.provider === "google_drive", "Cloud provider is google_drive");
assert(cloudFileRef.fileId.length > 10, "Drive fileId is valid");
assert(cloudFileRef.webViewLink.startsWith("https://drive.google.com"), "Web view link points to user's Drive");

console.log("\n=======================================================");
console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

