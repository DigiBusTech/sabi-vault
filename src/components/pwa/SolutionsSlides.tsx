"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Key,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  FileCheck2,
  Building2,
  Plane,
  Scale,
  Zap,
} from "lucide-react";
import { ArrowRightAnimated, ShieldCheckAnimated } from "@/components/ui/animated-icons";

export interface SolutionSlide {
  id: string;
  pill: string;
  title: string;
  tagline: string;
  description: string;
  sectorIcon: React.ElementType;
  metrics: { label: string; value: string }[];
  visual: React.ReactNode;
  ctaText: string;
  ctaHref: string;
  accentColor: string;
}

export function SolutionsSlides() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides: SolutionSlide[] = [
    {
      id: "immigration",
      pill: "Pillar 1: Immigration & Border Security",
      title: "Zero-Forged Passports. Instant Border Proofs.",
      tagline: "4ms cryptographic clearance for global mobility.",
      description:
        "Embassies and visa officers spend billions manually reviewing paper bank statements, affidavits, and forged proof of funds. SabiProfile turns physical financial records and travel documents into immutable cryptographic proofs. Physical files stay in the applicant's private cloud; only verified mathematics cross borders.",
      sectorIcon: Plane,
      accentColor: "#059669",
      metrics: [
        { label: "Verification Latency", value: "4ms" },
        { label: "Tamper Proofing", value: "100%" },
        { label: "Central Storage", value: "0 bytes" },
      ],
      ctaText: "Explore Immigration Verification",
      ctaHref: "/government",
      visual: (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                🛂
              </span>
              <div>
                <p className="font-poppins text-xs font-bold text-slate-900">Sovereign Visa Clearance Dossier</p>
                <p className="text-[10px] text-slate-500">Applicant: Chinwe Okafor • Nigerian Citizen</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              EVM Verified
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Proof of Liquid Funds:</span>
              <span className="font-mono font-bold text-emerald-700">₦8,750,000 (~$6,200)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Bank Source Attestation:</span>
              <span className="font-semibold text-slate-900">Zenith Bank PLC (OAuth Synced)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Base L2 Anchor Hash:</span>
              <span className="font-mono text-[10px] text-slate-500">0x8f3c...e421</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Data Sovereignty:</span>
              <span className="font-bold text-emerald-800">NDPC & GDPR Compliant</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-[11px] text-emerald-900 font-medium">
            <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
            <span>Passed 100% border criteria check with zero physical paperwork.</span>
          </div>
        </div>
      ),
    },
    {
      id: "education",
      pill: "Pillar 2: Higher Education & Academics",
      title: "Tamper-Proof Degrees & Transcripts.",
      tagline: "Institutional attestation bound permanently on-chain.",
      description:
        "Academic institutions lose credibility to forged diplomas, manipulated GPAs, and altered transcripts. SabiProfile provides a Two-Tier Verification hierarchy: Tier 1 standard cryptographic hashing upon graduation, and Tier 2 legal notarization by authorized registrars with cryptographic digital seals anchored to Base Sepolia.",
      sectorIcon: GraduationCap,
      accentColor: "#059669",
      metrics: [
        { label: "Transcript Forgery", value: "0%" },
        { label: "Ledger Network", value: "Base L2" },
        { label: "Notary Seals", value: "Tier 2 Legal" },
      ],
      ctaText: "Verify Academic Credentials",
      ctaHref: "/login?mode=signup",
      visual: (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                🎓
              </span>
              <div>
                <p className="font-poppins text-xs font-bold text-slate-900">Federal University of Technology</p>
                <p className="text-[10px] text-slate-500">Bachelor of Science, Computer Science</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Tier-2 Legalized
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Honours & GPA:</span>
              <span className="font-bold text-slate-900">First Class Honours (4.80 / 5.00)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Accredited Notary Seal:</span>
              <span className="font-mono text-emerald-700">Bar #SCN-BAR-2014-88421</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-600">Cryptographic Seal Signature:</span>
              <span className="font-mono text-[10px] text-slate-500">0x71f8...3b9a (Verified)</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 p-3 text-white text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Immutable Ledger Anchor</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">Block #19,421,802</span>
          </div>
        </div>
      ),
    },
    {
      id: "enterprise",
      pill: "Pillar 3: Labour & Enterprise Hiring",
      title: "Deterministic Multi-Agent Screening.",
      tagline: "Zero-hallucination candidate qualification audits.",
      description:
        "Human recruiters waste weeks reading inflated PDF resumes. SabiProfile runs a multi-agent screening pipeline: the Integrity Agent checks on-chain hashes, the Criteria Agent deconstructs job specs into rubrics, and the Strict RAG Evaluator scores candidates mathematically against actual verified data with zero hallucinations.",
      sectorIcon: Briefcase,
      accentColor: "#059669",
      metrics: [
        { label: "Evaluation Speed", value: "< 2.4s" },
        { label: "Hallucination Risk", value: "0.00%" },
        { label: "GovTech Split", value: "60% / 40%" },
      ],
      ctaText: "Launch Enterprise Screening",
      ctaHref: "/enterprise",
      visual: (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                🏢
              </span>
              <div>
                <p className="font-poppins text-xs font-bold text-slate-900">Multi-Agent Evaluation Audit</p>
                <p className="text-[10px] text-slate-500">Role: Senior Distributed Systems Architect</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
              Score: 94 / 100
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-600">1. Integrity Agent:</span>
              <span className="font-bold text-emerald-700">TAMPER_FREE (100% Match)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-600">2. Criteria Agent:</span>
              <span className="font-semibold text-slate-800">4 Core Rubrics Ingested</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-600">3. Strict RAG Evaluator:</span>
              <span className="font-bold text-emerald-700">No Hallucinations • Cites JSON</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100">
              <span className="text-slate-600">4. Fraud Radar:</span>
              <span className="font-semibold text-slate-800">0 Timeline Anomalies Flagged</span>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-[11px] text-emerald-900">
            <strong>GovTech Micro-Split:</strong> $0.60 Platform (60%) • $0.40 Sovereign Node Host (40%)
          </div>
        </div>
      ),
    },
    {
      id: "sovereignty",
      pill: "Citizen Freedom: Scoped Consent Keys",
      title: "Programmable Keys. You Own Your Data.",
      tagline: "Fine-grained cryptographic consent with instant revocation.",
      description:
        "Never send an unencrypted PDF resume or bank statement into a recruiter's email inbox again. SabiProfile lets citizens mint cryptographically signed API keys. Choose which categories to reveal, set an expiration countdown (e.g. 7 days), restrict queries to a specific organization, or revoke access instantly with a single tap.",
      sectorIcon: Key,
      accentColor: "#059669",
      metrics: [
        { label: "Signing Standard", value: "HMAC-SHA256" },
        { label: "Revocation Time", value: "< 5ms" },
        { label: "Category Redaction", value: "100% Strict" },
      ],
      ctaText: "Create Your Sovereign Vault",
      ctaHref: "/login?mode=signup",
      visual: (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                🔑
              </span>
              <div>
                <p className="font-poppins text-xs font-bold text-slate-900">Live Scoped API Key Engine</p>
                <p className="text-[10px] text-slate-500">Citizen: usr_chinwe_okafor_7721</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 font-mono">
              sbk_live_v1
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-xl bg-slate-900 p-3 text-emerald-300 font-mono text-[11px] break-all border border-slate-800">
              sbk_live_v1_eyJyZXNpZGVuY2VDb3VudHJ5IjoiTmlnZXJpYSJ9.7f2a9c1e
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-900 border border-emerald-200">
                <span className="block font-bold">Allowed Scopes:</span>
                <span>academics, finance</span>
              </div>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-900 border border-rose-200">
                <span className="block font-bold">Redacted Scopes:</span>
                <span>experience, portfolio</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <span>Time-To-Live (TTL): <strong>7 Days Remaining</strong></span>
              <button
                type="button"
                className="rounded-lg bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-800 hover:bg-rose-200"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const current = slides[activeIdx];
  const SectorIcon = current.sectorIcon;

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-xs">
          <Sparkles size={12} className="text-emerald-600" />
          <span>The SabiProfile Sovereign Solution</span>
        </div>
        <h2 className="mt-3 font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Three Global Pillars, One Mathematical Trust Engine
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Explore how SabiProfile eliminates document fraud across immigration, higher education, and enterprise hiring.
        </p>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 max-w-full justify-start sm:justify-center">
        {slides.map((s, idx) => {
          const TabIcon = s.sectorIcon;
          const isActive = idx === activeIdx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveIdx(idx);
                setIsPlaying(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2 text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <TabIcon size={14} className={isActive ? "text-emerald-400" : "text-slate-500"} />
              <span>{s.id === "immigration" ? "Immigration" : s.id === "education" ? "Education" : s.id === "enterprise" ? "Enterprise" : "Scoped Keys"}</span>
            </button>
          );
        })}

        {/* Autoplay toggle button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
          title={isPlaying ? "Pause auto-slides" : "Play auto-slides"}
          aria-label={isPlaying ? "Pause auto-slides" : "Play auto-slides"}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>
      </div>

      {/* Active Slide Presentation Canvas */}
      <div className="mt-6 sm:mt-8 overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-4 sm:p-8 lg:p-12 shadow-xl relative">
        <div className="grid items-center gap-6 lg:gap-10 lg:grid-cols-12">
          {/* Left Narrative Column */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
              <SectorIcon size={12} className="text-emerald-700" />
              <span>{current.pill}</span>
            </span>

            <h3 className="font-poppins text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {current.title}
            </h3>

            <p className="font-poppins text-xs sm:text-base font-semibold text-emerald-700">
              {current.tagline}
            </p>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xl">
              {current.description}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-2">
              {current.metrics.map((m, mi) => (
                <div key={mi} className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-xs text-center sm:text-left">
                  <p className="font-poppins text-sm sm:text-lg lg:text-xl font-extrabold text-slate-900 leading-tight">
                    {m.value}
                  </p>
                  <p className="text-[9px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-tight">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Call to Action Button */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link
                href={current.ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#059669] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] hover:scale-105 active:scale-95 transition-all text-center"
              >
                <span>{current.ctaText}</span>
                <ArrowRightAnimated size={14} />
              </Link>

              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all text-center"
              >
                <span>Sign Up Free</span>
              </Link>
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5 w-full overflow-hidden">
            {current.visual}
          </div>
        </div>

        {/* Previous & Next Control Arrows */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200/70 pt-4">
          <button
            type="button"
            onClick={() => {
              setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
              setIsPlaying(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <ChevronLeft size={14} />
            <span>Previous Solution</span>
          </button>

          <div className="flex gap-1.5">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  setActiveIdx(dotIdx);
                  setIsPlaying(false);
                }}
                className={`h-2 rounded-full transition-all ${
                  dotIdx === activeIdx ? "w-8 bg-emerald-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveIdx((prev) => (prev + 1) % slides.length);
              setIsPlaying(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <span>Next Solution</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

