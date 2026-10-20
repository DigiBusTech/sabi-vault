import Link from "next/link";
import {
  ArrowRightAnimated,
  FingerprintAnimated,
  ShieldCheckAnimated,
  CheckCircle2Animated,
  SparklesAnimated,
  PlusAnimated,
} from "@/components/ui/animated-icons";

import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";
import { VerificationSim } from "@/components/marketing/VerificationSim";
import { CountUp } from "@/components/marketing/CountUp";
import { TamperVisual } from "@/components/marketing/TamperVisual";
import { DomainBento } from "@/components/marketing/DomainBento";
import { ScrollWorldStory } from "@/components/marketing/ScrollWorldStory";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";
import { MobileAppCard } from "@/components/marketing/MobileAppCard";
import { AudienceCards } from "@/components/marketing/AudienceCards";
import { Plus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">

      {/* 1. HERO SECTION (Apple / Linear-Tier Layout) */}
      <section className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 lg:px-8 lg:pt-24 overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Hero Left Column */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="liquid-glass-pill inline-flex items-center gap-2 p-1 pr-3.5 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#059669] text-white">
                  <ShieldCheckAnimated size={13} strokeWidth={2.4} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f172a]">
                  Sovereign Identity Infrastructure • Powered by Base Sepolia
                </span>
              </div>

              <h1 className="mt-5 font-poppins text-4xl font-extrabold leading-[1.04] tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
                Zero-forged records. Instant sovereign trust.
              </h1>

              <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-slate-600 sm:text-lg">
                SabiProfile turns physical passports, bank statements, degrees, and employment records into tamper-proof, schema-validated cryptographic credentials. Physical documents stay in your private cloud; only mathematical proofs cross borders.
              </p>

              {/* Action Button Pills */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/login?mode=signup"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#059669] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#047857] active:scale-[0.98]"
                >
                  <span>Create Your Sovereign Vault</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                    <ArrowRightAnimated size={13} strokeWidth={2.5} />
                  </span>
                </Link>

                <Link
                  href="/enterprise"
                  className="liquid-glass-pill group inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#0f172a] transition-all hover:bg-white active:scale-[0.98]"
                >
                  <span>Enterprise Solutions</span>
                </Link>
              </div>

              {/* Mobile App Store Badges */}
              <div className="mt-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mobile Vault App (iOS &amp; Android Private Beta)
                </span>
                <AppDownloadButtons size="sm" />
              </div>


              {/* Quick Trust Highlights */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 font-montserrat">
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>100% Client-Side OAuth Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>4ms On-Chain Hash Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>Zero Raw Documents Centralized</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero Right Column: Animated Verification Simulator */}
          <div className="lg:col-span-5">
            <Reveal delay={150}>
              <VerificationSim />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. INFRASTRUCTURE & TRUSTED CONSENSUS PARTNERS */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <h2 className="text-center font-poppins text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Anchored on Immutable Global Infrastructure &amp; Regional Compliance
            </h2>
          </Reveal>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16">
            {[
              { slug: "base", name: "Base L2" },
              { slug: "ethereum", name: "Ethereum" },
              { slug: "supabase", name: "Supabase" },
              { slug: "googledrive", name: "Google Drive" },
              { slug: "dropbox", name: "Dropbox" },
              { slug: "vercel", name: "Vercel" },
            ].map((logo, index) => (
              <Reveal key={logo.slug} delay={index * 60}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.simpleicons.org/${logo.slug}`}
                  alt={logo.name}
                  title={logo.name}
                  width={34}
                  height={34}
                  loading="lazy"
                  className="h-8 w-8 opacity-40 grayscale transition-all duration-300 hover:scale-110 hover:opacity-100 hover:grayscale-0 md:h-9 md:w-9"
                />
              </Reveal>
            ))}
          </div>

          {/* Regional Sovereignty Compliance Badges */}
          <div className="mx-auto mt-10 max-w-3xl border-t border-slate-200/60 pt-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { name: "NDPC Validated", region: "Nigeria & ECOWAS Residency Hub", framework: "Data Protection Act 2023" },
                { name: "GDPR Compliant", region: "European Union Central Sovereign Node", framework: "Articles 44–49" },
              ].map((comp, idx) => (
                <Reveal key={comp.name} delay={idx * 80}>
                  <div className="liquid-glass-pill inline-flex items-center gap-3 px-5 py-2.5 shadow-sm transition-all hover:border-[#059669]/40 hover:scale-[1.02]">
                    <ShieldCheckAnimated size={18} className="text-[#059669]" />
                    <div>
                      <span className="text-xs font-bold text-[#0f172a]">{comp.name}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">{comp.region}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE IN NUMBERS */}

      <section className="border-y border-slate-200 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <h2 className="font-poppins text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Cryptographic Invariants by the Numbers
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {[
              { value: 6, label: "Standardized sovereign credential domains" },
              { value: 2, label: "Verification tiers: Instant Hashed & Notarized" },
              { value: null, staticValue: "SHA-256", label: "Anchored to the Base Sepolia ledger" },
              { value: 0, label: "Raw citizen documents stored on our servers" },
            ].map((stat, index) => (
              <Reveal key={stat.label} delay={index * 90}>
                <p className="font-poppins text-3xl font-extrabold text-[#0f172a] md:text-4xl">
                  {stat.value === null ? (
                    stat.staticValue
                  ) : (
                    <CountUp value={stat.value} />
                  )}
                </p>
                <p className="mt-2 max-w-[24ch] text-xs leading-relaxed text-slate-600">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM: STATIC PAPER VS IMMUTABLE PROOFS */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <TamperVisual />
          </Reveal>

          <Reveal delay={120}>
            <div className="max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                The Fundamental Problem
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Paper and PDFs were never engineered for sovereign digital borders.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                Global visas, admissions, and enterprise hiring still depend on vulnerable PDFs, forged paperwork, and weeks of manual embassy legalization. Every recipient re-verifies the same documents from scratch, and nobody can mathematically prove the file was not altered post-issuance.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                SabiProfile eliminates this paradigm by replacing documents with <strong>cryptographic mathematical proofs</strong>: a SHA-256 hash committed to the blockchain, verified in real-time on every query.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Manual Embassy Legalization
                  </dt>
                  <dd className="mt-1 font-poppins text-2xl font-bold text-slate-400 line-through decoration-red-300">
                    3 to 6 Weeks
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                    SabiProfile Real-Time Hash Check
                  </dt>
                  <dd className="mt-1 font-poppins text-2xl font-bold text-[#0f172a]">
                    4 Milliseconds
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. SPATIAL SCROLL WORLD STORY */}
      <ScrollWorldStory />


      {/* 7. SIX STANDARDIZED DOMAINS ASYMMETRICAL BENTO */}
      <DomainBento />

      {/* 8. TWO-TIER VERIFICATION COMPARISON MATRIX */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                Cryptographic Hierarchy
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Two Distinct Tiers of Cryptographic Proof.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Everyday transactional records get instant SHA-256 cloud sync proofs. Documents with legal and immigration weight receive an accredited human notary seal permanently anchored on-chain.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {/* Tier 1 Card */}
            <Reveal>
              <LiquidGlassCard className="h-full p-8 rounded-[2rem]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#0f172a]">
                  <FingerprintAnimated size={24} strokeWidth={1.8} />
                </span>
                <span className="mt-6 inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                  Tier 1 Hierarchy
                </span>
                <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                  Standard Cryptographically Hashed
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Ideal for bank statements, liquid proof of funds, utility receipts, and portfolios. Computed immediately upon OAuth cloud sync, proving mathematical file existence at an exact immutable timestamp and preventing post-upload alteration.
                </p>

                <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Automatic SHA-256 checksum calculation on sync</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Immediate in-memory memory wiping (Buffer.fill(0))</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Base Sepolia on-chain hash commitment receipt</span>
                  </div>
                </div>
              </LiquidGlassCard>
            </Reveal>

            {/* Tier 2 Card */}
            <Reveal delay={120}>
              <LiquidGlassCard className="h-full p-8 rounded-[2rem] border-2 border-[#059669]/40 bg-emerald-50/50 shadow-md">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#059669] text-white shadow-sm">
                  <ShieldCheckAnimated size={24} strokeWidth={1.8} />
                </span>
                <span className="mt-6 inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-[#047857]">
                  Tier 2 Hierarchy
                </span>
                <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                  Authenticated &amp; Legalized (Notary Sealed)
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Required for academic degrees, transcripts, marriage certificates, and sworn affidavits. An authorized human notary or issuing university attests the credential before hashing; the notary digital seal and cryptographic hash are permanently bound on-chain.
                </p>

                <div className="mt-6 space-y-2.5 border-t border-emerald-200/60 pt-5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Supreme Court / Bar Notary digital seal attestation</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Bound to on-chain NotarizedRegistry smart contract</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Mandatory for international visa and university admissions</span>
                  </div>
                </div>
              </LiquidGlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. TAILORED SECTOR GATEWAYS */}
      <AudienceCards />

      {/* 8. MOBILE SOVEREIGN VAULT SPOTLIGHT & APP DOWNLOADS */}
      <MobileAppCard />


      {/* 11. CUSTOMER & PARTNER TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
              Real-World Validation
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
              Trusted by Universities, Border Desks &amp; Global Tech
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "We stopped requesting emailed PDF bank statements for foreign student admissions. The citizen's scoped key carries the consent, and the on-chain hash check guarantees the liquid balance was never modified.",
              name: "Dr. Chiamaka Eze",
              role: "Admissions Director, Covenant Gate University",
              highlight: true,
            },
            {
              quote: "Document verification that used to take our visa desk three weeks now clears in under five seconds with zero risk of fraudulent degree certs.",
              name: "Tunde Bakare",
              role: "Consular Services Lead, Westbridge Migration Partners",
              highlight: false,
            },
            {
              quote: "The evaluation engine cites the exact structured JSON field it relied on. Our hiring managers can audit every single scoring decision against the blockchain proof.",
              name: "Ingrid Halvorsen",
              role: "Head of Talent Architecture, Nordvik Engineering Group",
              highlight: false,
            },
          ].map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 90}>
              <LiquidGlassCard
                className={`flex h-full flex-col justify-between rounded-2xl p-7 ${
                  testimonial.highlight
                    ? "border-emerald-200/80 bg-emerald-50/70"
                    : ""
                }`}
              >
                <blockquote className="text-sm leading-relaxed text-slate-700">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-100 pt-4">
                  <p className="font-poppins text-sm font-bold text-[#0f172a]">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{testimonial.role}</p>
                </figcaption>
              </LiquidGlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                Architectural Integrity
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Questions, answered.
              </h2>
              <p className="mt-4 max-w-[50ch] text-sm leading-relaxed text-slate-600">
                Detailed guarantees before deploying sovereign infrastructure. Have an enterprise or embassy custom integration? <Link href="/contact" className="font-semibold text-[#059669] underline">Contact our engineering team</Link>.
              </p>
            </Reveal>

            <div className="space-y-3.5">
              {[
                {
                  q: "Do you store physical user documents or PDFs on SabiProfile servers?",
                  a: "Never. Raw files reside exclusively in the citizen's private Google Drive or Dropbox accessed via read-only OAuth 2.0. We extract structured schema facts in memory, calculate the SHA-256 hash, and immediately wipe in-memory buffers (buffer.fill(0)).",
                },
                {
                  q: "How does a scoped programmable API key work?",
                  a: "A citizen mints a signed HMAC token (sbk_live_v1_...) specifying allowed categories (e.g., only 'academics' and 'finance'), query quotas, and expiration TTLs. Non-permitted categories are stripped before evaluation, and the key can be revoked in one click.",
                },
                {
                  q: "What prevents database tampering or malicious record modifications?",
                  a: "Every enterprise query executes the Integrity Agent: it canonicalizes the database JSON, computes the SHA-256 checksum, and compares it against the Base Sepolia blockchain registry. If a single character differs, the query immediately fails closed in 4ms.",
                },
                {
                  q: "How does the GovTech 60/40 revenue split function?",
                  a: "For every enterprise verification fee ($1.00 USD standard), 60% is routed to the Sabi Platform Treasury while 40% is atomically distributed to the host sovereign nation's digital identity agency (e.g. Nigeria NDPC Hub). Settlements execute on-chain with zero counterparty risk.",
                },
                {
                  q: "What regional privacy regulations are supported?",
                  a: "Structured JSON is strictly partitioned onto regional sovereign database nodes satisfying NDPC in Nigeria, GDPR in the European Union, and regional data residency mandates worldwide.",
                },
              ].map((item, index) => (
                <Reveal key={item.q} delay={index * 50}>
                  <details className="group liquid-glass-card rounded-2xl px-6 py-4.5 open:border-[#059669]/40 transition-colors">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#0f172a] [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <PlusAnimated
                        size={17}
                        className="shrink-0 text-[#059669] transition-transform duration-200 group-open:rotate-45"
                      />
                    </summary>
                    <p className="mt-3.5 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 13. CLOSING ENTERPRISE CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <LiquidGlassCard className="rounded-[2.5rem] border border-emerald-200/80 bg-emerald-50/80 p-8 text-center md:p-16 shadow-lg">
            <span className="liquid-glass-pill inline-block px-4 py-1 text-xs font-bold text-[#059669] shadow-sm">
              Sovereign Identity Paradigm
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl font-poppins text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl md:text-5xl">
              Start with your sovereign credentials today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Create your citizen vault in seconds, connect your cloud drive, and issue your first cryptographically verifiable scoped key.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#059669] px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#047857] active:scale-[0.98]"
              >
                <span>Create Your Citizen Vault</span>
                <ArrowRightAnimated size={16} />
              </Link>
              <Link
                href="/enterprise"
                className="liquid-glass-pill inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold text-[#0f172a] active:scale-[0.98]"
              >
                <span>Enterprise Ingestion API</span>
              </Link>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 border-t border-emerald-200/60 pt-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">
                Or get early access on mobile
              </span>
              <AppDownloadButtons size="sm" />
            </div>

          </LiquidGlassCard>
        </Reveal>
      </section>
    </main>
  );
}
