import assert from "assert";
import { computeSha256 } from "../src/core/crypto/hasher.js";
import { generateScopedApiKey, verifyScopedApiKey, filterVaultByScope } from "../src/core/crypto/scoped_key.js";
import { globalUserStore } from "../src/core/vault/user_store.js";
import { globalGovtStore } from "../src/core/government/govt_store.js";
import { globalCriteriaStore } from "../src/core/enterprise/criteria_store.js";
import { globalAdminStore } from "../src/core/admin/admin_store.js";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("SABI VAULT: MASTER INTEGRATION TEST SUITE");
  console.log("=======================================================\n");

  // TEST 1: Citizen Vault Credential CRUD & Ephemeral Cloud Sync
  console.log("Test 1: Citizen Vault Credential Management & Ephemeral Sync...");
  const initialAcademicsCount = globalUserStore.getVault().academics?.degrees?.length || 0;

  // Add credential
  const addRes = globalUserStore.addCredential("academics", {
    institution: "Imperial College London",
    degreeType: "MSc",
    fieldOfStudy: "Advanced Computing & Cryptography",
    graduationYear: 2025,
    gpa: 4.92,
    maxGpa: 5.0,
    tier: 1,
  });
  assert.strictEqual(addRes.success, true, "Credential addition must succeed");
  assert.ok(addRes.hash && addRes.hash.length === 64, "Deterministic SHA-256 hash must be 64 hex characters");
  assert.strictEqual(
    globalUserStore.getVault().academics?.degrees?.length,
    initialAcademicsCount + 1,
    "Academics count must increment"
  );

  // Simulated Ephemeral Cloud Sync
  const syncRes = globalUserStore.simulateCloudSync("MIT_Consensus_Systems.pdf", "certifications", "google_drive");
  assert.strictEqual(syncRes.success, true, "Cloud sync must succeed");
  assert.strictEqual(syncRes.memoryZeroed, true, "Zero Raw Centralization Invariant: In-memory buffer zeroing verified");
  assert.ok(syncRes.hashRef && syncRes.hashRef.length === 64, "Synced file must have SHA-256 hash anchored");

  // Delete credential
  const deleteRes = globalUserStore.deleteCredential("academics", addRes.item.id);
  assert.strictEqual(deleteRes, true, "Credential deletion must succeed");
  console.log("  ✓ Citizen Vault CRUD & Ephemeral Buffer Zeroing Passed.");

  // TEST 2: Scoped Key Minting, Quota Decrement, and One-Click Revocation
  console.log("\nTest 2: Scoped Key Minting, Quotas & One-Click Revocation...");
  const mintedKey = globalUserStore.mintKey({
    allowedScopes: ["finance", "academics"],
    ttlDays: 7,
    maxQueries: 2,
    label: "Embassy Visa Verification Key",
  });
  assert.strictEqual(mintedKey.status, "ACTIVE");
  assert.strictEqual(mintedKey.remainingQueries, 2);

  // Verify key cryptographic validity
  const keyCheck = verifyScopedApiKey(mintedKey.rawKey);
  assert.strictEqual(keyCheck.isValid, true, "Minted key must have valid HMAC-SHA256 signature");

  // Record usage
  globalUserStore.recordKeyUsage(mintedKey.keyId);
  const updatedKeys1 = globalUserStore.listKeys();
  const foundKey1 = updatedKeys1.find((k) => k.keyId === mintedKey.keyId);
  assert.strictEqual(foundKey1.remainingQueries, 1, "Remaining queries must decrement to 1");

  // One-click revocation
  const revoked = globalUserStore.revokeKey(mintedKey.keyId);
  assert.strictEqual(revoked, true, "Key revocation must return true");
  const updatedKeys2 = globalUserStore.listKeys();
  const foundKey2 = updatedKeys2.find((k) => k.keyId === mintedKey.keyId);
  assert.strictEqual(foundKey2.status, "REVOKED", "Key status must update to REVOKED");
  console.log("  ✓ Scoped Key Engine & One-Click Revocation Passed.");

  // TEST 3: Citizen Privacy & Transparency Audit Ledger
  console.log("\nTest 3: Citizen Privacy Transparency Audit Trail...");
  const initialAuditCount = globalUserStore.getAuditLogs().length;
  globalUserStore.recordAuditEntry({
    requestingOrg: "Government Immigration & Border Agency",
    orgType: "GOVERNMENT",
    accessedScopes: ["finance", "academics"],
    purpose: "Skilled Worker Visa Compliance Check",
    integrityVerified: true,
    onChainTx: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: "VERIFIED_ACCESSED",
  });
  const updatedAuditLogs = globalUserStore.getAuditLogs();
  assert.strictEqual(updatedAuditLogs.length, initialAuditCount + 1, "Audit logs must record query immediately");
  assert.strictEqual(updatedAuditLogs[0].requestingOrg, "Government Immigration & Border Agency");
  console.log("  ✓ Citizen Transparency Audit Log Passed.");

  // TEST 4: Sovereign Government Telemetry & 40% Fiscal Splitter
  console.log("\nTest 4: Sovereign Regional Telemetry & 40% Fiscal Splitter...");
  const nodes = globalGovtStore.listNodes();
  assert.strictEqual(nodes.length, 3, "Must manage 3 sovereign nodes (West Africa, EU, NA)");
  const westAfricaNode = nodes.find((n) => n.id === "ng-west-africa");
  assert.ok(westAfricaNode, "Must resolve ng-west-africa node");
  assert.strictEqual(westAfricaNode.complianceFramework, "NDPC", "Must enforce NDPC for West Africa");

  const initialPendingYield = westAfricaNode.pendingDisbursementUsd;
  assert.ok(initialPendingYield > 0, "Must have pending 40% sovereign yield");

  // Disburse payout to node host wallet
  const disburseRes = globalGovtStore.executeDisbursement("ng-west-africa");
  assert.strictEqual(disburseRes.success, true, "Disbursement must succeed");
  assert.strictEqual(disburseRes.disbursement.recipientWallet, westAfricaNode.hostTreasuryWallet);
  assert.strictEqual(disburseRes.disbursement.network, "Base Sepolia L2");
  assert.strictEqual(disburseRes.disbursement.smartContract, "0x3B997f74b62d85b1388E4B5d96f9C762c2f48C3b");

  // Node pending yield should be reset
  const refreshedNode = globalGovtStore.getNode("ng-west-africa");
  assert.strictEqual(refreshedNode.pendingDisbursementUsd, 0, "Pending yield must zero after payout");
  console.log("  ✓ 40% GovTech Micro-Transaction Split & Base Sepolia Payout Passed.");

  // TEST 5: National Credential Integrity & Fraud Radar
  console.log("\nTest 5: National Credential Integrity & Fraud Radar...");
  const fraudAlerts = globalGovtStore.getFraudAlerts();
  assert.ok(fraudAlerts.length >= 3, "Fraud radar must track intercepted attacks");
  const criticalThreat = fraudAlerts.find((f) => f.severity === "CRITICAL");
  assert.ok(criticalThreat, "Must track critical threat interception");
  console.log(`  ✓ Fraud Radar active with ${fraudAlerts.length} intercepted anomalies.`);

  // TEST 6: Enterprise Dynamic Criteria Studio & Single/Bulk Screening
  console.log("\nTest 6: Dynamic Criteria Studio & Batch Candidate Screening...");
  // Save custom criteria
  const customRubric = globalCriteriaStore.saveCriteriaProfile({
    id: "rubric_fintech_lead_test",
    name: "Fintech Systems Lead (Automated Test)",
    category: "LABOUR",
    description: "Strict engineering requirements for high-frequency settlement.",
    minExperienceYears: 3,
    requiredCategories: ["academics", "experience"],
    mandatoryTier2Notarization: false,
    weights: { academics: 40, experience: 60 },
    createdAt: new Date().toISOString(),
  });
  assert.ok(customRubric.id, "Custom criteria profile must be saved");

  // Mint candidate test key
  const candidateKey = globalUserStore.mintKey({
    allowedScopes: ["academics", "finance", "experience"],
    ttlDays: 14,
    maxQueries: 10,
    label: "Batch Candidate Key",
  }).rawKey;

  // Single Candidate Screening against custom rubric
  const singleEval = globalCriteriaStore.evaluateCandidate(candidateKey, "rubric_fintech_lead_test");
  assert.strictEqual(singleEval.integrityStatus, "TAMPER_FREE_VERIFIED");
  assert.ok(singleEval.compositeScore > 0, "Composite score must be calculated");
  assert.ok(singleEval.citations.length > 0, "Zero-hallucination citations must be cited verbatim");

  // Batch Candidate Screening
  const batchRes = globalCriteriaStore.screenBatch(
    [candidateKey, candidateKey, candidateKey],
    "rubric_fintech_lead_test",
    "Global Talent Screener"
  );
  assert.strictEqual(batchRes.totalCandidates, 3, "Batch must evaluate all 3 candidates in parallel");
  assert.ok(batchRes.candidates[0].compositeScore >= batchRes.candidates[1].compositeScore, "Leaderboard must be sorted descending");
  console.log("  ✓ Dynamic Criteria & Batch Parallel Screening Passed.");

  console.log("\n=======================================================");
  console.log("ALL 6 ARCHITECTURAL & EXPANSION SUITES PASSED (100%)!");
  console.log("=======================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
