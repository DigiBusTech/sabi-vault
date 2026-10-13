import { createHash, createHmac, timingSafeEqual } from "crypto";

// --- 1. DETERMINISTIC CANONICAL JSON HASHER ---
function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalJsonStringify(item)).join(",") + "]";
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`;
  });
  return "{" + entries.join(",") + "}";
}

function computeSha256(data) {
  const hasher = createHash("sha256");
  if (Buffer.isBuffer(data)) {
    hasher.update(data);
  } else if (typeof data === "string") {
    hasher.update(data, "utf8");
  } else {
    hasher.update(canonicalJsonStringify(data), "utf8");
  }
  return hasher.digest("hex");
}

// --- 2. SCOPED API KEY ENGINE ---
const TEST_SECRET = "sabi_vault_test_secret_key_32bytes_min!";

function generateScopedApiKey(payload, secretKey = TEST_SECRET) {
  const fullPayload = { ...payload, queryCount: 0 };
  const jsonString = JSON.stringify(fullPayload);
  const base64UrlPayload = Buffer.from(jsonString).toString("base64url");
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  const signature = hmac.digest("hex");
  return `sbk_live_v1_${base64UrlPayload}.${signature}`;
}

function verifyScopedApiKey(rawKey, secretKey = TEST_SECRET) {
  if (!rawKey.startsWith("sbk_live_v1_")) {
    return { isValid: false, error: "Invalid key format or version mismatch" };
  }
  const parts = rawKey.substring("sbk_live_v1_".length).split(".");
  if (parts.length !== 2) {
    return { isValid: false, error: "Malformed API key structure" };
  }
  const [base64UrlPayload, providedSignature] = parts;
  const hmac = createHmac("sha256", secretKey);
  hmac.update(`sbk_live_v1.${base64UrlPayload}`);
  const expectedSignature = hmac.digest("hex");

  const bufExpected = Buffer.from(expectedSignature, "hex");
  const bufProvided = Buffer.from(providedSignature, "hex");

  if (bufExpected.length !== bufProvided.length || !timingSafeEqual(bufExpected, bufProvided)) {
    return { isValid: false, error: "Cryptographic signature validation failed (Tampered Key)" };
  }

  const jsonString = Buffer.from(base64UrlPayload, "base64url").toString("utf8");
  const payload = JSON.parse(jsonString);
  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime > payload.expiresAt) {
    return { isValid: false, error: "API key has expired (TTL exceeded)", payload };
  }
  return { isValid: true, payload };
}

function filterVaultByScope(vault, allowedScopes) {
  const filtered = {
    userId: vault.userId,
    sovereignNode: vault.sovereignNode,
    residenceCountry: vault.residenceCountry,
    lastSyncedAt: vault.lastSyncedAt,
  };
  const scopeSet = new Set(allowedScopes);
  if (scopeSet.has("finance") && vault.finance) filtered.finance = vault.finance;
  if (scopeSet.has("portfolio") && vault.portfolio) filtered.portfolio = vault.portfolio;
  if (scopeSet.has("certifications") && vault.certifications) filtered.certifications = vault.certifications;
  if (scopeSet.has("academics") && vault.academics) filtered.academics = vault.academics;
  if (scopeSet.has("experience") && vault.experience) filtered.experience = vault.experience;
  if (scopeSet.has("achievements") && vault.achievements) filtered.achievements = vault.achievements;
  return filtered;
}

// --- 3. FRAUD AUDIT CHECKS ---
function auditFraud(vault) {
  const flags = [];
  if (vault.academics && vault.academics.degrees) {
    const currentYear = new Date().getFullYear();
    for (const deg of vault.academics.degrees) {
      if (deg.graduationYear > currentYear) {
        flags.push({ severity: "HIGH", flag: "FUTURE_GRADUATION_DATE", details: `Graduation year ${deg.graduationYear} is in the future` });
      }
    }
  }
  if (vault.finance && vault.finance.bankRecords) {
    for (const rec of vault.finance.bankRecords) {
      if (rec.averageThreeMonthBalance > 0) {
        const ratio = rec.currentLiquidBalance / rec.averageThreeMonthBalance;
        if (ratio > 5.0 && rec.currentLiquidBalance > 10000) {
          flags.push({ severity: "MEDIUM", flag: "SUDDEN_BALANCE_SURGE", details: `Liquid balance is ${ratio.toFixed(1)}x greater than 3-month average` });
        }
      }
    }
  }
  return flags;
}

// --- RUN VERIFICATION SUITE ---
async function runVerificationSuite() {
  console.log("=================================================");
  console.log("   SABI VAULT: CORE ENGINE INTEGRATION SUITE     ");
  console.log("=================================================\n");

  // TEST 1: Canonical JSON & SHA-256 Invariance
  console.log("[TEST 1] Testing Deterministic SHA-256 Hashing...");
  const sampleA = { b: "Computer Science", a: "Federal University of Technology", gpa: 4.8 };
  const sampleB = { a: "Federal University of Technology", gpa: 4.8, b: "Computer Science" };
  const hashA = computeSha256(sampleA);
  const hashB = computeSha256(sampleB);
  console.log(`  Hash A: ${hashA}`);
  console.log(`  Hash B: ${hashB}`);
  if (hashA === hashB) {
    console.log("  [PASS] Order-independent canonical hashing succeeded!\n");
  } else {
    throw new Error("Canonical JSON hashing failed - keys produced mismatching hashes.");
  }

  // TEST 2: Scoped Cryptographic API Key Generation & Verification
  console.log("[TEST 2] Testing Scoped API Key Issuance & Verification...");
  const issuedPayload = {
    keyId: "key_sec_991823",
    vaultId: "usr_chinwe_7721",
    allowedScopes: ["academics", "finance"],
    issuedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days TTL
    maxQueries: 10,
    sovereignNode: "ng-west-africa",
  };
  const apiKey = generateScopedApiKey(issuedPayload);
  console.log(`  Generated API Key: ${apiKey}`);
  const verifyValid = verifyScopedApiKey(apiKey);
  console.log("  Verification Result:", verifyValid.isValid ? "VALID" : "INVALID");
  if (!verifyValid.isValid) throw new Error("Generated valid key failed verification.");
  console.log("  [PASS] Valid API key verified successfully!\n");

  // TEST 3: Tampered API Key Detection
  console.log("[TEST 3] Testing Tampered API Key Detection...");
  const tamperedKey = apiKey.slice(0, -4) + "beef";
  const verifyTampered = verifyScopedApiKey(tamperedKey);
  console.log(`  Tampered Key Verification Result: isValid=${verifyTampered.isValid}, error="${verifyTampered.error}"`);
  if (!verifyTampered.isValid) {
    console.log("  [PASS] Tampered key successfully intercepted and rejected!\n");
  } else {
    throw new Error("Security failure: Tampered key passed verification!");
  }

  // TEST 4: Zero Raw Leakage & Scoped Data Redaction
  console.log("[TEST 4] Testing Data Redaction by Allowed Scopes...");
  const mockFullVault = {
    userId: "usr_chinwe_7721",
    sovereignNode: "ng-west-africa",
    residenceCountry: "NG",
    lastSyncedAt: new Date().toISOString(),
    academics: {
      userId: "usr_chinwe_7721",
      degrees: [
        {
          id: "deg_01",
          institution: "University of Lagos",
          degreeType: "BSc",
          fieldOfStudy: "Computer Engineering",
          graduationYear: 2023,
          gpa: 4.82,
          maxGpa: 5.0,
          isNotarized: true,
          tier: 2,
          hashRef: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      ],
    },
    finance: {
      userId: "usr_chinwe_7721",
      bankRecords: [
        {
          institutionName: "Zenith Bank PLC",
          currency: "NGN",
          currentLiquidBalance: 4500000,
          averageThreeMonthBalance: 4200000,
          statementPeriod: { from: "2026-06-01", to: "2026-09-01" },
          verifiedAt: new Date().toISOString(),
          hashRef: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
        },
      ],
    },
    experience: {
      userId: "usr_chinwe_7721",
      experiences: [
        {
          id: "exp_01",
          company: "Paystack",
          jobTitle: "Senior Backend Engineer",
          employmentType: "Full-time",
          startDate: "2023-01-01",
          isCurrent: true,
          responsibilities: ["Built microservices", "Led payments gateway"],
          hashRef: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
        },
      ],
    },
    portfolio: {
      userId: "usr_chinwe_7721",
      headline: "Distributed Systems & Identity Engineer",
      bio: "Passionate about sovereign identity and cryptography.",
      publicLinks: [{ label: "GitHub", url: "https://github.com/chinwe" }],
    },
  };

  const filtered = filterVaultByScope(mockFullVault, verifyValid.payload.allowedScopes);
  console.log("  Allowed Scopes:", verifyValid.payload.allowedScopes);
  console.log("  Filtered Vault Keys:", Object.keys(filtered));
  const hasAcademics = !!filtered.academics;
  const hasFinance = !!filtered.finance;
  const hasExperience = !!filtered.experience;
  const hasPortfolio = !!filtered.portfolio;

  if (hasAcademics && hasFinance && !hasExperience && !hasPortfolio) {
    console.log("  [PASS] Data redaction verified! Non-permitted categories ('experience', 'portfolio') were strictly omitted.\n");
  } else {
    throw new Error("Data leakage detected! Non-permitted categories were exposed.");
  }

  // TEST 5: Blockchain Anti-Tamper Simulation
  console.log("[TEST 5] Testing Database Tampering vs Blockchain Hash Mismatch...");
  const pristineAcademics = mockFullVault.academics;
  const onChainCommittedHash = computeSha256(pristineAcademics);
  console.log(`  On-Chain Committed Hash: ${onChainCommittedHash}`);

  // Simulate malicious database admin altering GPA from 4.82 to 5.0
  const tamperedAcademics = JSON.parse(JSON.stringify(pristineAcademics));
  tamperedAcademics.degrees[0].gpa = 5.0; // Unauthorized change in database!
  const tamperedHash = computeSha256(tamperedAcademics);
  console.log(`  Tampered Data Recomputed Hash: ${tamperedHash}`);

  const tamperDetected = onChainCommittedHash !== tamperedHash;
  if (tamperDetected) {
    console.log("  [PASS] Blockchain anti-tamper detected unauthorized database modification!\n");
  } else {
    throw new Error("Tamper detection failed!");
  }

  // TEST 6: Fraud & Anomaly Audit
  console.log("[TEST 6] Testing Fraud & Anomaly Auditor...");
  const suspectVault = {
    academics: {
      degrees: [
        {
          institution: "Fictitious University",
          degreeType: "BSc",
          fieldOfStudy: "Cybersecurity",
          graduationYear: 2035, // Future year!
        },
      ],
    },
    finance: {
      bankRecords: [
        {
          institutionName: "Apex Bank",
          currency: "USD",
          currentLiquidBalance: 85000,
          averageThreeMonthBalance: 2000, // 42x spike!
        },
      ],
    },
  };
  const fraudFlags = auditFraud(suspectVault);
  console.log("  Flags Triggered:", fraudFlags.map((f) => `[${f.severity}] ${f.flag}: ${f.details}`));
  if (fraudFlags.length >= 2) {
    console.log("  [PASS] Fraud Detection Agent caught timeline and balance anomalies!\n");
  } else {
    throw new Error("Fraud auditor failed to catch blatant anomalies!");
  }

  console.log("=================================================");
  console.log("   ALL 6 CORE ARCHITECTURAL TESTS PASSED!       ");
  console.log("=================================================");
}

runVerificationSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});

