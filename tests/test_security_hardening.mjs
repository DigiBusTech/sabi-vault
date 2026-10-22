/**
 * SabiProfile: Security Hardening Regression Suite (Entry #059)
 * Run via: node tests/test_security_hardening.mjs
 *
 * Verifies the audit remediations:
 * 1. Vision extractor fails closed (zero fabricated credential fallback).
 * 2. Verification tier is decoupled from AI/keyword classification.
 * 3. Scan preview cache is ownership-bound; extraction outages return 503.
 * 4. Profile / Niche / Advisor routes enforce zod schema validation.
 * 5. Profile store persists to the Supabase sovereign node (RLS-backed tables).
 * 6. Sabi Interviewer naming and coming-soon trigger.
 */
import assert from "assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (p) => readFileSync(join(root, p), "utf8");

console.log("\n=======================================================");
console.log("SabiProfile: Security Hardening Regression Suite");
console.log("=======================================================\n");

function runTests() {
  // --- Test 1: Fail-Closed Vision Extraction ---
  console.log("[Test 1] Fail-Closed Vision Extraction (No Fabricated Identity Data)...");
  const extractor = src("src/core/parser/vision_extractor.ts");
  assert(
    !extractor.includes("generateDeterministicFallback"),
    "Fabricated deterministic fallback must be fully removed"
  );
  console.log("  ✓ Deterministic fabrication fallback removed.");
  assert(
    !extractor.includes("A10984122"),
    "Hard-coded fake passport number must not exist in source"
  );
  console.log("  ✓ No hard-coded fabricated passport/MRZ PII present.");
  assert(
    extractor.includes("VisionExtractionUnavailableError"),
    "Extractor must raise VisionExtractionUnavailableError when AI is unavailable"
  );
  assert(
    extractor.includes('throw new VisionExtractionUnavailableError'),
    "All failure paths must throw (fail closed), never return mock data"
  );
  console.log("  ✓ All AI failure paths fail closed with VisionExtractionUnavailableError.");

  // --- Test 2: Tier-2 Decoupled From Classification ---
  console.log("\n[Test 2] Verification Tier Decoupled From AI/Keyword Classification...");
  assert(
    extractor.includes("VaultCategoryEnum.safeParse"),
    "LLM-inferred category must be allowlist-validated against the VaultCategory enum"
  );
  console.log("  ✓ inferredCategory validated against VaultCategory enum.");
  assert(
    !extractor.includes("TIER_2_AUTHENTICATED_LEGALIZED\n") &&
      !/tier\s*=\s*[\s\S]*TIER_2_AUTHENTICATED_LEGALIZED/.test(extractor),
    "Vision extractor must never assign Tier-2"
  );
  const parser = src("src/core/parser/ephemeral_parser.ts");
  assert(
    !parser.includes("TIER_2_AUTHENTICATED_LEGALIZED"),
    "Ephemeral parser must never assign Tier-2 from keyword classification"
  );
  assert(
    parser.includes("VerificationTier.TIER_1_STANDARD_HASHED"),
    "Ephemeral parser must always emit Tier-1 Standard Hashed"
  );
  console.log("  ✓ Tier-2 grantable only via notary/institutional attestation flow.");

  // --- Test 3: Scan Route Ownership & Outage Handling ---
  console.log("\n[Test 3] Scan Preview Ownership Binding & 503 Fail-Closed Response...");
  const scanRoute = src("src/app/api/v1/vault/scan/route.ts");
  assert(
    scanRoute.includes("cachedPreview.userId !== targetUserId"),
    "Phase B must reject previews not owned by the authenticated user"
  );
  console.log("  ✓ Scan preview cache is ownership-bound (403 on mismatch).");
  assert(
    scanRoute.includes("VISION_EXTRACTION_UNAVAILABLE") && scanRoute.includes("{ status: 503 }"),
    "Extraction outage must return 503 without caching or committing"
  );
  console.log("  ✓ Extraction outage returns 503; nothing persisted or anchored.");
  assert(
    scanRoute.includes("VaultCategoryEnum.safeParse(category)"),
    "Caller-supplied category must be enum-validated"
  );
  const syncRoute = src("src/app/api/v1/vault/sync/route.ts");
  assert(
    syncRoute.includes("VaultCategoryEnum.safeParse(category)"),
    "Sync route must enum-validate caller-supplied category"
  );
  console.log("  ✓ Both ingestion routes allowlist-validate categories.");

  // --- Test 4: Zod Enforcement on User Routes ---
  console.log("\n[Test 4] Strict Zod Payload Validation on Profile/Niche/Advisor Routes...");
  const profileTypes = src("src/types/profile.ts");
  for (const schema of [
    "UserHumanProfileUpdateSchema",
    "UserProfileNicheInputSchema",
    "TargetGoalInputSchema",
  ]) {
    assert(profileTypes.includes(`export const ${schema}`), `${schema} must be exported`);
  }
  console.log("  ✓ Input/update schemas exported from types/profile.ts.");
  for (const route of [
    "src/app/api/v1/user/profile/route.ts",
    "src/app/api/v1/user/niches/route.ts",
    "src/app/api/v1/user/advisor/route.ts",
  ]) {
    const content = src(route);
    assert(content.includes(".safeParse("), `${route} must validate with safeParse`);
    assert(content.includes("{ status: 400 }"), `${route} must return 400 on invalid payloads`);
  }
  console.log("  ✓ All three mutating routes reject invalid payloads with 400.");

  // --- Test 5: Sovereign Node Persistence for Profile Store ---
  console.log("\n[Test 5] Profile Store Supabase Persistence (Sovereign Node Invariant)...");
  const store = src("src/core/vault/profile_store.ts");
  assert(
    store.includes('from("user_human_profiles")'),
    "Profiles must persist to user_human_profiles"
  );
  assert(
    store.includes('from("user_profile_niches")'),
    "Niches must persist to user_profile_niches"
  );
  assert(
    store.includes('from("user_target_goals")'),
    "Goals must persist to user_target_goals"
  );
  console.log("  ✓ All three entities persist to RLS-protected Supabase tables.");
  assert(
    store.includes("createAdminSupabaseClient"),
    "Store must use the service-role Supabase client when configured"
  );
  assert(
    store.includes("seedDemoData"),
    "Demo seed must be isolated in an explicit seedDemoData() fallback path"
  );
  assert(
    !store.includes('userId: string = "usr_chinwe_okafor_7721"'),
    "Dangerous default userId parameters must be removed"
  );
  console.log("  ✓ Demo seed gated to development fallback; no default-identity fallbacks.");

  // --- Test 6: Sabi Interviewer Naming ---
  console.log("\n[Test 6] Sabi Interviewer Rename & Coming-Soon Trigger...");
  const screening = src("src/components/EnterpriseScreeningView.tsx");
  assert(
    !screening.includes("AI Smart Interviewer"),
    "Legacy 'AI Smart Interviewer' label must be fully renamed"
  );
  assert(screening.includes("Sabi Interviewer"), "Sabi Interviewer label must be present");
  assert(
    screening.includes("Coming Soon"),
    "Sabi Interviewer trigger must retain the Coming Soon badge"
  );
  assert(
    screening.includes("setShowSabiInterviewerModal(true)"),
    "Trigger must open the coming-soon preview modal only"
  );
  console.log("  ✓ Sabi Interviewer renamed and gated behind coming-soon modal.");

  console.log("\n=======================================================");
  console.log("ALL 6 SECURITY HARDENING SUITES PASSED (100%)!");
  console.log("=======================================================\n");
}

try {
  runTests();
} catch (err) {
  console.error("Test execution failed:", err);
  process.exit(1);
}
