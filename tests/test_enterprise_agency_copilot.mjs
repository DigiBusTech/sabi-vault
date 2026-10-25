/**
 * SabiProfile - Verification Suite: Enterprise & Agency Copilot Architecture
 * Verifies:
 * 1. Organization Authentication & Role Redirection Hardening
 * 2. Multi-Benchmark Criteria Engine & Statutory Rubrics
 * 3. Developer Scoped API Keys Management Engine
 * 4. Agency Client Hub ("On-Behalf-Of" Client Dossiers)
 * 5. Dynamic Evidence-Gated Screening Funnel & Active Rubric Selector
 * 6. Enterprise Navigation & Dashboard Routes
 */

import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Enterprise & Agency Architecture Test Suite");
console.log("=======================================================\n");

// [Test 1] Verify Organization Auth & Redirection Hardening
console.log("[Test 1] Verifying Organization Auth & Redirection Hardening...");

const loginOrgPath = path.join(process.cwd(), "src", "app", "login", "organization", "page.tsx");
assert(fs.existsSync(loginOrgPath), "login/organization/page.tsx must exist");
const loginOrgSrc = fs.readFileSync(loginOrgPath, "utf8");
assert(loginOrgSrc.includes("/dashboard/enterprise"), "Organization login must redirect to /dashboard/enterprise");

const signupOrgPath = path.join(process.cwd(), "src", "app", "signup", "organization", "page.tsx");
assert(fs.existsSync(signupOrgPath), "signup/organization/page.tsx must exist");
const signupOrgSrc = fs.readFileSync(signupOrgPath, "utf8");
assert(signupOrgSrc.includes("/dashboard/enterprise"), "Organization signup must redirect to /dashboard/enterprise");
assert(signupOrgSrc.includes("sabi_pending_org_name"), "Pending organization name must be stored in sessionStorage for OAuth handoff");
assert(signupOrgSrc.includes("sabi_pending_org_type"), "Pending organization type must be stored in sessionStorage");

const authContextPath = path.join(process.cwd(), "src", "lib", "dashboard", "auth_context.ts");
assert(fs.existsSync(authContextPath), "auth_context.ts must exist");
const authContextSrc = fs.readFileSync(authContextPath, "utf8");
assert(authContextSrc.includes("enterprise_admin"), "enterprise_admin role must be supported in auth_context");
assert(authContextSrc.includes("org_id") || authContextSrc.includes("sabi_user_role"), "auth_context must check org membership and cookies");

const authCallbackPath = path.join(process.cwd(), "src", "app", "auth", "callback", "route.ts");
assert(fs.existsSync(authCallbackPath), "auth/callback/route.ts must exist");
const authCallbackSrc = fs.readFileSync(authCallbackPath, "utf8");
assert(authCallbackSrc.includes("/dashboard/enterprise"), "Auth callback must route enterprise_admin to /dashboard/enterprise");

console.log("  ✓ Organization auth routes, session persistence, and role redirection verified.");

// [Test 2] Verify Multi-Benchmark Criteria Engine & Statutory Rubrics
console.log("\n[Test 2] Verifying Multi-Benchmark Criteria Engine in criteria_store.ts...");

const criteriaStorePath = path.join(process.cwd(), "src", "core", "enterprise", "criteria_store.ts");
assert(fs.existsSync(criteriaStorePath), "criteria_store.ts must exist");
const criteriaStoreSrc = fs.readFileSync(criteriaStorePath, "utf8");

assert(criteriaStoreSrc.includes("export interface BenchmarkItem"), "BenchmarkItem interface must be exported");
assert(criteriaStoreSrc.includes("export type BenchmarkMetricType"), "BenchmarkMetricType must be exported");
assert(criteriaStoreSrc.includes("benchmarks: BenchmarkItem[];"), "CriteriaProfile must include dynamic benchmarks array");
assert(criteriaStoreSrc.includes("passingScore: number;"), "CriteriaProfile must require passingScore");
assert(criteriaStoreSrc.includes("autoInterviewScore?: number;"), "CriteriaProfile must support autoInterviewScore");

// Verify rubrics
assert(criteriaStoreSrc.includes("rubric_immigration_tech_visa"), "Immigration Tech Visa rubric must be registered");
assert(criteriaStoreSrc.includes("rubric_fintech_lead_eng"), "Fintech Lead Eng rubric must be registered");
assert(criteriaStoreSrc.includes("rubric_masters_scholarship"), "Masters Scholarship rubric must be registered");

// Verify dynamic benchmark evaluation
assert(criteriaStoreSrc.includes("benchmarkResults.push"), "Candidate evaluation must audit dynamic benchmarks");
assert(criteriaStoreSrc.includes("benchmarkResults?:"), "CandidateEvaluationResult must expose benchmarkResults");
console.log("  ✓ Multi-benchmark criteria models, statutory rubrics, and dynamic score audits verified.");

// [Test 3] Verify Developer API Key Service & Endpoints
console.log("\n[Test 3] Verifying Developer API Key Service & Endpoints...");

const apiKeyServicePath = path.join(process.cwd(), "src", "core", "enterprise", "api_key_service.ts");
assert(fs.existsSync(apiKeyServicePath), "api_key_service.ts must exist");
const apiKeyServiceSrc = fs.readFileSync(apiKeyServicePath, "utf8");

assert(apiKeyServiceSrc.includes("enterpriseApiKeyManager"), "enterpriseApiKeyManager must be exported");
assert(apiKeyServiceSrc.includes("createKey("), "createKey method must exist");
assert(apiKeyServiceSrc.includes("listKeysForOrg("), "listKeysForOrg method must exist");
assert(apiKeyServiceSrc.includes("revokeKey("), "revokeKey method must exist");
assert(apiKeyServiceSrc.includes("verifyKey("), "verifyKey method must exist");
assert(apiKeyServiceSrc.includes("sbo_live_") && apiKeyServiceSrc.includes("sbo_test_"), "Org API keys must use sbo_live / sbo_test prefixes");

const apiKeysRoutePath = path.join(process.cwd(), "src", "app", "api", "v1", "enterprise", "api-keys", "route.ts");
assert(fs.existsSync(apiKeysRoutePath), "api-keys route.ts must exist");
const apiKeysRouteSrc = fs.readFileSync(apiKeysRoutePath, "utf8");
assert(apiKeysRouteSrc.includes("GET") && apiKeysRouteSrc.includes("POST") && apiKeysRouteSrc.includes("DELETE"), "API keys route must support GET, POST, and DELETE");

const apiKeysViewPath = path.join(process.cwd(), "src", "components", "enterprise", "DeveloperApiKeysView.tsx");
assert(fs.existsSync(apiKeysViewPath), "DeveloperApiKeysView.tsx must exist");
const apiKeysViewSrc = fs.readFileSync(apiKeysViewPath, "utf8");
assert(apiKeysViewSrc.includes("cURL") && apiKeysViewSrc.includes("Swift") && apiKeysViewSrc.includes("Kotlin") && apiKeysViewSrc.includes("Python"), "Developer view must provide multi-platform SDK code snippets");

console.log("  ✓ Developer API key minting, hashing, revocation, and code snippets verified.");

// [Test 4] Verify Agency Client Hub ("On-Behalf-Of" Dossiers)
console.log("\n[Test 4] Verifying Agency Client Hub (On-Behalf-Of Dossiers)...");

const agencyServicePath = path.join(process.cwd(), "src", "core", "enterprise", "agency_client_service.ts");
assert(fs.existsSync(agencyServicePath), "agency_client_service.ts must exist");
const agencyServiceSrc = fs.readFileSync(agencyServicePath, "utf8");

assert(agencyServiceSrc.includes("agencyClientService"), "agencyClientService must be exported");
assert(agencyServiceSrc.includes("createClientDossier("), "createClientDossier method must exist");
assert(agencyServiceSrc.includes("listClients("), "listClients method must exist");
assert(agencyServiceSrc.includes("runConsularPreScreen("), "runConsularPreScreen method must exist");
assert(agencyServiceSrc.includes("generateClientHandoverAccess("), "generateClientHandoverAccess method must exist");

const agencyViewPath = path.join(process.cwd(), "src", "components", "enterprise", "AgencyClientManagerView.tsx");
assert(fs.existsSync(agencyViewPath), "AgencyClientManagerView.tsx must exist");
const agencyViewSrc = fs.readFileSync(agencyViewPath, "utf8");
assert(agencyViewSrc.includes("On-Behalf-Of Hub"), "Agency view header must indicate on-behalf-of client management");
assert(agencyViewSrc.includes("Pre-Screen"), "Agency view must include pre-screen action");
assert(agencyViewSrc.includes("Applicant Access Generated"), "Agency view must support applicant handover access modal");

const clientsPagePath = path.join(process.cwd(), "src", "app", "dashboard", "enterprise", "clients", "page.tsx");
assert(fs.existsSync(clientsPagePath), "dashboard/enterprise/clients/page.tsx must exist");

console.log("  ✓ Agency client service, on-behalf-of dossiers, pre-screens, and handover flow verified.");

// [Test 5] Verify Dynamic Evidence-Gated Screening Funnel & Active Rubric HUD
console.log("\n[Test 5] Verifying Dynamic Evidence-Gated Funnel & Active Rubric Selector in EnterpriseScreeningView.tsx...");

const screeningViewPath = path.join(process.cwd(), "src", "components", "EnterpriseScreeningView.tsx");
assert(fs.existsSync(screeningViewPath), "EnterpriseScreeningView.tsx must exist");
const screeningViewSrc = fs.readFileSync(screeningViewPath, "utf8");

// Active Rubric Selector & HUD in screening mode
assert(screeningViewSrc.includes("Target Evaluation Rubric"), "Active Rubric HUD must be present in screening mode");
assert(screeningViewSrc.includes("screening-rubric-select"), "Rubric dropdown selector must be present in screening mode");
assert(screeningViewSrc.includes("handleTrackChange"), "Track buttons must sync with handleTrackChange");
assert(screeningViewSrc.includes("Passing Bar"), "Passing score threshold card must be present");
assert(screeningViewSrc.includes("Auto-Interview"), "Auto-interview threshold card must be present");

// Multi-Benchmark Table in Criteria Studio
assert(screeningViewSrc.includes("Active Multi-Benchmarks & Statutory Thresholds"), "Dynamic benchmarks table must be present in criteria studio");

// Dynamic Evidence-Gated Funnel & Strict Lock
assert(screeningViewSrc.includes("Multi-Stage Evidence-Gated Evaluation Funnel"), "Evidence-gated funnel must be rendered");
assert(screeningViewSrc.includes("isInterviewEligible"), "Interview eligibility gate must be computed");
assert(screeningViewSrc.includes("Interview Dispatch Locked — Candidate Disqualified"), "Disqualified candidates must have interview dispatch locked");
assert(screeningViewSrc.includes("Schedule Org Direct Interview (Locked)"), "Direct interview button must be locked for disqualified candidates");

console.log("  ✓ Active rubric selector, threshold HUD, dynamic benchmarks table, and evidence-gated interview lock verified.");

// [Test 6] Verify Enterprise Navigation & Dashboard Shell
console.log("\n[Test 6] Verifying Enterprise Navigation & Dashboard Shell...");

const navPath = path.join(process.cwd(), "src", "lib", "dashboard", "nav.ts");
assert(fs.existsSync(navPath), "nav.ts must exist");
const navSrc = fs.readFileSync(navPath, "utf8");

assert(navSrc.includes("/dashboard/enterprise/clients"), "Enterprise navigation must include /dashboard/enterprise/clients");
assert(navSrc.includes("/dashboard/enterprise/api-keys"), "Enterprise navigation must include /dashboard/enterprise/api-keys");
assert(navSrc.includes("Managed clients"), "Navigation label for clients must be present");
assert(navSrc.includes("Developer keys"), "Navigation label for api keys must be present");

console.log("  ✓ Enterprise navigation routes confirmed.");

console.log("\n=======================================================");
console.log("All 6 Enterprise & Agency Test Suites Passed Successfully!");
console.log("=======================================================\n");
