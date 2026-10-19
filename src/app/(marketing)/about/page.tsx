import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightAnimated,
  GraduationCapAnimated,
  BriefcaseAnimated,
  Globe2Animated,
  ShieldCheckAnimated,
  LandmarkAnimated,
  LockAnimated,
  CheckCircle2Animated,
} from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";

export const metadata: Metadata = {
  title: "About Us | SabiProfile",
  description:
    "SabiProfile is sovereign data infrastructure for immigration, education, and labour: citizen-owned credentials verified on-chain with zero raw documents stored.",
};

const sectors = [
  {
    icon: Globe2Animated,
    name: "Immigration & Border Security",
    headline: "Real-time proof of funds & legal status",
    body: "Visa officers and immigration authorities verify applicant proof of funds, police clearances, and legalized paperwork in milliseconds instead of weeks, mathematically backed by on-chain SHA-256 hashes.",
  },
  {
    icon: GraduationCapAnimated,
    name: "Higher Education & Notaries",
    headline: "Tamper-proof transcripts & degrees",
    body: "Universities and accredited notaries attest degrees and academic transcripts once. Global employers and graduate schools verify the seal instantly against the decentralized blockchain registry.",
  },
  {
    icon: BriefcaseAnimated,
    name: "Labour & Enterprise Hiring",
    headline: "Fraud-proof qualification auditing",
    body: "Recruiting teams and HR platforms screen candidate qualifications against uploaded job rubrics using a strict zero-hallucination multi-agent pipeline that cites only mathematically verified records.",
  },
];

const principles = [
  {
    title: "Zero Raw Central Document Storage",
    body: "User PDFs and physical scans remain strictly inside personal Google Drive or Dropbox accounts via OAuth 2.0. Memory buffers are cryptographically zeroed immediately after schema extraction.",
  },
  {
    title: "Sovereign Regional Data Residency",
    body: "Structured JSON records reside on dedicated sovereign database nodes partitioned by regional jurisdiction to satisfy NDPC (ECOWAS/Nigeria), GDPR (European Union), and local residency statutes.",
  },
  {
    title: "Mathematical On-Chain Tamper Detection",
    body: "Every verified credential has a SHA-256 hash committed to the Base Sepolia blockchain registry. Any unauthorized modification to database records triggers immediate fail-closed rejection.",
  },
  {
    title: "Programmable Scoped Consent Keys",
    body: "Citizens never expose complete vaults. Instead, they mint scoped cryptographic keys (`sbk_live_v1_...`) with fine-grained category permissions, query quotas, TTL expiry, and one-click revocation.",
  },
  {
    title: "Deterministic Zero-Hallucination AI",
    body: "Our multi-agent screening engine strictly evaluates verified JSON data against requirement rubrics. The system never estimates missing credentials or hallucinates candidate qualifications.",
  },
];

const milestones = [
  { label: "Query Verification", value: "< 4ms", desc: "Fail-closed cryptographic latency" },
  { label: "Sovereign Revenue Split", value: "60 / 40", desc: "40% smart contract host nation yield" },
  { label: "Central Document Storage", value: "0 bytes", desc: "Strict zero-raw file centralization" },
  { label: "Verification Tiers", value: "Tier 1 & 2", desc: "Standard hashed + Notarized seals" },
];

export default function AboutPage() {
  return (
    <main className="bg-white text-[#0f172a]">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheckAnimated size={14} className="text-emerald-700" />
            <span>Sovereign Identity & Data Infrastructure</span>
          </div>

          <h1 className="mt-5 max-w-4xl font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-6xl">
            Verification is a public good. <br className="hidden sm:inline" />
            <span className="text-emerald-700">We build it as infrastructure.</span>
          </h1>

          <p className="mt-6 max-w-3xl font-montserrat text-base leading-relaxed text-slate-600 md:text-lg">
            SabiProfile is a sovereign data infrastructure engineered for the three systems that decide
            where people may live, study, and work. We replace static, forgeable PDFs with programmable,
            tamper-proof credentials that citizens own, manage, and share strictly by consent.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup/organization"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.98]"
            >
              <span>Explore Enterprise Screening</span>
              <ArrowRightAnimated size={15} />
            </Link>
            <Link
              href="/government"
              className="liquid-glass-pill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 active:scale-[0.98]"
            >
              <LandmarkAnimated size={16} className="text-emerald-700" />
              <span>Sovereign GovTech Hub</span>
            </Link>
            <AppDownloadButtons size="sm" />
          </div>
        </Reveal>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {milestones.map((m, idx) => (
              <Reveal key={m.label} delay={idx * 60}>
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-md">
                  <p className="font-poppins text-3xl font-extrabold text-slate-900">{m.value}</p>
                  <p className="mt-1 font-poppins text-xs font-bold text-emerald-700">{m.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Three Economic Sectors */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Transforming Core Sectors
            </p>
            <h2 className="mt-3 font-poppins text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Three pillars, one decentralized trust layer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The world economy loses over $50B annually to credential fraud, manual notarizations, and border delays.
              SabiProfile unites citizens, institutions, and border authorities onto one mathematical verification engine.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {sectors.map((sector, index) => (
            <Reveal key={sector.name} delay={index * 90}>
              <LiquidGlassCard className="h-full rounded-2xl p-7" intensity="medium">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <sector.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-poppins text-lg font-bold text-slate-900">{sector.name}</h3>
                <p className="mt-1 text-xs font-semibold text-emerald-700">{sector.headline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{sector.body}</p>
              </LiquidGlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Architectural Invariants */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <span className="liquid-glass-pill px-3 py-1 text-xs font-bold text-emerald-700">
                  Core Architecture
                </span>
                <h2 className="mt-4 font-poppins text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  Principles we do not compromise
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  These are mathematical and architectural invariants, not marketing positions.
                  Every line of code and audit checklist enforces these foundational contracts.
                </p>
                <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2Animated size={18} />
                    <span>100% Deterministic Guarantee</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-950">
                    If any structured record in a regional database differs from its on-chain SHA-256 hash by a single bit,
                    the verification pipeline terminates with a tamper alert in under 4ms.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="space-y-4">
              {principles.map((principle, index) => (
                <Reveal key={principle.title} delay={index * 60}>
                  <div className="liquid-glass-card rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <LockAnimated size={14} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 className="font-poppins text-base font-bold text-slate-900">
                          {principle.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {principle.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GovTech 60/40 Splitter Section */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="liquid-glass-pill px-3 py-1 text-xs font-bold text-emerald-700">
                  SabiRevenueSplitter.sol
                </span>
                <h2 className="mt-4 font-poppins text-2xl font-extrabold text-slate-900 md:text-3xl">
                  Aligning national sovereignty with digital economy growth
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Unlike traditional Silicon Valley SaaS models that extract value from regional data without compensation,
                  SabiProfile encodes a 60/40 smart contract revenue split directly into our EVM settlement ledger:
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      40%
                    </span>
                    <span>Direct on-chain yield disbursed to the host sovereign nation (Ministry of Interior / Digital Agency).</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                      60%
                    </span>
                    <span>Powers the global multi-agent AI screening pipeline, cloud infrastructure, and cryptographic development.</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-poppins text-sm font-bold text-slate-900">
                  Sovereign Host Benefits
                </h3>
                <ul className="mt-4 space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700 font-bold">✓</span>
                    <span>NDPC and GDPR residency compliant regional nodes hosted on domestic cloud infrastructure.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700 font-bold">✓</span>
                    <span>Autonomous national fraud radar tracking intercepted degree forgeries and liquidity anomalies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700 font-bold">✓</span>
                    <span>Accredited notary portals binding sworn affidavits and university diplomas on-chain.</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link
                    href="/government"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
                  >
                    <span>View Sovereign Hub Telemetry</span>
                    <ArrowRightAnimated size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Call to Action Banner */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal>
          <LiquidGlassCard className="rounded-3xl border border-emerald-300 bg-emerald-50/70 px-6 py-12 text-center md:px-12" intensity="medium">
            <LandmarkAnimated size={36} className="mx-auto text-emerald-700" strokeWidth={1.8} />
            <h2 className="mx-auto mt-4 max-w-xl font-poppins text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Governments, enterprises, and citizens on one sovereign trust layer.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Pilot a sovereign regional node, integrate our M2M screening API into your ATS, or mint your first citizen vault.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-800 active:scale-[0.98]"
              >
                <span>Talk to our team</span>
                <ArrowRightAnimated size={15} />
              </Link>
              <Link
                href="/login?mode=signup"
                className="liquid-glass-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-white active:scale-[0.98]"
              >
                <span>Create citizen vault</span>
              </Link>
              <AppDownloadButtons size="sm" />
            </div>
          </LiquidGlassCard>
        </Reveal>
      </section>
    </main>
  );
}
