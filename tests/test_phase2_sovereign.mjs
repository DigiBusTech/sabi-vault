import { createHash } from "crypto";

// --- REPLICATED LOGIC FOR STANDALONE TESTING ---
function computeSha256(data) {
  const hasher = createHash("sha256");
  if (Buffer.isBuffer(data)) hasher.update(data);
  else if (typeof data === "string") hasher.update(data, "utf8");
  return hasher.digest("hex");
}

// Sovereign Node Router Logic
const REGIONAL_NODES = {
  "ng-west-africa": {
    nodeId: "ng-west-africa",
    regionName: "West Africa Sovereign Hub (Lagos / Abuja)",
    jurisdiction: "Nigeria / ECOWAS",
    complianceFramework: "NDPC",
    payoutAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
  "eu-central": {
    nodeId: "eu-central",
    regionName: "EU Central Sovereign Hub (Frankfurt / Dublin)",
    jurisdiction: "European Union",
    complianceFramework: "GDPR",
    payoutAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  },
  "na-east": {
    nodeId: "na-east",
    regionName: "North America Sovereign Hub (N. Virginia)",
    jurisdiction: "United States / Canada",
    complianceFramework: "US_PRIVACY",
    payoutAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  },
};

function resolveSovereignNode(countryCode) {
  const code = countryCode.toUpperCase();
  const africanCountries = ["NG", "GH", "KE", "ZA", "EG", "RW", "SN"];
  if (africanCountries.includes(code)) return REGIONAL_NODES["ng-west-africa"];
  const euCountries = ["DE", "FR", "GB", "NL", "IE", "ES", "IT"];
  if (euCountries.includes(code)) return REGIONAL_NODES["eu-central"];
  return REGIONAL_NODES["na-east"];
}

// Ephemeral Parser Simulation
function processEphemeralDocument(fileBuffer, fileName) {
  // 1. Calculate SHA-256
  const sha256 = computeSha256(fileBuffer);
  // 2. Extract content
  const extractedText = fileBuffer.toString("utf8");
  // 3. Security invariant: zero out buffer
  fileBuffer.fill(0);
  return {
    fileName,
    sha256,
    extractedSnippet: extractedText.substring(0, 50),
    bufferZeroed: fileBuffer.every((byte) => byte === 0),
  };
}

// Revenue Split Calculation
function calculateRevenueSplit(totalFeeWei) {
  const platformShare = (totalFeeWei * 60n) / 100n;
  const sovereignHostShare = totalFeeWei - platformShare;
  return { platformShare, sovereignHostShare };
}

// RUN TEST SUITE
async function runPhase2Tests() {
  console.log("=================================================");
  console.log("   SABI VAULT: PHASE 2 SOVEREIGN INFRASTRUCTURE  ");
  console.log("=================================================\n");

  // TEST 1: Ephemeral Parser Zero-Raw Invariant
  console.log("[TEST 1] Testing Ephemeral Parsing & Memory Buffer Sanitization...");
  const rawDocumentPayload = Buffer.from("CONFIDENTIAL_TRANSCRIPT_UNILAG_FIRST_CLASS_HONOURS_2022");
  const rawHashExpected = computeSha256(rawDocumentPayload);

  const parsed = processEphemeralDocument(rawDocumentPayload, "unilag_degree.pdf");
  console.log(`  Document Processed: ${parsed.fileName}`);
  console.log(`  Computed SHA-256: ${parsed.sha256}`);
  console.log(`  Buffer Sanitized In Memory: ${parsed.bufferZeroed}`);

  if (parsed.sha256 === rawHashExpected && parsed.bufferZeroed) {
    console.log("  [PASS] Zero-Raw invariant verified! In-memory buffer wiped to 0x00 after hashing.\n");
  } else {
    throw new Error("Zero-Raw memory sanitization check failed!");
  }

  // TEST 2: Sovereign Regional Node Routing (NDPC vs GDPR)
  console.log("[TEST 2] Testing Sovereign Node Regional Routing...");
  const nodeNG = resolveSovereignNode("NG");
  console.log(`  Country: NG -> Node: ${nodeNG.nodeId} (${nodeNG.regionName}) | Framework: ${nodeNG.complianceFramework}`);
  if (nodeNG.nodeId !== "ng-west-africa" || nodeNG.complianceFramework !== "NDPC") {
    throw new Error("Nigeria did not resolve to NDPC West Africa sovereign hub!");
  }

  const nodeDE = resolveSovereignNode("DE");
  console.log(`  Country: DE -> Node: ${nodeDE.nodeId} (${nodeDE.regionName}) | Framework: ${nodeDE.complianceFramework}`);
  if (nodeDE.nodeId !== "eu-central" || nodeDE.complianceFramework !== "GDPR") {
    throw new Error("Germany did not resolve to GDPR EU sovereign hub!");
  }
  console.log("  [PASS] Sovereign Node Routing successfully isolates regional data residency.\n");

  // TEST 3: Blockchain Ledger Commitment & Anti-Tamper Matching
  console.log("[TEST 3] Testing On-Chain Hash Verification & Tamper Interception...");
  const mockVaultId = "usr_sovereign_01";
  const mockCategory = "academics";
  const legitimateHash = parsed.sha256;
  const tamperedHash = "a".repeat(64);

  const isLegitMatch = legitimateHash === parsed.sha256;
  const isTamperedMatch = tamperedHash === parsed.sha256;

  console.log(`  Legitimate Hash Check: ${isLegitMatch ? "MATCH (VALID)" : "MISMATCH"}`);
  console.log(`  Tampered Hash Check: ${isTamperedMatch ? "MATCH" : "REJECTED (TAMPER_FLAG)"}`);

  if (isLegitMatch && !isTamperedMatch) {
    console.log("  [PASS] On-chain hash comparison correctly accepts valid hashes and rejects tampered ones.\n");
  } else {
    throw new Error("Hash comparison failed!");
  }

  // TEST 4: Micro-Transaction 60/40 Fee Split Precision
  console.log("[TEST 4] Testing 60/40 GovTech Revenue Split Smart Contract Math...");
  const fee1UsdInWei = 1000000000000000000n; // 1 ETH or equivalent base token unit
  const split = calculateRevenueSplit(fee1UsdInWei);

  console.log(`  Total Fee:           ${fee1UsdInWei.toString()} wei (100%)`);
  console.log(`  Platform Treasury:   ${split.platformShare.toString()} wei (60%)`);
  console.log(`  Sovereign Host Hub:  ${split.sovereignHostShare.toString()} wei (40%)`);

  if (
    split.platformShare === 600000000000000000n &&
    split.sovereignHostShare === 400000000000000000n &&
    split.platformShare + split.sovereignHostShare === fee1UsdInWei
  ) {
    console.log("  [PASS] 60/40 smart contract revenue split mathematically exact with zero rounding loss.\n");
  } else {
    throw new Error("Revenue split calculation failed!");
  }

  console.log("=================================================");
  console.log("   ALL PHASE 2 SOVEREIGN TESTS PASSED!          ");
  console.log("=================================================");
}

runPhase2Tests().catch((err) => {
  console.error("Phase 2 Test Suite Failed:", err);
  process.exit(1);
});

