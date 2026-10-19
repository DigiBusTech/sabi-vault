"use client";

import React, { useState } from "react";
import {
  ShieldCheckAnimated,
  FingerprintAnimated,
  FileCheckAnimated,
  Building2Animated,
  LockAnimated,
  ArrowRightAnimated,
  CheckCircle2Animated,
  PlayAnimated,
  SparklesAnimated,
  CpuAnimated,
} from "@/components/ui/animated-icons";
import { AlertTriangle, XCircle, RotateCcw, Link2, Hash, Coins, Layers } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { IPhone14Mockup } from "@/components/IPhone14Mockup";
import { Reveal } from "@/components/marketing/Reveal";

interface VerificationStep {
  agent: string;
  action: string;
  status: "pending" | "running" | "passed" | "failed";
  latency: string;
  detail: string;
}

const PRESET_SCENARIOS = [
  {
    id: "visa",
    title: "Global Tech Visa Screening",
    org: "UK Visas & Immigration Border Agency",
    scopes: ["finance", "academics"],
    candidate: "Chinwe Okafor (Lagos, Nigeria)",
    presetKey: "sbk_live_v1_visa_uk_gov_2026_finance_academics_9921",
    rubric: "BSc in Engineering, minimum $5,000 liquid funds, Tier 2 notary attestation.",
  },
  {
    id: "employment",
    title: "Staff Systems Engineer Hiring Audit",
    org: "Stripe / Paystack Global Recruitment",
    scopes: ["experience", "certifications", "academics"],
    candidate: "Chinwe Okafor (Lagos, Nigeria)",
    presetKey: "sbk_live_v1_stripe_eng_2026_experience_certs_academics_7710",
    rubric: "3+ years distributed systems, AWS Solutions Architect Pro, verified reference.",
  },
  {
    id: "admissions",
    title: "Postgraduate University Admissions",
    org: "University of Toronto Faculty of Engineering",
    scopes: ["academics", "achievements"],
    candidate: "Chinwe Okafor (Lagos, Nigeria)",
    presetKey: "sbk_live_v1_utoronto_grad_2026_academics_achievements_3391",
    rubric: "First Class Honours (GPA >= 4.5/5.0), accredited institutional seal, tech award.",
  },
];

export function InteractiveStudio() {
  const [selectedScenario, setSelectedScenario] = useState(PRESET_SCENARIOS[0]);
  const [activeApiKey, setActiveApiKey] = useState(PRESET_SCENARIOS[0].presetKey);
  const [isTampered, setIsTampered] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // When citizen mints a key on the iPhone mockup
  const handleKeyMintedFromPhone = (mintedKey: string) => {
    setActiveApiKey(mintedKey);
    setAuditComplete(false);
    setCurrentStepIndex(-1);
  };

  const handleScenarioChange = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setActiveApiKey(scenario.presetKey);
    setIsTampered(false);
    setAuditComplete(false);
    setCurrentStepIndex(-1);
  };

  const runVerificationAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setCurrentStepIndex(0);

    const stepIntervals = [600, 1200, 1800, 2400];
    stepIntervals.forEach((delay, idx) => {
      setTimeout(() => {
        setCurrentStepIndex(idx + 1);
        if (idx === stepIntervals.length - 1) {
          setIsAuditing(false);
          setAuditComplete(true);
        }
      }, delay);
    });
  };

  const resetAudit = () => {
    setIsAuditing(false);
    setAuditComplete(false);
    setCurrentStepIndex(-1);
    setIsTampered(false);
  };

  return (
    <section id="interactive-studio" className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      {/* Section Header with Double-Bezel Eyebrow Badge */}
      <Reveal>
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#059669] text-white">
              <CpuAnimated size={13} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f172a]">
              Interactive Simulation Studio • Live Dual-Key Architecture
            </span>
          </div>
          <h2 className="mt-5 font-poppins text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
            Experience the sovereign verification pipeline in real time.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Interact with the citizen&apos;s private vault on the iPhone 14 Pro below. Mint a cryptographic scoped consent key, then watch the Enterprise Screening Terminal verify the immutable Base Sepolia ledger and execute strict zero-hallucination evaluation.
          </p>
        </div>
      </Reveal>

      {/* Scenario Switcher Pills */}
      <Reveal delay={100}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {PRESET_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleScenarioChange(scen)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                selectedScenario.id === scen.id
                  ? "bg-[#0f172a] text-white shadow-md scale-105"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{scen.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                selectedScenario.id === scen.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {scen.scopes.join(" + ")}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Studio Workbench: Dual-Column Hardware vs Terminal */}
      <div className="mt-14 grid items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Citizen Mobile Studio (iPhone 14 Pro) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full text-center lg:text-left mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#059669]">
              1. Citizen Mobile Node
            </span>
            <h3 className="font-poppins text-xl font-bold text-[#0f172a]">
              Private Citizen Vault
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Tap categories or tap &quot;Mint Scoped Key&quot; inside the phone to pass a live cryptographic key to the terminal.
            </p>
          </div>

          <div className="relative w-full flex justify-center py-2">
            <IPhone14Mockup
              finish="space-black"
              scale={0.96}
              initialTab="vault"
              onKeyMinted={handleKeyMintedFromPhone}
            />
          </div>
        </div>

        {/* Right Column: Enterprise Verification Terminal */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="text-center lg:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#059669]">
              2. Enterprise Verification Terminal
            </span>
            <h3 className="font-poppins text-xl font-bold text-[#0f172a]">
              Multi-Agent Zero-Hallucination Pipeline
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Evaluates strictly verified structured JSON facts against requirement rubrics without ever storing or viewing raw citizen PDFs.
            </p>
          </div>

          {/* Double-Bezel Terminal Enclosure */}
          <div className="rounded-[2rem] border border-slate-200 bg-slate-100/70 p-2 shadow-xl">
            <div className="rounded-[calc(2rem-0.5rem)] border border-slate-200 bg-white p-6 shadow-sm">
              {/* Terminal Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-[#059669] animate-pulse" />
                  <span className="font-mono text-xs font-bold text-[#0f172a]">
                    BASE SEPOLIA CONSENSUS (CHAIN ID: 84532)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600">
                    Smart Contract: 0x89f4b32...
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-[#059669]">
                    NDPC &amp; GDPR Node
                  </span>
                </div>
              </div>

              {/* Active Scoped Key Input Display */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate Bearer Consent Token
                  </span>
                  <span className="text-[10px] font-mono text-[#059669]">
                    HMAC-SHA256 SIGNED
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 overflow-hidden">
                  <span className="font-mono text-xs font-bold text-[#0f172a] truncate">
                    {activeApiKey}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>Target Candidate: <strong className="text-slate-800">{selectedScenario.candidate}</strong></span>
                  <span>•</span>
                  <span>Permitted Scopes: <strong className="text-[#059669]">{selectedScenario.scopes.join(", ")}</strong></span>
                </div>
              </div>

              {/* Interactive Tamper Injection Toggle (The Anti-Fraud Demonstration) */}
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 transition-colors hover:border-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isTampered ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                    }`}>
                      <AlertTriangle size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a]">
                        Interactive Anti-Tamper Demonstration
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Simulate malicious database modification (+₦10,000,000 to liquid balance or forged First Class GPA).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsTampered(!isTampered);
                      setAuditComplete(false);
                      setCurrentStepIndex(-1);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      isTampered
                        ? "bg-red-600 text-white shadow-sm ring-2 ring-red-300"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {isTampered ? "Tampering Active (Hash Broken)" : "Inject Tamper Attack"}
                  </button>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={runVerificationAudit}
                  disabled={isAuditing}
                  className="inline-flex items-center gap-2 rounded-full bg-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#047857] active:scale-[0.98] disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Executing Multi-Agent Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <PlayAnimated size={15} />
                      <span>Run Multi-Agent Verification Audit</span>
                    </>
                  )}
                </button>

                <button
                  onClick={resetAudit}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw size={13} />
                  <span>Reset State</span>
                </button>
              </div>

              {/* Pipeline Step Tracing Output */}
              <div className="mt-6 space-y-2.5">
                {/* Step 1: Integrity Agent */}
                <div className={`rounded-xl border p-3.5 transition-all ${
                  currentStepIndex >= 1
                    ? isTampered
                      ? "border-red-300 bg-red-50/70"
                      : "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#0f172a]">
                      <FingerprintAnimated size={15} className={isTampered ? "text-red-600" : "text-[#059669]"} />
                      <span>Agent 1: Cryptographic Integrity Agent</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Latency: 4ms</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {currentStepIndex >= 1 ? (
                      isTampered ? (
                        <strong className="text-red-700">
                          CRITICAL INTEGRITY FAILURE: Recomputed SHA-256 (386bef83...) !== Base Sepolia Anchor (c770fb92...). Execution failed closed!
                        </strong>
                      ) : (
                        <span className="text-[#047857]">
                          ✓ Recomputed SHA-256 matches Base Sepolia on-chain hash (3e2849e7...). Zero post-issuance modification verified.
                        </span>
                      )
                    ) : (
                      "Awaiting execution..."
                    )}
                  </p>
                </div>

                {/* Step 2: Criteria Agent */}
                <div className={`rounded-xl border p-3.5 transition-all ${
                  currentStepIndex >= 2 && !isTampered
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#0f172a]">
                      <FileCheckAnimated size={15} className="text-[#059669]" />
                      <span>Agent 2: Criteria Ingestion Agent</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Latency: 12ms</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {currentStepIndex >= 2 && !isTampered ? (
                      <span className="text-[#047857]">
                        ✓ Deconstructed {selectedScenario.org} requirements into 4 deterministic rubric thresholds (Weight: Academics 40%, Finance 30%, Experience 30%).
                      </span>
                    ) : (
                      "Awaiting criteria parsing..."
                    )}
                  </p>
                </div>

                {/* Step 3: Strict RAG Evaluator */}
                <div className={`rounded-xl border p-3.5 transition-all ${
                  currentStepIndex >= 3 && !isTampered
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#0f172a]">
                      <ShieldCheckAnimated size={15} className="text-[#059669]" />
                      <span>Agent 3: Strict RAG Evaluator (Zero Hallucination)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Latency: 48ms</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {currentStepIndex >= 3 && !isTampered ? (
                      <span className="text-[#047857]">
                        ✓ Evaluated verified structured JSON against criteria. Factual citations: BSc Computer Engineering (GPA 4.84, Unilag), Liquid Balance: ₦8,750,000 (Zenith Bank). Score: 96/100 (HIGHLY QUALIFIED).
                      </span>
                    ) : (
                      "Awaiting factual evaluation..."
                    )}
                  </p>
                </div>

                {/* Step 4: GovTech 60/40 Split Receipt */}
                <div className={`rounded-xl border p-3.5 transition-all ${
                  currentStepIndex >= 4 && !isTampered
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#0f172a]">
                      <Coins size={15} className="text-[#059669]" />
                      <span>Smart Contract Settlement: GovTech 60/40 Micro-Split</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">On-Chain TX</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {currentStepIndex >= 4 && !isTampered ? (
                      <span className="text-[#047857]">
                        ✓ $1.00 Query Fee atomically distributed via Base smart contract: <strong>$0.60 to Sabi Platform Treasury</strong> (60%) and <strong>$0.40 to Nigeria Sovereign Host Node Hub</strong> (40%).
                      </span>
                    ) : (
                      "Awaiting transaction finality..."
                    )}
                  </p>
                </div>
              </div>

              {/* Final Dossier Summary Card when Complete */}
              {auditComplete && (
                <div className={`mt-6 rounded-2xl liquid-glass-card p-5 transition-all ${
                  isTampered
                    ? "border-red-300 bg-red-50/80 text-red-900"
                    : "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isTampered ? (
                        <XCircle size={22} className="text-red-600" />
                      ) : (
                        <CheckCircle2Animated size={22} className="text-[#059669]" />
                      )}
                      <div>
                        <h4 className="font-poppins text-base font-bold">
                          {isTampered
                            ? "AUDIT REJECTED: TAMPER DETECTED"
                            : "CANDIDATE CLEARED: HIGHLY QUALIFIED (96/100)"}
                        </h4>
                        <p className="text-xs">
                          {isTampered
                            ? "On-chain mathematical hash failed comparison. Candidate data was isolated and no unverified claims entered the evaluation."
                            : `All requested credentials successfully proven against the Base Sepolia ledger. Zero hallucination verified.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

