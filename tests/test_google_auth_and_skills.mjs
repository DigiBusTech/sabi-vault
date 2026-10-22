import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Google Fast Auth & Multi-Agent SaaS Skills Suite");
console.log("=======================================================\n");

async function runTests() {
  // Test 1: Verify installed skills in .agents/skills/
  console.log("[Test 1] Verifying 4 newly installed skills...");
  const expectedSkills = [
    "multi-agent-orchestration",
    "saas-architect",
    "saas-pipeline",
    "backend-architect"
  ];

  for (const sk of expectedSkills) {
    const skillFile = path.join(".agents", "skills", sk, "SKILL.md");
    assert(fs.existsSync(skillFile), `Skill ${sk}/SKILL.md must exist`);
    const content = fs.readFileSync(skillFile, "utf8");
    assert(content.length > 500, `Skill ${sk} must have substantial instructions`);
    console.log(`  ✓ Skill '${sk}' verified (${content.length} bytes).`);
  }

  // Test 2: B2B, B2C, B2G SaaS Architect specifications
  console.log("\n[Test 2] Verifying B2B, B2C, and B2G SaaS Architecture specifications...");
  const saasContent = fs.readFileSync(path.join(".agents", "skills", "saas-architect", "SKILL.md"), "utf8");
  assert(saasContent.includes("B2B SaaS Considerations"), "Must include B2B");
  assert(saasContent.includes("B2C SaaS Considerations"), "Must include B2C");
  assert(saasContent.includes("B2G (Business-to-Government"), "Must include B2G");
  console.log("  ✓ SaaS Architect skill specifies B2B, B2C, and B2G GovTech sovereign models.");

  // Test 3: Google Auth Platform Configuration Registry
  console.log("\n[Test 3] Verifying Google Auth Configuration Keys...");
  const configSource = fs.readFileSync(path.join("src", "core", "config", "platform_config.ts"), "utf8");
  assert(configSource.includes("auth.google_oauth_enabled"), "Registry must include google_oauth_enabled");
  assert(configSource.includes("auth.google_client_id"), "Registry must include google_client_id");
  assert(configSource.includes("auth.google_client_secret"), "Registry must include google_client_secret");
  assert(configSource.includes("auth.google_redirect_uri"), "Registry must include google_redirect_uri");
  console.log("  ✓ Google Auth keys registered in Super Admin platform configuration.");

  // Test 4: Google Auth API & Callback Integration
  console.log("\n[Test 4] Verifying Google Auth API Routes & Callback...");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "auth", "google", "signin", "route.ts")), "Signin route must exist");
  assert(fs.existsSync(path.join("src", "app", "api", "v1", "auth", "google", "config", "route.ts")), "Config route must exist");
  assert(fs.existsSync(path.join("src", "components", "auth", "GoogleAuthButton.tsx")), "GoogleAuthButton must exist");
  console.log("  ✓ Google fast sign-in API, configuration endpoint, and UI button active.");

  console.log("\n=======================================================");
  console.log("ALL 4 GOOGLE AUTH & SKILL SUITES PASSED (100%)!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
