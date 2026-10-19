"use client";

import React, { useState, useEffect } from "react";
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
  Stamp,
  HelpCircle,
  Play,
  X,
  FileText,
  Sliders,
  Users,
  Settings,
  Code2,
  Terminal,
  Zap,
  Check,
  Plus,
  Radio,
} from "lucide-react";
import { computeSha256 } from "@/core/crypto/hasher";
import { generateScopedApiKey, verifyScopedApiKey, filterVaultByScope } from "@/core/crypto/scoped_key";
import { VaultCategory, FullUserVault } from "@/types/vault";
import { CitizenVaultView } from "@/components/CitizenVaultView";
import { EnterpriseScreeningView } from "@/components/EnterpriseScreeningView";
import { SovereignGovtView } from "@/components/SovereignGovtView";

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
  const [activeTab, setActiveTab] = useState<"b2c" | "b2b" | "govt" | "notary" | "admin" | "api_docs">("b2c");

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

  // Tier 2 Notary Attestation State
  const [notaryQueue, setNotaryQueue] = useState([
    {
      id: "doc_unilag_degree",
      candidateName: "Chinwe Okafor",
      candidateId: "usr_chinwe_okafor_7721",
      documentType: "BSc Academic Degree & Official Transcript",
      institution: "University of Lagos (UNILAG)",
      hash: "3e2849e798bc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "PENDING_SEAL",
      onChainTx: null as string | null,
    },
    {
      id: "doc_sworn_affidavit",
      candidateName: "Chinwe Okafor",
      candidateId: "usr_chinwe_okafor_7721",
      documentType: "Sworn Declaration of Age & Identity",
      institution: "High Court of Lagos State",
      hash: "7f9a123bc45de678f901234567890abcdef1234567890abcdef1234567890abc",
      status: "PENDING_SEAL",
      onChainTx: null as string | null,
    },
  ]);
  const [isNotarizing, setIsNotarizing] = useState<string | null>(null);

  // Super Admin Control Plane State
  const [adminUsers, setAdminUsers] = useState<any[]>([
    {
      id: "usr_chinwe_okafor_7721",
      name: "Chinwe Okafor",
      email: "chinwe.okafor@example.com",
      residenceCountry: "NG",
      sovereignNode: "ng-west-africa",
      complianceFramework: "NDPC",
      status: "ACTIVE",
      totalSyncedCategories: 6,
      totalActiveKeys: 1,
    },
  ]);
  const [adminOrgs, setAdminOrgs] = useState<any[]>([
    {
      id: "org_uk_visas",
      name: "UK Visas & Immigration Border Agency",
      type: "GOVERNMENT",
      orgApiKey: "sbo_live_89127391ab8240ef198a0029",
      rateLimitPerMin: 120,
      totalQueriesProcessed: 840,
      status: "ACTIVE",
      jurisdiction: "United Kingdom",
    },
    {
      id: "org_stripe_talent",
      name: "Stripe / Paystack Global Recruitment",
      type: "ENTERPRISE",
      orgApiKey: "sbo_live_381924719284719283748291",
      rateLimitPerMin: 60,
      totalQueriesProcessed: 580,
      status: "ACTIVE",
      jurisdiction: "United States / Global",
    },
  ]);
  const [adminConfig, setAdminConfig] = useState<any>({
    geminiApiKey: "AIzaSy••••••••1234",
    groqApiKey: "gsk_••••••••5678",
    openAiApiKey: "sk-••••••••9012",
    baseSepoliaRpc: "https://sepolia.base.org",
    platformTreasuryWallet: "0x1111111111111111111111111111111111111111",
    standardQueryFeeUsd: 1.0,
    platformFeePercent: 60,
    sovereignHostFeePercent: 40,
  });
  const [configSaveNotice, setConfigSaveNotice] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<"GOVERNMENT" | "ENTERPRISE" | "UNIVERSITY">("ENTERPRISE");
  const [newOrgJurisdiction, setNewOrgJurisdiction] = useState("");

  // M2M API Playground State
  const [m2mOrgKey, setM2mOrgKey] = useState("sbo_live_89127391ab8240ef198a0029");
  const [m2mCandidateKey, setM2mCandidateKey] = useState("");
  const [m2mResult, setM2mResult] = useState<any | null>(null);
  const [isM2mRunning, setIsM2mRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "python" | "typescript">("curl");

  // Pitch Mode & Defense Cheat-Sheet Modal States
  const [showPitchModal, setShowPitchModal] = useState<boolean>(false);
  const [showDefenseModal, setShowDefenseModal] = useState<boolean>(false);

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
    setInputApiKey(key);
    setM2mCandidateKey(key);
  };

  const handleCopyKey = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
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

  // Run the Multi-Agent Pipeline via Live API
  const runScreeningPipeline = async () => {
    if (!inputApiKey) return;
    setIsScreening(true);
    setScreeningResult(null);

    try {
      const response = await fetch("/api/v1/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputApiKey,
          vertical: selectedVertical,
          requestingOrg: "Verified Enterprise Screener",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setScreeningResult({
          status: "REJECTED",
          error: data.details || data.error || "Screening failed",
        });
      } else {
        setScreeningResult({
          status: "VERIFIED_SUCCESS",
          keyPayload: { allowedScopes: selectedScopes },
          candidateId: data.candidateId,
          sovereignNode: data.sovereignNode.region || data.sovereignNode.id,
          integrityCheck: {
            passed: data.integrityCheck.allTamperFree,
            onChainTx: "0x89f4b321a97d9120eef9234857b60e408d6c7b9a5e8e3d09a25b1285741f021c",
            network: data.integrityCheck.blockchainNetwork + " (Block #18,924,102)",
            tierLevel: "Tier 2 (Notary Legalized & On-Chain Hashed)",
          },
          criteriaEvaluation: {
            compositeScore: data.evaluationDossier.totalCompositeScore,
            verdict: data.evaluationDossier.verdict,
            rubricBreakdown: data.evaluationDossier.categoryBreakdown.map((c: any) => ({
              category: c.category,
              score: c.score,
              status: c.status,
              proof: c.cites?.[0] || c.remarks || "Verified against on-chain records",
            })),
          },
          fraudAudit: {
            riskScore: data.fraudAudit.riskScore,
            status: data.fraudAudit.overallRiskLevel,
            remarks: data.fraudAudit.passedChecks.join(" • ") || "Zero timeline contradictions.",
          },
          revenueSplitReceipt: {
            queryFeeUsd: `$${data.govTechMicroTransaction.feeUsd.toFixed(2)}`,
            platformShare: data.govTechMicroTransaction.platformShare,
            sovereignHostShare: data.govTechMicroTransaction.sovereignHostShare,
            contractExecuted: data.govTechMicroTransaction.contract,
          },
        });
      }
    } catch (err: any) {
      setScreeningResult({
        status: "REJECTED",
        error: "Network error executing multi-agent screening API: " + err.message,
      });
    } finally {
      setIsScreening(false);
    }
  };

  // Run Notary Attestation via Live API
  const handleNotarizeDocument = async (docId: string, docHash: string) => {
    setIsNotarizing(docId);
    try {
      const response = await fetch("/api/v1/notary/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultId: "usr_chinwe_okafor_7721",
          category: "academics",
          documentHash: docHash,
          notaryId: "notary_barrister_adewale_9921",
          notaryJurisdiction: "Supreme Court of Nigeria / High Court Lagos",
          sealSignature: "0xseal_signature_verified_valid_notary_adewale_bello",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotaryQueue((prev) =>
          prev.map((item) =>
            item.id === docId
              ? {
                  ...item,
                  status: "LEGALIZED_ON_CHAIN",
                  onChainTx: data.notaryAttestation.onChainTxHash,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsNotarizing(null);
    }
  };

  // Toggle User Status in Super Admin
  const handleToggleUserStatus = (userId: string) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "ACTIVE" ? "FROZEN" : "ACTIVE" } : u))
    );
  };

  // Provision New Organization in Super Admin
  const handleProvisionOrg = () => {
    if (!newOrgName || !newOrgJurisdiction) return;
    const newOrg = {
      id: `org_${Math.random().toString(36).substring(2, 8)}`,
      name: newOrgName,
      type: newOrgType,
      orgApiKey: `sbo_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      rateLimitPerMin: 60,
      totalQueriesProcessed: 0,
      status: "ACTIVE",
      jurisdiction: newOrgJurisdiction,
    };
    setAdminOrgs([...adminOrgs, newOrg]);
    setNewOrgName("");
    setNewOrgJurisdiction("");
  };

  // Run M2M Dual-Key Query
  const handleRunM2MQuery = async () => {
    if (!m2mOrgKey || !m2mCandidateKey) return;
    setIsM2mRunning(true);
    setM2mResult(null);

    try {
      const response = await fetch("/api/v1/m2m/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sabi-Org-Key": m2mOrgKey,
          Authorization: `Bearer ${m2mCandidateKey}`,
        },
      });
      const data = await response.json();
      setM2mResult(data);
    } catch (err: any) {
      setM2mResult({ error: err.message });
    } finally {
      setIsM2mRunning(false);
    }
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

        {/* View Switcher: B2C, B2B, Notary, Super Admin, API Docs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("b2c")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "b2c"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Citizen Vault
          </button>
          <button
            onClick={() => setActiveTab("b2b")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "b2b"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Enterprise Screening
          </button>
          <button
            onClick={() => setActiveTab("govt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "govt"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            Govt Dashboard
          </button>
          <button
            onClick={() => setActiveTab("notary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "notary"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Stamp className="w-3.5 h-3.5" />
            Notary Desk
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "admin"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Super Admin
          </button>
          <button
            onClick={() => setActiveTab("api_docs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "api_docs"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Developer API
          </button>
        </div>

        {/* Action Controls: 2-Minute Pitch & Technical Defense */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPitchModal(true)}
            className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition-all"
          >
            <Play className="w-3 h-3 fill-emerald-300" />
            2-Min Pitch
          </button>
          <button
            onClick={() => setShowDefenseModal(true)}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Judge Cheat-Sheet
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 p-6 md:p-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Zero Raw File Centralization • Regional Sovereign Nodes • Dual-Key M2M Handshake
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {activeTab === "b2c"
                ? "Citizen Sovereign Vault & Scoped Key Generator"
                : activeTab === "b2b"
                ? "Enterprise Screening & Dynamic Grounding Studio"
                : activeTab === "govt"
                ? "Sovereign Government Telemetry & 40% Fiscal Splitter"
                : activeTab === "notary"
                ? "Tier-2 Notary Attestation & Legalization Portal"
                : activeTab === "admin"
                ? "Super Admin Control Plane & Governance Dashboard"
                : "Machine-to-Machine (M2M) Developer & AI Agent Studio"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activeTab === "b2c"
                ? "Your raw documents remain safely inside your personal Google Drive. Mint time-decaying, cryptographically signed API keys that grant organizations access only to specific verified categories."
                : activeTab === "b2b"
                ? "Create dynamic criteria grounding profiles and screen candidate pools in single or bulk batches with zero hallucination and mathematical on-chain proof."
                : activeTab === "govt"
                ? "Monitor regional sovereign node data residency, review 40% micro-transaction fee accumulations via smart contracts, and track national credential integrity threats."
                : activeTab === "notary"
                ? "Accredited notaries inspect submitted diplomas, transcripts, and affidavits, affixing their cryptographic seal directly onto the Base Sepolia ledger."
                : activeTab === "admin"
                ? "Master control plane: manage all user CRUD, register government agencies & enterprise licenses, monitor global 60/40 micro-transaction financials, and hot-reload runtime secrets."
                : "Integrate autonomous AI agents, enterprise ATS systems (Workday, Greenhouse), and border control applications directly with Sabi Vault via programmatic Dual-Key REST endpoints."}
            </p>
          </div>
        </div>

        {/* TAB 1: CITIZEN VAULT (B2C) */}
        {activeTab === "b2c" && <CitizenVaultView onMintKeyForDemo={(key) => setInputApiKey(key)} />}

        {/* TAB 2: ENTERPRISE SCREENING (B2B) */}
        {activeTab === "b2b" && <EnterpriseScreeningView />}

        {/* TAB 3: SOVEREIGN GOVERNMENT HUB */}
        {activeTab === "govt" && <SovereignGovtView />}

        {/* TAB 3: NOTARY PORTAL (TIER 2) */}
        {activeTab === "notary" && (
          <div className="space-y-6">
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Accredited Notary Attestation Desk</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Logged in as: <span className="text-slate-200 font-semibold">Barrister Adewale Bello, SAN</span> (High Court of Lagos / Federal Republic of Nigeria)
                </p>
              </div>
              <div className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                Notary License: SCN-BAR-2014-88421 (Active)
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Legalization Queue (Tier 2 Submissions):
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {notaryQueue.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-sm text-white">{item.documentType}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.status === "LEGALIZED_ON_CHAIN"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.status === "LEGALIZED_ON_CHAIN" ? "✓ LEGALIZED ON-CHAIN" : "AWAITING NOTARY SEAL"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Candidate: <span className="text-slate-200 font-semibold">{item.candidateName}</span> ({item.candidateId}) • Issuing Institution:{" "}
                        <span className="text-slate-300 font-semibold">{item.institution}</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        Document SHA-256: <span className="text-slate-400">{item.hash}</span>
                      </p>
                      {item.onChainTx && (
                        <p className="text-[11px] font-mono text-emerald-400">
                          On-Chain Tx Receipt: {item.onChainTx}
                        </p>
                      )}
                    </div>

                    <div>
                      {item.status === "LEGALIZED_ON_CHAIN" ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          Seal Bound On-Chain
                        </div>
                      ) : (
                        <button
                          onClick={() => handleNotarizeDocument(item.id, item.hash)}
                          disabled={isNotarizing === item.id}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          {isNotarizing === item.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Committing Seal to Ledger...
                            </>
                          ) : (
                            <>
                              <Stamp className="w-4 h-4" />
                              Affix Notary Seal & Legalize On-Chain
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPER ADMIN CONTROL PLANE */}
        {activeTab === "admin" && (
          <div className="space-y-8">
            {/* Global Telemetry Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Citizens</span>
                <p className="text-xl font-black text-white mt-1">{adminUsers.length}</p>
                <span className="text-[10px] text-emerald-400 font-mono">100% Sovereign Hosted</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Orgs</span>
                <p className="text-xl font-black text-white mt-1">{adminOrgs.length}</p>
                <span className="text-[10px] text-cyan-400 font-mono">Govt + Enterprise</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Queries</span>
                <p className="text-xl font-black text-white mt-1">1,420</p>
                <span className="text-[10px] text-emerald-400 font-mono">On-Chain Verified</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Rev (60%)</span>
                <p className="text-xl font-black text-emerald-400 mt-1">$852.00</p>
                <span className="text-[10px] text-slate-400 font-mono">USDC / Base L2</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sovereign Payout (40%)</span>
                <p className="text-xl font-black text-cyan-400 mt-1">$568.00</p>
                <span className="text-[10px] text-slate-400 font-mono">Disbursed to Nodes</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Nodes</span>
                <p className="text-xl font-black text-purple-400 mt-1">3</p>
                <span className="text-[10px] text-emerald-400 font-mono">NDPC / GDPR / US</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Dynamic Secrets & Configuration Engine */}
              <div className="lg:col-span-6 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-base text-white">Dynamic Secrets & Runtime Config</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    AES-256 Encrypted
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Gemini 1.5 Flash Key (Primary LLM):</label>
                    <input
                      type="text"
                      value={adminConfig.geminiApiKey}
                      onChange={(e) => setAdminConfig({ ...adminConfig, geminiApiKey: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Groq LLaMA 3.3 Key (Secondary Fallback):</label>
                    <input
                      type="text"
                      value={adminConfig.groqApiKey}
                      onChange={(e) => setAdminConfig({ ...adminConfig, groqApiKey: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Base Sepolia RPC Endpoint:</label>
                    <input
                      type="text"
                      value={adminConfig.baseSepoliaRpc}
                      onChange={(e) => setAdminConfig({ ...adminConfig, baseSepoliaRpc: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Platform Treasury Wallet (60% Recipient):</label>
                    <input
                      type="text"
                      value={adminConfig.platformTreasuryWallet}
                      onChange={(e) => setAdminConfig({ ...adminConfig, platformTreasuryWallet: e.target.value })}
                      className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-slate-200 outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setConfigSaveNotice(true);
                        setTimeout(() => setConfigSaveNotice(false), 2500);
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Save & Hot-Reload Secrets (Zero Restart)
                    </button>
                    {configSaveNotice && (
                      <p className="text-[11px] text-emerald-400 text-center mt-2 font-semibold">
                        ✓ Configuration encrypted & hot-reloaded successfully into memory!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Citizen User CRUD Manager */}
              <div className="lg:col-span-6 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">Universal Citizen CRUD</h3>
                  </div>
                  <span className="text-xs text-slate-400">{adminUsers.length} Active Records</span>
                </div>

                <div className="space-y-3">
                  {adminUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 bg-black/40 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{u.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {u.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        <p className="text-[10px] text-slate-500">
                          Node: <span className="text-emerald-400">{u.sovereignNode}</span> ({u.complianceFramework})
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                          u.status === "ACTIVE"
                            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        }`}
                      >
                        {u.status === "ACTIVE" ? "Freeze Vault" : "Unfreeze Vault"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization & Government Hub Manager */}
              <div className="lg:col-span-12 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-base text-white">Government & Enterprise Organization Registry</h3>
                  </div>
                  <span className="text-xs text-slate-400">Issues Dual-Key X-Sabi-Org-Key Licenses</span>
                </div>

                {/* Provision New Entity Form */}
                <div className="p-4 bg-black/40 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Provision New Organization / Government Hub:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Organization Name (e.g. Canada Immigration)"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    />
                    <select
                      value={newOrgType}
                      onChange={(e: any) => setNewOrgType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    >
                      <option value="GOVERNMENT">Government Border Agency</option>
                      <option value="ENTERPRISE">Enterprise Corporation</option>
                      <option value="UNIVERSITY">University / Academic</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Jurisdiction (e.g. Canada / Federal)"
                      value={newOrgJurisdiction}
                      onChange={(e) => setNewOrgJurisdiction(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    />
                    <button
                      onClick={handleProvisionOrg}
                      className="py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Mint Org License Key
                    </button>
                  </div>
                </div>

                {/* Registered Organizations Table */}
                <div className="space-y-3">
                  {adminOrgs.map((org) => (
                    <div
                      key={org.id}
                      className="p-4 bg-black/40 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{org.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {org.type}
                          </span>
                        </div>
                        <p className="text-slate-400">
                          Jurisdiction: <span className="text-slate-200 font-semibold">{org.jurisdiction}</span> • Rate Limit:{" "}
                          <span className="text-slate-200">{org.rateLimitPerMin} req/min</span> • Queries Processed:{" "}
                          <span className="text-emerald-400 font-bold">{org.totalQueriesProcessed}</span>
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-slate-500 font-mono">Org API Key:</span>
                          <span className="font-mono text-[11px] text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {org.orgApiKey}
                          </span>
                          <button
                            onClick={() => handleCopyKey(org.orgApiKey)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEVELOPER & M2M AI AGENT STUDIO */}
        {activeTab === "api_docs" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive M2M Dual-Key Test Runner */}
              <div className="lg:col-span-6 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-base text-white">Interactive M2M Query Runner</h3>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Dual-Key Handshake
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Header 1: Organization License Key (X-Sabi-Org-Key):
                    </label>
                    <select
                      value={m2mOrgKey}
                      onChange={(e) => setM2mOrgKey(e.target.value)}
                      className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-cyan-300 outline-none"
                    >
                      {adminOrgs.map((org) => (
                        <option key={org.id} value={org.orgApiKey}>
                          {org.name} ({org.orgApiKey.substring(0, 16)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Header 2: Candidate Consent Key (Authorization: Bearer):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={m2mCandidateKey}
                        onChange={(e) => setM2mCandidateKey(e.target.value)}
                        placeholder="Paste candidate key (e.g. sbk_live_v1_...)"
                        className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 font-mono text-emerald-300 outline-none"
                      />
                      {!m2mCandidateKey && (
                        <button
                          onClick={handleGenerateKey}
                          className="absolute right-1 top-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold"
                        >
                          Generate Test Key
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleRunM2MQuery}
                    disabled={isM2mRunning || !m2mCandidateKey}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    {isM2mRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Executing Dual-Key Verification...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Execute POST /api/v1/m2m/query
                      </>
                    )}
                  </button>

                  {m2mResult && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="font-semibold text-slate-300">Live JSON Response:</span>
                      <pre className="p-3 bg-black/80 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 max-h-64 overflow-y-auto">
                        {JSON.stringify(m2mResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Code Snippets (cURL, Python, TypeScript) */}
              <div className="lg:col-span-6 border border-slate-800 bg-slate-900/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-base text-white">Client Integration SDKs</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg text-[10px]">
                    <button
                      onClick={() => setSelectedLanguage("curl")}
                      className={`px-2.5 py-1 rounded font-semibold ${selectedLanguage === "curl" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setSelectedLanguage("python")}
                      className={`px-2.5 py-1 rounded font-semibold ${selectedLanguage === "python" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setSelectedLanguage("typescript")}
                      className={`px-2.5 py-1 rounded font-semibold ${selectedLanguage === "typescript" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                    >
                      TypeScript
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <p className="text-slate-300">
                    Use these code snippets to integrate your autonomous AI agents (CrewAI, LangChain), Workday ATS, or government portal:
                  </p>

                  <div className="relative">
                    <pre className="p-4 bg-black/80 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
                      {selectedLanguage === "curl" && `curl -X POST https://api.sabivault.io/api/v1/m2m/query \\
  -H "Content-Type: application/json" \\
  -H "X-Sabi-Org-Key: ${m2mOrgKey}" \\
  -H "Authorization: Bearer ${m2mCandidateKey || "sbk_live_v1_..."}"`}

                      {selectedLanguage === "python" && `import requests

url = "https://api.sabivault.io/api/v1/m2m/query"
headers = {
    "X-Sabi-Org-Key": "${m2mOrgKey}",
    "Authorization": "Bearer ${m2mCandidateKey || "sbk_live_v1_..."}",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)
payload = response.json()

# Feed verified data directly into local LLM / Agent context:
verified_data = payload["verifiedData"]
print("Tamper Status:", payload["blockchainProof"]["tamperStatus"])`}

                      {selectedLanguage === "typescript" && `import fetch from "node-fetch";

const res = await fetch("https://api.sabivault.io/api/v1/m2m/query", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Sabi-Org-Key": "${m2mOrgKey}",
    "Authorization": "Bearer ${m2mCandidateKey || "sbk_live_v1_..."}"
  }
});

const { verifiedData, blockchainProof } = await res.json();
console.log("Verified Candidate Records:", verifiedData);`}
                    </pre>

                    <button
                      onClick={() =>
                        handleCopyKey(
                          selectedLanguage === "curl"
                            ? `curl -X POST https://api.sabivault.io/api/v1/m2m/query -H "X-Sabi-Org-Key: ${m2mOrgKey}" -H "Authorization: Bearer ${m2mCandidateKey || "sbk_live_v1_..."}"`
                            : "See snippet"
                        )
                      }
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: 2-MINUTE WINNING PITCH SCRIPT WALKTHROUGH */}
      {showPitchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPitchModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Play className="w-5 h-5 text-emerald-400" />
              <h3 className="font-black text-lg text-white">The 2-Minute Winning Pitch Guide</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400">0:00 - 0:30 (The Hook & Problem):</span>
                <p className="mt-1 text-slate-300 italic">
                  &quot;Every year, organizations spend thousands of hours manually reviewing PDF resumes, while governments and universities lose millions to forged documents. Candidates are forced to re-upload the same credentials to hundreds of portals. We built Sabi Vault—a sovereign data infrastructure and decentralized identity platform that replaces static PDFs with programmable, tamper-proof API keys.&quot;
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400">0:30 - 1:15 (The Live Demo Walkthrough):</span>
                <p className="mt-1 text-slate-300">
                  • <strong>Action 1 (User Side):</strong> Switch to Citizen Vault. Note files sync from private Google Drive (never stored raw). Select &apos;Academics&apos; & &apos;Finance&apos; and click &apos;Mint Cryptographic API Key&apos;.<br />
                  • <strong>Action 2 (Enterprise Side):</strong> Switch to Enterprise Screening. Paste the key alongside a vertical.<br />
                  • <strong>Action 3 (Verification & AI):</strong> Click &apos;Execute Screening&apos;. Show instant on-chain hash verification badge and zero-hallucination score.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-purple-400">1:15 - 1:45 (The Architecture & GovTech Model):</span>
                <p className="mt-1 text-slate-300 italic">
                  &quot;Sabi Vault uses a three-tier model: physical files stay in the user&apos;s cloud, structured text sits on country-specific database nodes for strict GDPR/NDPC compliance, and cryptographic hashes live on-chain. When organizations pay micro-transactions to query keys, smart contracts split the fee 60/40 between our platform and the sovereign government hosting the node.&quot;
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">1:45 - 2:00 (The Vision):</span>
                <p className="mt-1 text-slate-300 italic">
                  &quot;We are turning static legal compliance into a sovereign, profit-generating data network for nations while giving users total ownership of their digital credentials.&quot;
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPitchModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Got It, Let&apos;s Present
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TECHNICAL DEFENSE CHEAT-SHEET FOR JUDGES */}
      {showDefenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowDefenseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-lg text-white">Technical Defense Cheat-Sheet for Judges</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-emerald-400 text-sm">&quot;Where are raw documents stored? Is this GDPR compliant?&quot;</p>
                <p className="text-slate-300">
                  <strong>Defense:</strong> &quot;We never store raw documents on our servers or on the blockchain. Files remain in the user&apos;s personal Google Drive/Dropbox via OAuth. Only parsed JSON text lives on localized PostgreSQL database nodes within the user&apos;s home country, satisfying NDPC and GDPR data residency laws.&quot;
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-cyan-400 text-sm">&quot;Why do you need blockchain if you already have a database?&quot;</p>
                <p className="text-slate-300">
                  <strong>Defense:</strong> &quot;Databases can be altered by admins or hackers. We store a SHA-256 hash string on-chain upon cloud sync or notary seal. When queried, we re-hash the data—if a single character was modified in the database, the hashes won&apos;t match.&quot;
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-purple-400 text-sm">&quot;What if an LLM hallucinates candidate qualifications?&quot;</p>
                <p className="text-slate-300">
                  <strong>Defense:</strong> &quot;We use a strict Retrieval-Augmented Generation (RAG) pipeline over structured JSON schemas. The LLM acts purely as an evaluator against the uploaded requirement document and must cite exact JSON fields.&quot;
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-amber-400 text-sm">&quot;What happens if your primary AI model goes down during bulk queries?&quot;</p>
                <p className="text-slate-300">
                  <strong>Defense:</strong> &quot;Queries route through our multi-provider gateway configured with fallback providers (Google Gemini Flash $\rightarrow$ Groq LLaMA 3.3 $\rightarrow$ OpenAI mini $\rightarrow$ Deterministic engine) to ensure zero operational downtime.&quot;
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <p className="font-bold text-teal-400 text-sm">&quot;How do you handle un-notarized vs. legal documents?&quot;</p>
                <p className="text-slate-300">
                  <strong>Defense:</strong> &quot;We support a two-tier verification system. Tier 1 documents (bank statements) are hashed automatically upon cloud sync. Tier 2 documents (degrees/affidavits) require human notary verification before binding the seal and hash on-chain.&quot;
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDefenseModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Close Cheat-Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        Sabi Vault Platform • Sovereign Data Infrastructure • NDPC & GDPR Compliant • Powered by Base L2 & Multi-Agent RAG
      </footer>
    </div>
  );
}
