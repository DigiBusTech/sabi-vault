"use client";

import React, { useState } from "react";
import { Hash } from "lucide-react";
import {
  WalletAnimated,
  GraduationCapAnimated,
  BriefcaseAnimated,
  FileCheckAnimated,
  AwardAnimated,
  Globe2Animated,
  CheckCircle2Animated,
  ShieldCheckAnimated,
  ArrowRightAnimated,
} from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";

interface DomainCard {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  tier: "Tier 1: Standard Hashed" | "Tier 2: Authenticated / Legalized";
  tierLevel: 1 | 2;
  colSpan: string;
  sampleRecord: {
    title: string;
    issuer: string;
    dateOrPeriod: string;
    hashRef: string;
    fields: { label: string; value: string }[];
  };
}

const DOMAIN_CARDS: DomainCard[] = [
  {
    id: "finance",
    name: "Liquid Finance & Proof of Funds",
    tagline: "Bank statements, audited liquid balances, and official FIRS tax clearances.",
    icon: WalletAnimated,
    tier: "Tier 1: Standard Hashed",
    tierLevel: 1,
    colSpan: "lg:col-span-8",
    sampleRecord: {
      title: "Zenith Bank PLC Liquidity Attestation",
      issuer: "Zenith Bank PLC (Lagos, Nigeria)",
      dateOrPeriod: "Statement Period: Jun 2026 – Sep 2026",
      hashRef: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      fields: [
        { label: "Current Liquid Balance", value: "₦8,750,000 NGN" },
        { label: "3-Month Average Balance", value: "₦8,200,000 NGN" },
        { label: "Tax Clearance Certificate", value: "FIRS-TCC-2026-99014 (Valid)" },
      ],
    },
  },
  {
    id: "academics",
    name: "Academics & Notarized Transcripts",
    tagline: "University degrees, certified transcripts, and Supreme Court Notary seals.",
    icon: GraduationCapAnimated,
    tier: "Tier 2: Authenticated / Legalized",
    tierLevel: 2,
    colSpan: "lg:col-span-4",
    sampleRecord: {
      title: "BSc Computer Engineering (First Class Honours)",
      issuer: "University of Lagos",
      dateOrPeriod: "Graduation Class of 2022",
      hashRef: "3e2849e798bc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      fields: [
        { label: "GPA", value: "4.84 / 5.00" },
        { label: "Notary Seal", value: "SCN-BAR-2014-88421" },
        { label: "Attestation", value: "Tier 2 Legalized" },
      ],
    },
  },
  {
    id: "experience",
    name: "Verified Career History",
    tagline: "Tenure logs, verified HR references, and cryptographic role attestations.",
    icon: BriefcaseAnimated,
    tier: "Tier 1: Standard Hashed",
    tierLevel: 1,
    colSpan: "lg:col-span-4",
    sampleRecord: {
      title: "Senior Systems Engineer",
      issuer: "Paystack / Stripe",
      dateOrPeriod: "March 2022 – Present",
      hashRef: "5f3a097de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      fields: [
        { label: "Employment Type", value: "Full-Time (Staff)" },
        { label: "Verified Reference", value: "VP of Engineering (Verified)" },
        { label: "Core Stack", value: "Go, TypeScript, PostgreSQL, Kafka" },
      ],
    },
  },
  {
    id: "certifications",
    name: "Professional Licensures & Credentials",
    tagline: "AWS, Cisco, medical/legal bar licenses, and technical credentials.",
    icon: FileCheckAnimated,
    tier: "Tier 2: Authenticated / Legalized",
    tierLevel: 2,
    colSpan: "lg:col-span-8",
    sampleRecord: {
      title: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services (AWS)",
      dateOrPeriod: "Issue Date: May 2023 • Valid through 2026",
      hashRef: "8a107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec29807",
      fields: [
        { label: "Credential ID", value: "AWS-PSA-99021" },
        { label: "Verification Status", value: "Issuer Registry Active" },
        { label: "Validation Node", value: "Decentralized Key Hash Check Passed" },
      ],
    },
  },
  {
    id: "achievements",
    name: "Honors, Grants & State Recognitions",
    tagline: "Hackathon titles, government innovation grants, and industry awards.",
    icon: AwardAnimated,
    tier: "Tier 2: Authenticated / Legalized",
    tierLevel: 2,
    colSpan: "lg:col-span-6",
    sampleRecord: {
      title: "Africa FinTech Innovation Award Winner",
      issuer: "Techpoint Africa & Federal Ministry of Communications",
      dateOrPeriod: "Awarded November 2024",
      hashRef: "2b9e107d9d372bb6826bd81d3542a419d6dae2ee1cb1213f56e9c402b88ec298",
      fields: [
        { label: "Category", value: "Distributed Ledger Architecture" },
        { label: "Grant Disbursed", value: "$25,000 USD Sovereign Seed" },
      ],
    },
  },
  {
    id: "portfolio",
    name: "Cryptographic Portfolio & Research",
    tagline: "GitHub commit verification, open-source citations, and verified repos.",
    icon: Globe2Animated,
    tier: "Tier 1: Standard Hashed",
    tierLevel: 1,
    colSpan: "lg:col-span-6",
    sampleRecord: {
      title: "Staff Distributed Systems Architect & Identity Researcher",
      issuer: "Public Git Ledger & Google Scholar Verified",
      dateOrPeriod: "Continuous Sync",
      hashRef: "99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa",
      fields: [
        { label: "GitHub Commits", value: "4,200+ Verified Contributions" },
        { label: "Research Citations", value: "14 Peer-Reviewed Citations" },
      ],
    },
  },
];

export function DomainBento() {
  const [activeCardId, setActiveCardId] = useState<string>("finance");

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <Reveal>
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
            Unified Data Architecture
          </span>
          <h2 className="mt-3 font-poppins text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
            One Sovereign Vault. Six Standardized Verifiable Domains.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Every document extracted into your vault maps to an audited, standardized JSON schema. When granting consent, you choose the exact categories an enterprise can evaluate. Non-consented categories are completely stripped before transmission.
          </p>
        </div>
      </Reveal>

      {/* Asymmetrical Bento Grid with Double-Bezel Architecture */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
        {DOMAIN_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const isSelected = activeCardId === card.id;

          return (
            <Reveal key={card.id} delay={idx * 60} className={card.colSpan}>
              {/* Outer Shell: Double-Bezel Hardware Wrapper */}
              <div
                onClick={() => setActiveCardId(card.id)}
                className={`group relative h-full cursor-pointer rounded-[2rem] p-1.5 transition-all duration-300 ${
                  isSelected
                    ? "bg-[#0f172a] shadow-xl scale-[1.01]"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {/* Inner Core Content Card */}
                <div className="h-full rounded-[calc(2rem-0.375rem)] liquid-glass-card p-6 md:p-8 flex flex-col justify-between shadow-sm transition-all">
                  <div>
                    {/* Header: Icon + Verification Tier Tag */}
                    <div className="flex items-center justify-between">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                        isSelected
                          ? "bg-[#059669] text-white shadow-md"
                          : "bg-slate-100 text-[#0f172a] group-hover:bg-[#059669] group-hover:text-white"
                      }`}>
                        <Icon size={22} strokeWidth={1.9} />
                      </span>

                      <span className={`liquid-glass-pill inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold ${
                        card.tierLevel === 2
                          ? "bg-emerald-50/80 text-[#059669] border border-emerald-200"
                          : "text-slate-700 border border-slate-200"
                      }`}>
                        <ShieldCheckAnimated size={13} />
                        {card.tier}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="mt-5 font-poppins text-xl font-bold text-[#0f172a]">
                      {card.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {card.tagline}
                    </p>
                  </div>

                  {/* Schema Verification Preview Box */}
                  <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0f172a]">
                        {card.sampleRecord.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#059669] font-bold">
                        VERIFIED HASH REF
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {card.sampleRecord.issuer} • {card.sampleRecord.dateOrPeriod}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2.5 text-xs">
                      {card.sampleRecord.fields.map((field) => (
                        <div key={field.label}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {field.label}
                          </span>
                          <p className="font-semibold text-slate-800 truncate">
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-slate-400 truncate">
                      <Hash size={11} className="text-[#059669] shrink-0" />
                      <span className="truncate">{card.sampleRecord.hashRef}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

