"use client";

import React, { useState } from "react";
import {
  Shield,
  Key,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Coins,
  FileCheck,
  Building,
  GraduationCap,
  Briefcase,
  Award,
  Wallet,
  Sparkles,
  RefreshCw,
  Copy,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { computeSha256 } from "@/core/crypto/hasher";
import { generateScopedApiKey, verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { VaultCategory, FullUserVault } from "@/types/vault";

// Sample verified citizen vault data
const INITIAL_VAULT: FullUserVault = {
  userId: "usr_chinwe_okafor_7721",
  sovereignNode: "ng-west-africa-node-01 (Lagos / Abuja)",
  residenceCountry: "Nigeria",
  lastSyncedAt: new Date().toISOString(),
  finance: {
    userId: "usr_chinwe_okafor_7721",
    bankRecords: [
      {
        institutionName: "Zenith Bank PLC",
        currency: "NGN",
        currentLiquidBalance: 8750000,
        averageThreeMonthBalance: 8200000,
        statementPeriod: { from: "2026-06-01", to: "2026-09-01" },
        verifiedAt: "2026-09-05T12:00:00Z",
        hashRef: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      },
    ],
    taxClearance: {
      taxId: "FIRS-TCC-2026-99014",
      jurisdiction: "Federal Republic of Nigeria",
      status: "VALID",
      validUntil: "2026-12-31",
      hashRef: "9e107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec29807",
    },
  },
  academics: {
    userId: "usr_chinwe_okafor_7721",
    degrees: [
      {
        id: "deg_01",
        institution: "University of Lagos",
        degreeType: "BSc",
        fieldOfStudy: "Computer Engineering",
        graduationYear: 2022,
        gpa: 4.84,
        maxGpa: 5.0,
        honors: "First Class Honours",
        isNotarized: true,
        tier: 2,
        hashRef: "3e2849e798bc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
    ],
  },
  experience: {
    userId: "usr_chinwe_okafor_7721",
    experiences: [
      {
        id: "exp_01",
        company: "Paystack (Stripe)",
        jobTitle: "Senior Systems Engineer",
        employmentType: "Full-time",
        startDate: "2022-03-01",
        isCurrent: true,
        responsibilities: [
          "Engineered multi-currency settlement engine processing $12M daily.",
          "Designed fault-tolerant event sourcing system with 99.99% uptime.",
        ],
        technologiesUsed: ["Go", "TypeScript", "PostgreSQL", "Kafka"],
        verifiedReference: {
          contactName: "Tunde Adeyemi (VP Eng)",
          officialEmail: "tunde@paystack.com",
          isVerified: true,
        },
        hashRef: "5f3a097de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      },
    ],
  },
  certifications: {
    userId: "usr_chinwe_okafor_7721",
    certifications: [
      {
        id: "cert_01",
        title: "AWS Certified Solutions Architect - Professional",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2023-05-15",
        tier: 1,
        hashRef: "8a107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec29807",
      },
    ],
  },
  portfolio: {
    userId: "usr_chinwe_okafor_7721",
    headline: "Staff Distributed Systems Architect & Cryptographic Identity Researcher",
    bio: "Pioneering sovereign data infrastructures, verifiable credentials, and decentralized consensus networks.",
    publicLinks: [
      { label: "GitHub", url: "https://github.com/chinwe-okafor" },
      { label: "Research", url: "https://scholar.google.com/citations?user=chinwe" },
    ],
  },
  achievements: {
    userId: "usr_chinwe_okafor_7721",
    achievements: [
      {
        id: "ach_01",
        title: "Africa Fintech Innovation Award Winner",
        issuer: "Techpoint Africa",
        date: "2024",
        description: "Awarded top engineering innovation for zero-loss payment routing.",
        hashRef: "2b9e107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec298",
      },
    ],
  },
};

export default function SabiVaultDemo() {
  const [activeTab, setActiveTab] = useState<"b2c" | "b2b">("b2c");

  // B2C Key Generator State
  const [selectedScopes, setSelectedScopes] = useState<VaultCategory[]>([
    "academics",
    "finance",
  ]);
  const [keyTtlDays, setKeyTtlDays] = useState<number>(7);
  const [maxQueries, setMaxQueries] = useState<number>(5);
  const [generatedApiKey, setGeneratedApiKey] = useState<string>("");
  const [copyNotice, setCopyNotice] = useState<boolean>(false);

  // B2B Enterprise Screening State
  const [inputApiKey, setInputApiKey] = useState<string>("");
  const [selectedVertical, setSelectedVertical] = useState<"labour" | "immigration" | "education">("labour");
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<any | null>(null);

  // Handle Generating API Key
  const handleGenerateKey = () => {
    const payload = {
      keyId: `key_${Math.random().toString(36).substring(2, 9)}`,
      vaultId: INITIAL_VAULT.userId,
      allowedScopes: selectedScopes,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + keyTtlDays * 86400,
      maxQueries: maxQueries,
      sovereignNode: "ng-west-africa",
    };
    const key = generateScopedApiKey(payload);
    setGeneratedApiKey(key);
    setInputApiKey(key); // Auto-populate into B2B screener for seamless testing
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedApiKey);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2000);
  };

  const toggleScope = (scope: VaultCategory) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  // Run the Multi-Agent Pipeline
  const runScreeningPipeline = () => {
    if (!inputApiKey) return;
    setIsScreening(true);
    setScreeningResult(null);

    setTimeout(() => {
      const verification = verifyScopedApiKey(inputApiKey);
      if (!verification.isValid || !verification.payload) {
        setScreeningResult({
          status: "REJECTED",
          error: verification.error || "Cryptographic Key Signature Invalid",
        });
        setIsScreening(false);
        return;
      }

      // Filter Candidate Vault strictly by allowed scopes
      const filteredData = filterVaultByScope(INITIAL_VAULT, verification.payload.allowedScopes);

      // 1. Integrity Check: SHA-256 vs On-Chain Registry
      const academicHash = filteredData.academics ? computeSha256(filteredData.academics) : null;
      const financeHash = filteredData.finance ? computeSha256(filteredData.finance) : null;

      // 2. Criteria Matching & Scoring
      const isLabour = selectedVertical === "labour";
      const isImmigration = selectedVertical === "immigration";

      setScreeningResult({
        status: "VERIFIED_SUCCESS",
        keyPayload: verification.payload,
        candidateId: INITIAL_VAULT.userId,
        sovereignNode: INITIAL_VAULT.sovereignNode,
        filteredData,
        integrityCheck: {
          passed: true,
          onChainTx: "0x89f4b321a97d9120eef9234857b60e408d6c7b9a5e8e3d09a25b1285741f021c",
          network: "Base Sepolia L2 (Block #18,924,102)",
          tierLevel: "Tier 2 (Notary Legalized & On-Chain Hashed)",
          academicHash,
          financeHash,
        },
        criteriaEvaluation: {
          compositeScore: isLabour ? 94 : isImmigration ? 98 : 92,
          verdict: "HIGHLY_QUALIFIED",
          rubricBreakdown: [
            {
              category: "Academics",
              score: 98,
              status: "PASSED",
              proof: "BSc Computer Engineering (First Class Honours, GPA 4.84/5.0) - Tier 2 Notarized",
            },
            {
              category: "Finance",
              score: 95,
              status: "PASSED",
              proof: "Verified Liquid Balance (NGN 8,750,000) exceeds requirements; Valid FIRS Tax Clearance",
            },
            ...(verification.payload.allowedScopes.includes("experience")
              ? [
                  {
                    category: "Experience",
                    score: 92,
                    status: "PASSED",
                    proof: "Senior Systems Engineer at Paystack (Stripe) with verified leadership references",
                  },
                ]
              : [
                  {
                    category: "Experience",
                    score: 0,
                    status: "REDACTED",
                    proof: "Redacted by candidate (Scope not granted in API key)",
                  },
                ]),
          ],
        },
        fraudAudit: {
          riskScore: 0,
          status: "CLEAN",
          anomaliesDetected: 0,
          remarks: "Zero timeline contradictions. Document hashes match on-chain ledger without discrepancy.",
        },
        revenueSplitReceipt: {
          queryFeeUsd: "$1.00",
          platformShare: "$0.60 (60% to Sabi Vault Platform)",
          sovereignHostShare: "$0.40 (40% to Nigerian Sovereign Node Host)",
          contractExecuted: "SabiRevenueSplitter.sol (Base Sepolia)",
        },
      });
      setIsScreening(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0b101e]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                SABI VAULT
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sovereign Infra
              </span>
            </div>
            <p className="text-xs text-slate-400">Decentralized Identity & Enterprise Screening</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("b2c")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "b2c"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4" />
            Citizen Vault (B2C)
          </button>
          <button
            onClick={() => setActiveTab("b2b")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "b2b"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Enterprise Screening (B2B)
          </button>
        </div>

        {/* Regional Node Status */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-mono text-[11px]">Sovereign Node: West Africa (NDPC)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 p-6 md:p-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Zero Raw File Centralization • On-Chain Tamper Proofing • 60/40 GovTech Revenue Split
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {activeTab === "b2c"
                ? "Citizen Sovereign Vault & Scoped Key Generator"
                : "Enterprise Multi-Agent Screening Gateway"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeTab === "b2c"
                ? "Your raw documents remain safely inside your personal cloud drive. Generate time-decaying, cryptographically signed API keys that grant organizations access only to specific verified categories."
                : "Verify applicant qualifications in seconds with zero manual document review, zero PDF forgery risk, and instant mathematical verification against on-chain hash ledgers."}
            </p>
          </div>
        </div>

        {/* TAB 1: CITIZEN VAULT (B2C) */}
        {activeTab === "b2c" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: 6 Vault Categories */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Standardized Vault Categories
                </h2>
                <span className="text-xs text-slate-400">Synced via OAuth (Google Drive)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Academics */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Academics</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tier 2 Notarized
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">BSc Computer Engineering</p>
                    <p className="text-slate-400">University of Lagos • First Class (GPA: 4.84/5.0)</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      SHA256: 3e2849e798bc...7852b855
                    </p>
                  </div>
                </div>

                {/* 2. Finance */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-bold text-white">Finance</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Tier 1 Hashed
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">Liquid Balance: NGN 8,750,000</p>
                    <p className="text-slate-400">Zenith Bank PLC • Tax Clearance: VALID (FIRS)</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      SHA256: 4b227777d4dd...cacdabf8a
                    </p>
                  </div>
                </div>

                {/* 3. Experience */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Experience</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Ref
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">Senior Systems Engineer</p>
                    <p className="text-slate-400">Paystack (Stripe) • 2022 - Present</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      SHA256: 5f3a097de37b...64afe39d
                    </p>
                  </div>
                </div>

                {/* 4. Certifications */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-white">Certifications</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Tier 1 Hashed
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">AWS Solutions Architect Pro</p>
                    <p className="text-slate-400">Amazon Web Services</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      SHA256: 8a107d9d372b...ec29807
                    </p>
                  </div>
                </div>

                {/* 5. Portfolio */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-teal-400" />
                      <span className="text-sm font-bold text-white">Portfolio</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Public Identity
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">Distributed Systems Architect</p>
                    <p className="text-slate-400">GitHub, Google Scholar verified</p>
                  </div>
                </div>

                {/* 6. Achievements */}
                <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-white">Achievements</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Tier 1 Hashed
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p className="font-semibold text-slate-100">Fintech Innovation Winner</p>
                    <p className="text-slate-400">Techpoint Africa (2024)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Scoped API Key Generator */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-slate-800 bg-gradient-to-b from-slate-900 to-[#0c1220] rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Generate Scoped API Key</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">
                      1. Select Allowed Categories (Data Redaction):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          "academics",
                          "finance",
                          "experience",
                          "certifications",
                          "portfolio",
                          "achievements",
                        ] as VaultCategory[]
                      ).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => toggleScope(cat)}
                          className={`px-3 py-2 rounded-lg border text-left font-medium capitalize transition-all ${
                            selectedScopes.includes(cat)
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          ✓ {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">2. Expiration (TTL):</label>
                      <select
                        value={keyTtlDays}
                        onChange={(e) => setKeyTtlDays(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      >
                        <option value={1}>24 Hours</option>
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={30}>30 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">3. Max Queries:</label>
                      <select
                        value={maxQueries}
                        onChange={(e) => setMaxQueries(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                      >
                        <option value={1}>1 (Single Use)</option>
                        <option value={5}>5 Queries</option>
                        <option value={10}>10 Queries</option>
                        <option value={0}>Unlimited</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateKey}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Mint Cryptographic API Key
                  </button>

                  {generatedApiKey && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold text-emerald-400">Live API Key Ready:</span>
                        <button
                          onClick={handleCopyKey}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copyNotice ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="p-3 bg-black/60 border border-emerald-500/30 rounded-lg font-mono text-[11px] text-emerald-300 break-all select-all">
                        {generatedApiKey}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Pass this key to recruiters or immigration officers. They will only be able to view{" "}
                        <span className="text-emerald-400 font-semibold">{selectedScopes.join(", ")}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENTERPRISE SCREENING (B2B) */}
        {activeTab === "b2b" && (
          <div className="space-y-8">
            {/* Input Controls */}
            <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Candidate Scoped API Key:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      placeholder="Paste candidate key (e.g. sbk_live_v1_...)"
                      className="w-full bg-black/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs font-mono text-cyan-300 placeholder-slate-600 outline-none"
                    />
                    {!inputApiKey && (
                      <button
                        onClick={handleGenerateKey}
                        className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30"
                      >
                        Use Demo Key
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Screening Vertical:
                  </label>
                  <select
                    value={selectedVertical}
                    onChange={(e: any) => setSelectedVertical(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold text-slate-200 outline-none"
                  >
                    <option value="labour">Labour & Enterprise Hiring (Tech Lead)</option>
                    <option value="immigration">Immigration & Visa Processing (Skilled Worker)</option>
                    <option value="education">University Admissions (MSc Computer Science)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Query Fee: <span className="font-semibold text-slate-200">$1.00</span> (Split: $0.60 Sabi / $0.40 Sovereign Node Host)
                </div>

                <button
                  onClick={runScreeningPipeline}
                  disabled={isScreening || !inputApiKey}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
                >
                  {isScreening ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running Multi-Agent Pipeline...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Execute Multi-Agent Screening
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Screening Results View */}
            {screeningResult && (
              <div className="space-y-6">
                {screeningResult.status === "REJECTED" ? (
                  <div className="p-6 rounded-2xl border border-red-500/30 bg-red-950/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Screening Execution Failed</p>
                      <p className="text-xs text-red-300">{screeningResult.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Top Summary Card */}
                    <div className="lg:col-span-12 border border-slate-800 bg-slate-900/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-white">
                            Candidate Evaluation Dossier
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {screeningResult.criteriaEvaluation.verdict}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Candidate ID: <span className="font-mono text-slate-300">{screeningResult.candidateId}</span> • Sovereign Node:{" "}
                          <span className="text-emerald-400">{screeningResult.sovereignNode}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Match Score</div>
                          <div className="text-3xl font-black text-emerald-400">
                            {screeningResult.criteriaEvaluation.compositeScore}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Agent 1: Integrity & Blockchain Ledger Check */}
                    <div className="lg:col-span-6 border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          1. Document Integrity Agent (Blockchain)
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          TAMPER-PROOF MATCH
                        </span>
                      </div>
                      <div className="text-xs space-y-2 text-slate-300 bg-black/40 p-3 rounded-xl border border-slate-800/80 font-mono">
                        <div>
                          <span className="text-slate-500">Ledger:</span> {screeningResult.integrityCheck.network}
                        </div>
                        <div>
                          <span className="text-slate-500">Tx Hash:</span>{" "}
                          <span className="text-emerald-300 truncate block">
                            {screeningResult.integrityCheck.onChainTx}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Trust Level:</span>{" "}
                          <span className="text-slate-200">{screeningResult.integrityCheck.tierLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent 4: Fraud & Anomaly Audit */}
                    <div className="lg:col-span-6 border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          4. Fraud & Timeline Audit Agent
                        </h4>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          RISK SCORE: 0% (CLEAN)
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-300 bg-black/40 p-3 rounded-xl border border-slate-800/80">
                        <p className="text-slate-300">{screeningResult.fraudAudit.remarks}</p>
                        <p className="text-[11px] text-slate-400">
                          ✓ Graduation chronology valid • ✓ Balance velocity stable • ✓ Zero duplicate credentials
                        </p>
                      </div>
                    </div>

                    {/* Agent 3: Strict RAG Rubric Breakdown */}
                    <div className="lg:col-span-12 border border-slate-800 bg-slate-900/40 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-purple-400" />
                          3. Strict RAG Evaluator (Zero-Hallucination Verified Proofs)
                        </h4>
                        <span className="text-xs text-slate-400">Evaluated over Scoped JSON</span>
                      </div>

                      <div className="space-y-3">
                        {screeningResult.criteriaEvaluation.rubricBreakdown.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-800 bg-black/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{item.category}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    item.status === "PASSED"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300">{item.proof}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-white">{item.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Smart Contract Revenue Split Receipt */}
                    <div className="lg:col-span-12 border border-emerald-500/20 bg-emerald-950/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="font-bold text-white">GovTech Micro-Transaction Settled:</span>{" "}
                          <span className="text-slate-300 font-mono">
                            {screeningResult.revenueSplitReceipt.contractExecuted}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <span className="text-emerald-400">{screeningResult.revenueSplitReceipt.platformShare}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-400">{screeningResult.revenueSplitReceipt.sovereignHostShare}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        Sabi Vault Platform • Sovereign Data Infrastructure • NDPC & GDPR Compliant • Powered by Base L2 & Multi-Agent RAG
      </footer>
    </div>
  );
}
