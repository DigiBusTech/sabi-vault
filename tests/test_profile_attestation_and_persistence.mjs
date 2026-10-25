import assert from "assert";
import { globalCriteriaStore } from "../src/core/enterprise/criteria_store.ts";
import { globalUserStore } from "../src/core/vault/user_store.ts";
import { profileAndAdvisorStore } from "../src/core/vault/profile_store.ts";

async function runTestSuite() {
  console.log("=== STARTING SABIPROFILE ENTERPRISE SCREENING & PERSISTENCE TEST SUITE ===");

  const testUserId = "usr_chinwe_okafor_7721";

  // 1. Test Profile Hydration & Declared Claims
  console.log("\n[Test 1] Verifying Candidate Profile Hydration...");
  const profile = await profileAndAdvisorStore.getProfile(testUserId);
  assert(profile, "Candidate profile must exist for Chinwe Okafor");
  assert(profile.workExperiences && profile.workExperiences.length > 0, "Profile should have work experiences");
  assert(profile.skills && profile.skills.length > 0, "Profile should have technical skills");
  console.log(`✓ Profile loaded: ${profile.fullName} with ${profile.workExperiences.length} work experience items and ${profile.skills.length} skills.`);

  // 2. Test Scoped Key Generation & Persistence via mintKeyAsync
  console.log("\n[Test 2] Testing Scoped Key Minting and Async Persistence...");
  const mintedRecord = await globalUserStore.mintKeyAsync({
    userId: testUserId,
    allowedScopes: ["academics", "experience", "finance"],
    ttlDays: 7,
    maxQueries: 50,
    label: "Consular & Enterprise Screen Test Key",
  });
  assert(mintedRecord && mintedRecord.rawKey, "Minted record must contain rawKey");
  assert(mintedRecord.keyId, "Minted record must contain keyId");

  const userKeys = await globalUserStore.listKeysAsync(testUserId);
  assert(userKeys.some((k) => k.keyId === mintedRecord.keyId), "Minted key must be retrievable via listKeysAsync");
  console.log(`✓ Scoped key persisted and retrieved across storage layer. Active keys count: ${userKeys.length}`);

  const scopedKey = mintedRecord.rawKey;

  // 3. Test Evaluation on Clean Vault (No False-Positive TAMPER_DETECTED)
  console.log("\n[Test 3] Testing Candidate Evaluation on Clean Vault (False-Tamper Protection)...");
  const evalResult = await globalCriteriaStore.evaluateCandidate(
    scopedKey,
    "rubric_immigration_tech_visa",
    "Consular & Enterprise Audit Division"
  );

  assert.notStrictEqual(
    evalResult.integrityStatus,
    "TAMPER_DETECTED",
    "Clean vault must NOT be falsely marked TAMPER_DETECTED"
  );
  console.log(`✓ Integrity Status verified: ${evalResult.integrityStatus} (No false positives on clean vault)`);
  console.log(`✓ Composite Score: ${evalResult.compositeScore}/100 | Verdict: ${evalResult.verdict}`);

  // 4. Test Cross-Referencing Human Profile Claims vs Hashed Vault
  console.log("\n[Test 4] Verifying Claim-vs-Attestation Matrix Citations...");
  const hasAttestedOrUnattestedExp = evalResult.citations.some(
    (c) => c.includes("✓ Attested Work Experience") || c.includes("⚠️ Unattested Employment Claim")
  );
  assert(hasAttestedOrUnattestedExp, "Evaluation citations must cross-reference work experience");

  const hasSkillsOrLanguageCitation = evalResult.citations.some(
    (c) => c.includes("Candidate Profile Technical Matrix") || c.includes("Language Competencies")
  );
  assert(hasSkillsOrLanguageCitation, "Evaluation citations must index profile technical matrix or languages");
  console.log("✓ Claim-vs-Attestation Matrix Verified in Citations:");
  evalResult.citations.forEach((c) => console.log(`   - ${c}`));

  // 5. Test Audit Trail Async Recording & Retrieval
  console.log("\n[Test 5] Verifying Institutional Query Audit Logging...");
  const auditLogs = await globalUserStore.getAuditLogsAsync(testUserId);
  assert(auditLogs.length > 0, "Audit logs must contain recorded queries");
  const latestLog = auditLogs[0];
  assert.strictEqual(latestLog.orgType, "ENTERPRISE", "Audit log orgType must be ENTERPRISE");
  console.log(`✓ Audit log verified: Query by '${latestLog.requestingOrg}' recorded at ${latestLog.timestamp}. Total logs: ${auditLogs.length}`);

  // 6. Test Multi-Sector Rubrics & Dynamic Benchmarks
  console.log("\n[Test 6] Testing Multi-Sector Rubric Profiles...");
  const allProfiles = globalCriteriaStore.listProfiles();
  const categories = new Set(allProfiles.map((p) => p.category));
  assert(categories.has("IMMIGRATION"), "IMMIGRATION rubric must exist");
  assert(categories.has("LABOUR"), "LABOUR rubric must exist");
  assert(categories.has("EDUCATION"), "EDUCATION rubric must exist");
  assert(categories.has("FINANCE"), "FINANCE rubric must exist");
  assert(categories.has("HEALTHCARE"), "HEALTHCARE rubric must exist");
  assert(categories.has("LEGAL"), "LEGAL rubric must exist");
  console.log(`✓ All 6 sovereign sector verticals present across ${allProfiles.length} loaded rubrics.`);

  // Evaluate candidate against FinTech compliance rubric
  const finResult = await globalCriteriaStore.evaluateCandidate(
    scopedKey,
    "rubric_fintech_compliance_aml",
    "Apex Clearinghouse"
  );
  assert(finResult.benchmarkResults && finResult.benchmarkResults.length > 0, "Fintech rubric must yield benchmark results");
  console.log(`✓ Banking & FinTech dynamic benchmarks executed: ${finResult.benchmarkResults.length} benchmark rules evaluated.`);
  finResult.benchmarkResults.forEach((bm) => {
    console.log(`   [${bm.passed ? "PASS" : "FAIL"}] ${bm.name} (${bm.importance}): ${bm.message}`);
  });

  console.log("\n=== ALL 6 ENTERPRISE & CITIZEN INTEGRATION TESTS PASSED 100% ===");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
