import assert from "assert";
import fs from "fs";
import path from "path";
import { verifyBotDefense } from "../src/lib/security/bot_defense.ts";

console.log("\n=======================================================");
console.log("SabiProfile: Bot Autofill Tolerance & Google Verification Suite");
console.log("=======================================================\n");

// [Test 1] Verify Honeypot Catches Actual Malicious Bots
console.log("[Test 1] Verifying Honeypot Catches Actual Malicious Bots...");
const botResult1 = verifyBotDefense({
  honeypot: "https://spam.bot.com",
  interactionTimeMs: 1200,
  mouseMovements: 0,
  keystrokes: 0,
});
assert.strictEqual(botResult1.isBot, true, "Malicious URL in honeypot must be flagged as bot");
assert.strictEqual(botResult1.reason, "Bot trap triggered (honeypot field filled).");

const botResult2 = verifyBotDefense({
  honeypot: "spam_token_payload",
  interactionTimeMs: 800,
  mouseMovements: 5,
  keystrokes: 10,
});
assert.strictEqual(botResult2.isBot, true, "Arbitrary spam in honeypot must be flagged as bot");
console.log("  ✓ Malicious bot honeypot payloads successfully rejected.");

// [Test 2] Verify Honeypot Tolerates Browser Autofill False-Positives
console.log("\n[Test 2] Verifying Browser Autofill Collision Tolerance...");
const humanAutofillDomain = verifyBotDefense({
  honeypot: "https://sabiprofile.com/login",
  interactionTimeMs: 1500,
  mouseMovements: 6,
  keystrokes: 12,
  currentHost: "sabiprofile.com",
  userEmail: "ekpouyouko@gmail.com",
});
assert.strictEqual(humanAutofillDomain.isBot, false, "Chrome domain autofill must NOT trigger bot defense");

const humanAutofillEmail = verifyBotDefense({
  honeypot: "ekpouyouko@gmail.com",
  interactionTimeMs: 1800,
  mouseMovements: 4,
  keystrokes: 14,
  userEmail: "ekpouyouko@gmail.com",
});
assert.strictEqual(humanAutofillEmail.isBot, false, "Browser email autofill duplication must NOT trigger bot defense");
console.log("  ✓ Real human browser autofill collisions safely bypassed.");

// [Test 3] Verify Form Honeypot Inputs Immune to Chrome Autofill
console.log("\n[Test 3] Verifying Form Honeypot Inputs in Login Views...");
const loginFormCode = fs.readFileSync(path.join(process.cwd(), "src", "components", "auth", "LoginForm.tsx"), "utf8");
assert(loginFormCode.includes('name="sabi_aux_chk"'), "LoginForm must not use 'website' or 'trap' in name");
assert(loginFormCode.includes('style={{ display: "none" }}'), "LoginForm honeypot must use display: none");
assert(loginFormCode.includes('data-lpignore="true"'), "LoginForm honeypot must ignore password managers");

const orgLoginCode = fs.readFileSync(path.join(process.cwd(), "src", "app", "login", "organization", "page.tsx"), "utf8");
assert(orgLoginCode.includes('name="sabi_org_aux_chk"'), "Org login must not use 'website' or 'trap' in name");
assert(orgLoginCode.includes('style={{ display: "none" }}'), "Org login honeypot must use display: none");
console.log("  ✓ Form honeypot inputs fully hardened against browser autofill.");

// [Test 4] Verify Google Site Verification Integration
console.log("\n[Test 4] Verifying Google Site Verification Integration...");
const layoutCode = fs.readFileSync(path.join(process.cwd(), "src", "app", "layout.tsx"), "utf8");
assert(layoutCode.includes("auth.google_site_verification"), "Root layout must read google site verification config");
assert(layoutCode.includes("verification:"), "Root layout must configure verification metadata");

const configCode = fs.readFileSync(path.join(process.cwd(), "src", "core", "config", "platform_config.ts"), "utf8");
assert(configCode.includes("auth.google_site_verification"), "platform_config must register google_site_verification key");
console.log("  ✓ Google Search Console site verification metadata successfully wired.");

// [Test 5] Verify Google Drive Scopes Hardened to drive.file
console.log("\n[Test 5] Verifying Google Drive Scopes...");
const connectRouteCode = fs.readFileSync(path.join(process.cwd(), "src", "app", "api", "v1", "integrations", "[provider]", "connect", "route.ts"), "utf8");
assert(connectRouteCode.includes("https://www.googleapis.com/auth/drive.file"), "Google Drive must use drive.file");
assert(!connectRouteCode.includes('"scope",\n      "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly"'), "Must not unconditionally request restricted drive.readonly scope");
console.log("  ✓ Google Drive scopes set to non-sensitive drive.file (avoiding CASA Tier-3 audits).");

console.log("\n=======================================================");
console.log("ALL 5 BOT AUTOFILL & GOOGLE VERIFICATION SUITES PASSED (100%)!");
console.log("=======================================================\n");

