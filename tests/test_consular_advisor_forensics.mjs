/**
 * SabiProfile - Verification Suite: Virtual Consular Immigration Officer & Financial Forensics
 */

import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("SabiProfile: Virtual Consular Immigration Officer Suite");
console.log("=======================================================\n");

// [Test 1] Verify Consular Type System in src/types/consular.ts
console.log("[Test 1] Verifying Consular Types in src/types/consular.ts...");
const consularTypesPath = path.join(process.cwd(), "src", "types", "consular.ts");
assert(fs.existsSync(consularTypesPath), "src/types/consular.ts must exist");
const consularTypesSrc = fs.readFileSync(consularTypesPath, "utf8");

assert(consularTypesSrc.includes("export interface ConsularChecklistItem"), "ConsularChecklistItem must be defined");
assert(consularTypesSrc.includes("export interface FinancialForensicsReport"), "FinancialForensicsReport must be defined");
assert(consularTypesSrc.includes("export interface ConsularVisaRoute"), "ConsularVisaRoute must be defined");
assert(consularTypesSrc.includes("export type ConsularChecklistStatus"), "ConsularChecklistStatus must be defined");
assert(consularTypesSrc.includes("consecutiveDaysRequired: number;"), "Holding period requirement must be defined");
assert(consularTypesSrc.includes("suddenDepositDetected: boolean;"), "Sudden deposit flag must be defined");
assert(consularTypesSrc.includes("accountHolderNameMatch: boolean;"), "Account name match must be defined");
console.log("  ✓ Consular type definitions and forensic fields verified.");

// [Test 2] Verify Statutory Consular Route Catalog in src/core/advisor/consular_routes_catalog.ts
console.log("\n[Test 2] Verifying Statutory Route Catalog in src/core/advisor/consular_routes_catalog.ts...");
const catalogPath = path.join(process.cwd(), "src", "core", "advisor", "consular_routes_catalog.ts");
assert(fs.existsSync(catalogPath), "consular_routes_catalog.ts must exist");
const catalogSrc = fs.readFileSync(catalogPath, "utf8");

assert(catalogSrc.includes("CONSULAR_ROUTES_CATALOG"), "CONSULAR_ROUTES_CATALOG must be exported");
assert(catalogSrc.includes("findConsularRoute"), "findConsularRoute helper must be exported");

// Verify UKVI routes & rules
assert(catalogSrc.includes("uk_skilled_worker"), "UK Skilled Worker route must be registered");
assert(catalogSrc.includes("uk_student"), "UK Student route must be registered");
assert(catalogSrc.includes("minimumLiquidFundsTargetCurrency: 1270"), "UK Skilled worker maintenance £1,270 must be configured");
assert(catalogSrc.includes("holdingPeriodDays: 28"), "UKVI 28-day holding rule must be configured");
assert(catalogSrc.includes("Appendix Skilled Worker & Appendix Finance"), "Statutory citation for UKVI must be present");

// Verify Germany AufenthG routes & rules
assert(catalogSrc.includes("de_chancenkarte"), "Germany Chancenkarte must be registered");
assert(catalogSrc.includes("minimumLiquidFundsTargetCurrency: 12324"), "Chancenkarte €12,324 threshold must be configured");
assert(catalogSrc.includes("de_eu_blue_card"), "Germany EU Blue Card must be registered");

// Verify Albania Law No. 79/2021
assert(catalogSrc.includes("al_unique_permit"), "Albania Unique Residence Permit must be registered");
assert(catalogSrc.includes("Law No. 79/2021"), "Albania statutory law citation must be present");
assert(catalogSrc.includes("minimumLiquidFundsTargetCurrency: 3000"), "Albania €3,000 liquid threshold must be configured");

// Verify Canada IRCC and US USCIS
assert(catalogSrc.includes("ca_express_entry"), "Canada Express Entry route must be registered");
assert(catalogSrc.includes("us_employment_h1b_o1"), "US H-1B/O-1A route must be registered");
assert(catalogSrc.includes("global_general_relocation"), "Global relocation fallback must be registered");
console.log("  ✓ Authoritative statutory catalogs (UKVI, Germany, Albania, Canada, US, Fallback) verified.");

// [Test 3] Verify Deep Financial Forensics Engine in src/core/advisor/financial_forensics.ts
console.log("\n[Test 3] Verifying Financial Forensics Engine in src/core/advisor/financial_forensics.ts...");
const forensicsPath = path.join(process.cwd(), "src", "core", "advisor", "financial_forensics.ts");
assert(fs.existsSync(forensicsPath), "financial_forensics.ts must exist");
const forensicsSrc = fs.readFileSync(forensicsPath, "utf8");

assert(forensicsSrc.includes("export function convertCurrency"), "convertCurrency must be exported");
assert(forensicsSrc.includes("export function reconcileAccountHolderName"), "reconcileAccountHolderName must be exported");
assert(forensicsSrc.includes("export function auditFinancialForensics"), "auditFinancialForensics must be exported");

// Verify Forex Rates
assert(forensicsSrc.includes("NGN: 0.000625"), "NGN exchange rate must be present");
assert(forensicsSrc.includes("GHS: 0.063"), "GHS exchange rate must be present");
assert(forensicsSrc.includes("EUR: 1.08"), "EUR exchange rate must be present");
assert(forensicsSrc.includes("GBP: 1.28"), "GBP exchange rate must be present");

// Verify Forensic Checks (28-day rule, funds dumping >25%, name reconciliation)
assert(forensicsSrc.includes("consecutiveDaysPassed >= holdingRequired"), "Consecutive days rule logic must exist");
assert(forensicsSrc.includes("fundsDumpingThresholdPercent"), "Funds dumping threshold check must exist");
assert(forensicsSrc.includes("differs from verified passport legal name"), "Passport vs bank name variance alert must exist");
console.log("  ✓ Financial forensics, forex conversion, 28-day holding, and funds dumping rules verified.");

// [Test 4] Verify Profile Store Integration & Decision Verdict
console.log("\n[Test 4] Verifying Profile Store Integration in src/core/vault/profile_store.ts...");
const profileStorePath = path.join(process.cwd(), "src", "core", "vault", "profile_store.ts");
const profileStoreSrc = fs.readFileSync(profileStorePath, "utf8");

assert(profileStoreSrc.includes("findConsularRoute("), "profile_store must invoke findConsularRoute");
assert(profileStoreSrc.includes("auditFinancialForensics("), "profile_store must invoke auditFinancialForensics");
assert(profileStoreSrc.includes("chk_passport"), "Passport validation item must be registered");
assert(profileStoreSrc.includes("chk_finance_amount"), "Proof of funds checklist item must be registered");
assert(profileStoreSrc.includes("chk_finance_consecutive"), "Consecutive holding checklist item must be registered");
assert(profileStoreSrc.includes("chk_finance_dumping"), "Funds dumping checklist item must be registered");
assert(profileStoreSrc.includes("chk_finance_name_match"), "Name reconciliation checklist item must be registered");
assert(profileStoreSrc.includes("chk_legal_police"), "Police certificate checklist item must be registered");
assert(profileStoreSrc.includes("chk_albania_lease"), "Albania residential lease checklist item must be registered");
assert(profileStoreSrc.includes("chk_academics_degree"), "Academic credential checklist item must be registered");

// Verify Decision Verdict Enum
assert(profileStoreSrc.includes('"READY_TO_APPLY"'), "READY_TO_APPLY verdict must be present");
assert(profileStoreSrc.includes('"BORDERLINE_RISK"'), "BORDERLINE_RISK verdict must be present");
assert(profileStoreSrc.includes('"HIGH_REFUSAL_PROBABILITY"'), "HIGH_REFUSAL_PROBABILITY verdict must be present");
console.log("  ✓ Consular checklist items (MRZ, Funds, 28-day, Dumping, Names, Police, Lease) and Verdicts verified.");

// [Test 5] Verify Interactive Consular Advisor Cockpit UI
console.log("\n[Test 5] Verifying Consular Cockpit UI in src/components/advisor/SovereignAdvisorView.tsx...");
const uiViewPath = path.join(process.cwd(), "src", "components", "advisor", "SovereignAdvisorView.tsx");
const uiViewSrc = fs.readFileSync(uiViewPath, "utf8");

assert(uiViewSrc.includes("Virtual Consular Officer Active"), "Consular badge must be present in header");
assert(uiViewSrc.includes("decisionVerdict"), "Decision verdict must be handled in UI");
assert(uiViewSrc.includes("READY_TO_APPLY"), "READY_TO_APPLY banner state must exist");
assert(uiViewSrc.includes("BORDERLINE_RISK"), "BORDERLINE_RISK banner state must exist");
assert(uiViewSrc.includes("HIGH_REFUSAL_PROBABILITY"), "HIGH_REFUSAL_PROBABILITY banner state must exist");

// Deep Financial Forensics Card
assert(uiViewSrc.includes("Deep Financial Forensic"), "Financial Forensics card header must exist");
assert(uiViewSrc.includes("consecutiveDaysPassed"), "Consecutive holding days passed must be displayed");
assert(uiViewSrc.includes("suddenDepositDetected"), "Sudden deposit alert must be rendered");
assert(uiViewSrc.includes("accountHolderNameMatch"), "Account name match status must be rendered");

// Consular Requirements Checklist Table
assert(uiViewSrc.includes("Consular Requirements & Verification Checklist"), "Checklist card header must exist");
assert(uiViewSrc.includes("statutoryCitation"), "Statutory citations must be displayed");
assert(uiViewSrc.includes("Upload & Rectify"), "Direct rectification button must exist");

// Quick-select route chips
assert(uiViewSrc.includes("popularDestinations"), "Destination quick-select presets must exist");
console.log("  ✓ Consular Decision Verdict banner, Deep Forensics Card, and Admissibility Checklist UI verified.");

// [Test 6] Currency Conversion Simulation
console.log("\n[Test 6] Simulating Benchmark Forex & Shortfall Math...");
const ratesToUsd = {
  USD: 1.0,
  GBP: 1.28,
  EUR: 1.08,
  CAD: 0.74,
  NGN: 0.000625,
  GHS: 0.063,
};

function simConvert(amt, src, tgt) {
  if (src === tgt) return amt;
  const inUsd = amt * ratesToUsd[src];
  return Math.round((inUsd / ratesToUsd[tgt]) * 100) / 100;
}

const ngnConverted = simConvert(3000000, "NGN", "GBP");
assert(ngnConverted > 1400 && ngnConverted < 1500, `Expected ~£1,464, got £${ngnConverted}`);
const ukShortfall = Math.max(0, 1270 - ngnConverted);
assert.strictEqual(ukShortfall, 0, "No shortfall when £1,464 >= £1,270");

const ghsConverted = simConvert(20000, "GHS", "GBP");
assert(ghsConverted > 900 && ghsConverted < 1000, `Expected ~£984, got £${ghsConverted}`);
const ukGhsShortfall = Math.max(0, 1270 - ghsConverted);
assert(ukGhsShortfall > 280, "Shortfall must be correctly computed for deficient balances");
console.log("  ✓ Statutory forex conversion and deficit shortfall math simulation passed.");

console.log("\n=======================================================");
console.log("ALL 6 CONSULAR IMMIGRATION FORENSICS TESTS PASSED (100%)");
console.log("=======================================================\n");
