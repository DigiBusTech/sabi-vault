import Link from "next/link";
import {
  ArrowRightAnimated,
  FingerprintAnimated,
  ShieldCheckAnimated,
  CheckCircle2Animated,
  SparklesAnimated,
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
import { PlusAnimated } from "@/components/ui/animated-icons";

export default function HomePage() {
  return (
    <main className="bg-white text-[#0f172a] font-sans selection:bg-[#059669]/20 selection:text-[#0f172a]">
      {/* 1. HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid items-center gap-10 lg:gap-12 lg:grid-cols-12">
          {/* Hero Left Column */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="liquid-glass-pill inline-flex items-center gap-2 p-1 pr-3.5 shadow-sm max-w-full overflow-hidden">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white">
                  <ShieldCheckAnimated size={13} strokeWidth={2.4} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f172a] truncate">
                  Instant Document Verification • 100% Tamper-Proof
                </span>
              </div>

              <h1 className="mt-5 font-poppins text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] sm:leading-[1.05] tracking-tight text-[#0f172a]">
                Your documents, verified once. Accepted everywhere.
              </h1>

              <p className="mt-5 max-w-[54ch] text-base sm:text-lg leading-relaxed text-slate-600">
                Store your university degrees, bank statements, and work certificates safely in your private cloud. Share instant, fraud-proof digital proof with employers, embassies, and universities worldwide — with zero paper delay.
              </p>

              {/* Action Button Pills */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-md sm:max-w-none">
                <Link
                  href="/login?mode=signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#059669] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#047857] active:scale-[0.98] text-center"
                >
                  <span>Create Free Account</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                    <ArrowRightAnimated size={13} strokeWidth={2.5} />
                  </span>
                </Link>

                <Link
                  href="/enterprise"
                  className="liquid-glass-pill group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#0f172a] transition-all hover:bg-white active:scale-[0.98] text-center"
                >
                  <span>For Employers &amp; Universities</span>
                </Link>
              </div>

              {/* Mobile App Store Badges */}
              <div className="mt-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Get the mobile app (iOS &amp; Android)
                </span>
                <AppDownloadButtons size="sm" />
              </div>

              {/* Quick Trust Highlights */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 font-montserrat">
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>Files stay in your Google Drive or Dropbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>Verified in under 5 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Animated size={15} className="text-[#059669]" />
                  <span>100% protected against fake credentials</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero Right Column: Animated Verification Simulator */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
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
              Accepted &amp; Trusted Across Global Platforms
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
                { name: "NDPC Certified", region: "Nigeria & ECOWAS Data Protection", framework: "Data Protection Act 2023" },
                { name: "GDPR Compliant", region: "European Union Data Privacy", framework: "Articles 44–49" },
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
              Why People &amp; Organizations Trust SabiProfile
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {[
              { value: 0, label: "Files stored on our servers — your documents stay in your private drive" },
              { value: null, staticValue: "100%", label: "Guaranteed protection against fake degrees and altered bank statements" },
              { value: null, staticValue: "< 5s", label: "Average time to verify any credential — no waiting 3 to 6 weeks" },
              { value: 6, label: "Core document categories: Degrees, Bank Statements, ID, Experience & more" },
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

      {/* 4. THE PROBLEM: STATIC PAPER VS IMMUTABLE PROOFS */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <TamperVisual />
          </Reveal>

          <Reveal delay={120}>
            <div className="max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                The Real Problem
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Why paper certificates and emailed PDFs are slowing everyone down.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                Applying for an international visa, study program, or top job still forces you to print, notarize, and mail paper copies. Embassies and recruiters spend weeks calling schools and banks to check if certificates are genuine.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                SabiProfile fixes this completely. Your credentials get verified once, locked with a unique tamper-proof digital seal, and can be instantly confirmed by anyone you authorize in seconds.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Old Way: Paper Courier &amp; Manual Checks
                  </dt>
                  <dd className="mt-1 font-poppins text-2xl font-bold text-slate-400 line-through decoration-red-300">
                    3 to 6 Weeks
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                    SabiProfile: Instant Digital Verification
                  </dt>
                  <dd className="mt-1 font-poppins text-2xl font-bold text-[#0f172a]">
                    Under 5 Seconds
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. SPATIAL SCROLL WORLD STORY */}
      <ScrollWorldStory />

      {/* 6. SIX STANDARDIZED DOMAINS ASYMMETRICAL BENTO */}
      <DomainBento />

      {/* 7. TWO-TIER VERIFICATION COMPARISON MATRIX */}
      <section className="border-y border-slate-200 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                Simple &amp; Clear Verification
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Two Ways We Verify Your Documents.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Whether you need to prove your account balance for a visa or submit an official degree to an employer, we make it simple and secure.
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
                  Tier 1
                </span>
                <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                  Instant Document Verification
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Best for bank statements, pay slips, utility bills, and job portfolios. Connect your Google Drive or Dropbox, and our system confirms the file is authentic and unchanged.
                </p>

                <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Instant automatic check when you connect your file</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Zero files saved on our servers — stays in your private drive</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Permanent digital proof that cannot be edited or faked</span>
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
                  Tier 2
                </span>
                <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                  Official University &amp; Notary Stamped
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Required for university degrees, academic transcripts, and legal certificates. Officially stamped by authorized universities and licensed notaries so international embassies and institutions accept them without question.
                </p>

                <div className="mt-6 space-y-2.5 border-t border-emerald-200/60 pt-5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Officially attested by licensed legal notaries or universities</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Accepted by foreign embassies, universities &amp; global employers</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#047857]">
                    <CheckCircle2Animated size={15} className="text-[#059669]" />
                    <span>Permanent digital seal that guarantees 100% authenticity</span>
                  </div>
                </div>
              </LiquidGlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. TAILORED SECTOR GATEWAYS */}
      <AudienceCards />

      {/* 9. MOBILE VAULT SPOTLIGHT & APP DOWNLOADS */}
      <MobileAppCard />

      {/* 10. CUSTOMER & PARTNER TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
              Real-World Validation
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
              Trusted by Universities, Border Desks &amp; Global Employers
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "We stopped requesting emailed PDF bank statements for foreign student admissions. The applicant's verified proof confirms the liquid balance instantly with zero risk of fraudulent documents.",
              name: "Dr. Chiamaka Eze",
              role: "Admissions Director, Covenant Gate University",
              highlight: true,
            },
            {
              quote: "Document verification that used to take our visa desk three weeks now clears in under five seconds with zero risk of forged degrees or fake certificates.",
              name: "Tunde Bakare",
              role: "Consular Services Lead, Westbridge Migration Partners",
              highlight: false,
            },
            {
              quote: "Our hiring managers can verify an applicant's education and past roles in one second. We have cut our candidate screening time by over 80%.",
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

      {/* 11. FREQUENTLY ASKED QUESTIONS */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
                Common Questions
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
                Questions, answered simply.
              </h2>
              <p className="mt-4 max-w-[50ch] text-sm leading-relaxed text-slate-600">
                Clear answers about how your documents are protected. Have questions or need a custom solution?{" "}
                <Link href="/contact" className="font-semibold text-[#059669] underline">
                  Contact our support team
                </Link>.
              </p>
            </Reveal>

            <div className="space-y-3.5">
              {[
                {
                  q: "Do you keep copies of my personal files or PDFs?",
                  a: "No, never. Your original files stay safely in your private Google Drive or Dropbox. We only read the details to create a verified digital proof, and we never keep or store your documents on our servers.",
                },
                {
                  q: "How do I share my verified documents with an employer or embassy?",
                  a: "You can generate a secure, private link or QR code from your dashboard. You choose exactly what they can see (for example, only your degree and work history, but not your bank balance), and you can turn off access anytime in one click.",
                },
                {
                  q: "How can someone be sure my degree or certificate is genuine?",
                  a: "Every verified document has a permanent digital fingerprint. If anyone edits even one letter or changes a grade, the system instantly detects the mismatch and flags it as altered.",
                },
                {
                  q: "Is my data private and legally protected?",
                  a: "Yes. SabiProfile strictly complies with NDPC in Nigeria, GDPR in Europe, and international data privacy laws. Your personal information belongs to you and is never shared without your permission.",
                },
                {
                  q: "How much does it cost?",
                  a: "It is free to create your personal vault and store your verified credentials. Organizations and employers who run instant background checks pay a small fee per verification.",
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

      {/* 12. CLOSING CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <LiquidGlassCard className="rounded-[2.5rem] border border-emerald-200/80 bg-emerald-50/80 p-8 text-center md:p-16 shadow-lg">
            <span className="liquid-glass-pill inline-block px-4 py-1 text-xs font-bold text-[#059669] shadow-sm">
              Instant Peace of Mind
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl font-poppins text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl md:text-5xl">
              Ready to verify your documents the easy way?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Join thousands of students, jobseekers, and professionals who verify their credentials once and share them anywhere in the world.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#059669] px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#047857] active:scale-[0.98]"
              >
                <span>Create Free Account</span>
                <ArrowRightAnimated size={16} />
              </Link>
              <Link
                href="/enterprise"
                className="liquid-glass-pill inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold text-[#0f172a] active:scale-[0.98]"
              >
                <span>For Employers &amp; Universities</span>
              </Link>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-2 border-t border-emerald-200/60 pt-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">
                Or download the mobile app
              </span>
              <AppDownloadButtons size="sm" />
            </div>

          </LiquidGlassCard>
        </Reveal>
      </section>
    </main>
  );
}
