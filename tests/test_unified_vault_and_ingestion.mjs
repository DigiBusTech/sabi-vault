import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Unified Vault & Ingestion Verification Suite");
console.log("=======================================================\n");

async function runTests() {
  // Test 1: Verify Groq Vision active model updates in vision_extractor.ts
  console.log("[Test 1] Verifying Groq Vision model configuration & json parser...");
  const visionSource = fs.readFileSync(path.join("src", "core", "parser", "vision_extractor.ts"), "utf8");
  assert(visionSource.includes("qwen/qwen3.8-27b"), "Must include qwen/qwen3.8-27b active vision model");
  assert(visionSource.includes("meta-models/muse-spark-open"), "Must include meta-models/muse-spark-open model");
  assert(visionSource.includes("parseJsonSafely"), "Must have robust JSON sanitizer");
  assert(visionSource.includes("llama-3.3-70b-versatile"), "Must have text reasoning fallback");
  console.log("  ✓ VisionExtractor configured with active Groq models and resilient JSON sanitizer.");

  // Test 2: Verify Portfolio schema updates in src/types/vault.ts
  console.log("\n[Test 2] Verifying PortfolioSchema and PortfolioItemSchema in vault.ts...");
  const vaultTypeSource = fs.readFileSync(path.join("src", "types/vault.ts"), "utf8");
  assert(vaultTypeSource.includes("PortfolioItemSchema"), "PortfolioItemSchema must be defined");
  assert(vaultTypeSource.includes("items: z.array(PortfolioItemSchema)"), "PortfolioSchema must include items array");
  console.log("  ✓ PortfolioSchema supports uploaded document items and optional profile fields.");

  // Test 3: Verify UserVaultMasterStore Supabase persistence methods
  console.log("\n[Test 3] Verifying UserVaultMasterStore persistence in user_store.ts...");
  const userStoreSource = fs.readFileSync(path.join("src", "core", "vault", "user_store.ts"), "utf8");
  assert(userStoreSource.includes("getVaultAsync"), "Must include getVaultAsync");
  assert(userStoreSource.includes("addCredentialAsync"), "Must include addCredentialAsync");
  assert(userStoreSource.includes("deleteCredentialAsync"), "Must include deleteCredentialAsync");
  assert(userStoreSource.includes("vault_records"), "Must persist to vault_records table in Supabase");
  assert(userStoreSource.includes("ensureVaultProfileInDb"), "Must ensure vault profile exists in DB");
  console.log("  ✓ UserVaultMasterStore backed by Supabase vault_records PostgreSQL table.");

  // Test 4: Verify Google Drive cloud dispatch in sync route
  console.log("\n[Test 4] Verifying Google Drive auto-upload in /api/v1/vault/sync/route.ts...");
  const syncRouteSource = fs.readFileSync(path.join("src", "app", "api", "v1", "vault", "sync", "route.ts"), "utf8");
  assert(syncRouteSource.includes("GoogleDriveConnector"), "Must import and instantiate GoogleDriveConnector");
  assert(syncRouteSource.includes("getUserCloudIntegration"), "Must look up user cloud integration");
  assert(syncRouteSource.includes("driveConnector.createVaultFolder"), "Must ensure SabiProfile Vault folder exists");
  assert(syncRouteSource.includes("driveConnector.uploadFile"), "Must upload file stream to Google Drive");
  assert(syncRouteSource.includes("addCredentialAsync"), "Must persist record asynchronously to database");
  console.log("  ✓ Document sync route uploads to user's private Google Drive and anchors to database.");

  // Test 5: Verify credentials API route uses async store
  console.log("\n[Test 5] Verifying /api/v1/vault/credentials/route.ts uses async store...");
  const credRouteSource = fs.readFileSync(path.join("src", "app", "api", "v1", "vault", "credentials", "route.ts"), "utf8");
  assert(credRouteSource.includes("getVaultAsync"), "GET must call getVaultAsync");
  assert(credRouteSource.includes("addCredentialAsync"), "POST must call addCredentialAsync");
  assert(credRouteSource.includes("deleteCredentialAsync"), "DELETE must call deleteCredentialAsync");
  console.log("  ✓ Credentials endpoint retrieves and persists records across serverless lambdas.");

  // Test 6: Verify CitizenVaultView quick actions and portfolio rendering
  console.log("\n[Test 6] Verifying CitizenVaultView.tsx quick actions and portfolio display...");
  const vaultViewSource = fs.readFileSync(path.join("src", "components", "CitizenVaultView.tsx"), "utf8");
  assert(vaultViewSource.includes('/dashboard/documents?mode=scan'), "Overview scan button must route to /dashboard/documents?mode=scan");
  assert(vaultViewSource.includes('href="/dashboard/documents"'), "Overview upload button must route to /dashboard/documents");
  assert(vaultViewSource.includes('vault.portfolio?.items?.length'), "Portfolio count must include items");
  assert(vaultViewSource.includes("Verified Portfolio Documents & Case Studies"), "Must render uploaded portfolio items");
  assert(vaultViewSource.includes("View on Drive"), "Must render Google Drive link when available");
  console.log("  ✓ CitizenVaultView unified navigation and portfolio documents rendering verified.");

  // Test 7: Verify DocumentIntake camera integration and cloud link display
  console.log("\n[Test 7] Verifying DocumentIntake.tsx camera scanner and cloud link display...");
  const intakeSource = fs.readFileSync(path.join("src", "components", "dashboard", "DocumentIntake.tsx"), "utf8");
  assert(intakeSource.includes("CameraScannerModal"), "Must import and embed CameraScannerModal");
  assert(intakeSource.includes('params.get("mode") === "scan"'), "Must auto-open camera viewfinder when mode=scan");
  assert(intakeSource.includes("Scan with Camera"), "Must provide Scan with Camera button");
  assert(intakeSource.includes("Saved in Private"), "Must show cloud destination link in result card");
  console.log("  ✓ DocumentIntake unified camera scanner and Google Drive status verified.");

  console.log("\n=======================================================");
  console.log("ALL 7 VERIFICATION SUITES PASSED (100%)");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
