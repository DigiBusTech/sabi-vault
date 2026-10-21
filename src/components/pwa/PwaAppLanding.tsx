"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Key,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  Cpu,
  Globe2,
  AlertTriangle,
  FileCheck2,
  UserCheck,
  Check,
  LogIn,
  Fingerprint,
} from "lucide-react";
import { ArrowRightAnimated, ShieldCheckAnimated } from "@/components/ui/animated-icons";
import { SolutionsSlides } from "@/components/pwa/SolutionsSlides";
import { MobileBottomNav } from "@/components/pwa/MobileBottomNav";

export function PwaAppLanding() {
  // Tamper Simulation State
  const [isTampered, setIsTampered] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [faceIdSuccess, setFaceIdSuccess] = useState(false);

  const authenticGpa = "4.80 / 5.00 (First Class)";
  const authenticHash = "0x8f3c7e92b1a4506c71f83b9a02d4e61c8a7f9201bcde45f6120489a71b234567";
  const tamperedGpa = "4.95 / 5.00 (Manipulated)";
  const computedHashTampered = "0x91d4a8220cb3185ef9a2c81045b61f930e18471cba8104598127394857102934";

  const triggerFaceIdScan = () => {
    setFaceIdActive(true);
    setFaceIdSuccess(false);
    setTimeout(() => {
      setFaceIdActive(false);
      setFaceIdSuccess(true);
      setTimeout(() => setFaceIdSuccess(false), 3000);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-600 selection:text-white pb-24 md:pb-16">
      {/* 1. NATIVE APP TOP HEADER BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 512 512">
                <path d="M256 64L392 124V252C392 344.4 334.4 429.2 256 452C177.6 429.2 120 344.4 120 252V124L256 64Z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-poppins text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                SabiProfile
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mt-0.5">
                Sovereign OS
              </span>
            </div>
          </Link>

          {/* Network Ticker Pill (Desktop & Tablet) */}
          <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Base Sepolia L2 • Block #19,421,802</span>
          </div>

          {/* Clean Auth Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#059669] px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRightAnimated size={12} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. ONBOARDING INTRO HERO */}
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Sovereign Identity &amp; Credential Platform</span>
          </div>

          <h1 className="font-poppins text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Zero-Forged Records. Instant Sovereign Trust.
          </h1>

          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Physical documents stay in your private cloud. Only cryptographically attested SHA-256 proofs cross borders and enterprise screening desks.
          </p>
        </section>

        {/* 3. SOLUTIONS SLIDES: 4 PILLARS (IMMIGRATION, EDUCATION, LABOUR, CITIZEN VAULT) */}
        <div id="solutions-section">
          <SolutionsSlides />
        </div>

        {/* 4. NATIVE INTERACTIVE CARDS WITH RICH GRAPHIC DESIGNS */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="font-poppins text-xl sm:text-2xl font-extrabold text-slate-900">
              Native Sovereign Capabilities
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Engineered with biometric enclaves, localized sovereign nodes, and EVM anchors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Citizen Sovereign Vault */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <Key size={20} />
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Sovereign B2C
                  </span>
                </div>

                <h3 className="mt-4 font-poppins text-lg font-bold text-slate-900">
                  Citizen Sovereign Vault
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  OAuth sync with Google Drive or Dropbox. Organized into 6 schema-validated domains: Finance, Academics, Experience, Certifications, Portfolio, and Achievements.
                </p>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="flex justify-between text-slate-700">
                    <span>Active Citizen:</span>
                    <strong className="text-slate-900">Chinwe Okafor</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Central Storage:</span>
                    <strong className="text-emerald-700">0 Raw Files (Zero Risk)</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>EVM Network:</span>
                    <strong className="text-slate-900">Base Sepolia L2</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  href="/login?mode=signup"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>Open Citizen Vault</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Card 2: Interactive FaceID & NFC Biometrics */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <Smartphone size={20} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    Mobile Enclave
                  </span>
                </div>

                <h3 className="mt-4 font-poppins text-lg font-bold text-slate-900">
                  Biometric FaceID &amp; NFC Attestation
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Hardware-bound cryptographic keys. Mint temporary scoped keys or tap NFC to share verified credentials with embassies without exposing physical PDFs.
                </p>

                {/* FaceID Interactive Simulator */}
                <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-center text-white space-y-2">
                  <div className="flex items-center justify-center">
                    {faceIdActive ? (
                      <div className="h-12 w-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin flex items-center justify-center">
                        <Lock size={16} className="text-emerald-400" />
                      </div>
                    ) : faceIdSuccess ? (
                      <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center animate-bounce">
                        <Check size={20} className="text-white" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                        <Fingerprint size={22} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-bold">
                    {faceIdActive
                      ? "Scanning Secure Enclave Biometrics..."
                      : faceIdSuccess
                      ? "Biometric Identity Confirmed! (FaceID Attested)"
                      : "Hardware Enclave Ready"}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Tap below to simulate on-device cryptographic key authorization.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={triggerFaceIdScan}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Simulate FaceID Unlock</span>
                </button>
              </div>
            </div>

            {/* Card 3: Enterprise & Sovereign Regional Nodes */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <Globe2 size={20} />
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    GovTech 60/40
                  </span>
                </div>

                <h3 className="mt-4 font-poppins text-lg font-bold text-slate-900">
                  Sovereign Nodes &amp; Compliance
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  PostgreSQL database nodes partitioned by regional sovereignty: NDPC (Nigeria), GDPR (European Union), and US Privacy. Micro-transaction queries execute a smart-contract 60/40 revenue split.
                </p>

                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-600">ng-west-africa (Lagos):</span>
                    <strong className="text-emerald-700">100% NDPC Compliant</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-600">eu-central (Frankfurt):</span>
                    <strong className="text-emerald-700">100% GDPR Compliant</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
                    <span className="text-slate-600">Smart Contract Split:</span>
                    <strong className="text-slate-900">60% Platform • 40% Host</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link
                  href="/government"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>View Sovereign Telemetry</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE ANTI-TAMPER SHIELD DEMONSTRATION SECTION */}
        <section id="tamper-simulation-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 p-5 sm:p-8 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <ShieldCheckAnimated size={13} strokeWidth={2.4} />
                  <span>Real-Time Cryptographic Verification Simulator</span>
                </span>
                <h3 className="mt-2 font-poppins text-xl sm:text-2xl font-extrabold text-white">
                  Fail-Closed Anti-Tamper Shield
                </h3>
                <p className="mt-1 text-xs text-slate-400 max-w-xl">
                  Simulate modifying candidate records in the database. SabiProfile re-computes SHA-256 in 4ms and rejects tampering against the Base Sepolia ledger anchor.
                </p>
              </div>

              {/* Simulation Toggle Switch */}
              <div className="flex items-center gap-2 rounded-2xl bg-slate-800/80 p-1.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsTampered(false)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    !isTampered
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Authentic Record
                </button>
                <button
                  type="button"
                  onClick={() => setIsTampered(true)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isTampered
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tampered Data
                </button>
              </div>
            </div>

            {/* Live Comparison View */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Database Payload */}
              <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">Structured Database Record (JSON):</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isTampered
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {isTampered ? "FORGED PAYLOAD" : "GENUINE RECORD"}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] space-y-1 text-slate-300">
                  <p>&quot;candidate&quot;: &quot;Chinwe Okafor&quot;,</p>
                  <p>&quot;degree&quot;: &quot;B.Sc Computer Science&quot;,</p>
                  <p>
                    &quot;gpa&quot;:{" "}
                    <span
                      className={
                        isTampered
                          ? "text-rose-400 font-bold"
                          : "text-emerald-400 font-bold"
                      }
                    >
                      &quot;{isTampered ? tamperedGpa : authenticGpa}&quot;
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Re-Computed SHA-256 Hash:</span>
                  <p className="font-mono text-[10px] text-slate-300 break-all mt-0.5">
                    {isTampered ? computedHashTampered : authenticHash}
                  </p>
                </div>
              </div>

              {/* Blockchain Immutable Anchor */}
              <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">Base Sepolia Blockchain Anchor:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    IMMUTABLE LEDGER
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] space-y-1 text-slate-300">
                  <p>&quot;contract&quot;: &quot;SabiProfileRegistry.sol&quot;,</p>
                  <p>&quot;block&quot;: 19421802,</p>
                  <p className="break-all">
                    &quot;anchorHash&quot;:{" "}
                    <span className="text-emerald-400 break-all">
                      {authenticHash}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Attestation Status:</span>
                  <p className="mt-1">
                    {!isTampered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 px-2.5 py-1 font-bold text-xs">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>TAMPER_FREE (100% Cryptographic Match)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/30 text-rose-300 px-2.5 py-1 font-bold text-xs">
                        <AlertTriangle size={14} className="text-rose-400" />
                        <span>FRAUD_DETECTED: Hash Mismatch (4ms Fail-Closed)</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. NATIVE APP ONBOARDING AUTHENTICATION DOCK */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-6 sm:p-10 text-center shadow-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
              <Key size={13} className="text-emerald-700" />
              <span>Sovereign Identity Onboarding</span>
            </span>
            <h3 className="font-poppins text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to create your sovereign vault?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Connect your private cloud drive, mint scoped cryptographic keys, and share tamper-proof verification proofs with employers, universities, and embassies.
            </p>

            {/* Authentication Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#059669] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-[#047857] hover:scale-105 active:scale-95 transition-all"
              >
                <Key size={15} />
                <span>Create Sovereign Vault</span>
                <ArrowRightAnimated size={14} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-800 shadow-sm hover:border-emerald-600 hover:text-emerald-700 active:scale-95 transition-all"
              >
                <Lock size={15} className="text-emerald-600" />
                <span>Log In to Existing Vault</span>
              </Link>
            </div>

            {/* Security Proof Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-montserrat border-t border-slate-100 pt-5">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Zero Physical Documents Centralized</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>SHA-256 On-Chain Ledger Anchors</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>NDPC &amp; GDPR Sovereign Node Compliance</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav />
    </div>
  );
}
