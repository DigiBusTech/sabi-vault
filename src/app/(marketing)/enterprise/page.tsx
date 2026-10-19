import type { Metadata } from "next";
import Link from "next/link";
import {
  FileUp,
  KeyRound,
  ListChecks,
  Plane,
  Webhook,
} from "lucide-react";
import {
  ArrowRightAnimated,
  BriefcaseAnimated,
  GraduationCapAnimated,
  ScanSearchAnimated,
  CheckCircle2Animated,
} from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";
import { InteractiveStudio } from "@/components/marketing/InteractiveStudio";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";

export const metadata: Metadata = {
  title: "For Enterprises and Institutions | Sabi Vault",
  description:
    "Screen candidates for recruitment, admissions, and immigration against cryptographically verified records, with consent enforced by scoped keys.",
};


const useCases = [
  {
    icon: BriefcaseAnimated,
    title: "Recruitment",
    body: "Verify employment history, certifications, and credentials against your requirement rubric. Fraud flags surface timeline gaps and issuer mismatches before the interview.",
  },
  {
    icon: GraduationCapAnimated,
    title: "University admissions",
    body: "Read transcripts and degrees that carry Tier 2 notary attestation, bound on-chain at issue. No registrar phone calls, no emailed scans.",
  },
  {
    icon: Plane,
    title: "Immigration and visas",
    body: "Check proof of funds and legalized documents with integrity hashes verified in real time. The applicant consents per query through a scoped key.",
  },
];

const flow = [
  { icon: FileUp, verb: "Upload criteria", body: "Drop in your requirement document. The Criteria Agent turns it into a weighted scoring rubric." },
  { icon: KeyRound, verb: "Receive consent", body: "The candidate shares a scoped key covering only the categories your role actually needs." },
  { icon: ScanSearchAnimated, verb: "Run the pipeline", body: "Five agents verify integrity, check fraud signals, and score verified fields against the rubric." },
  { icon: ListChecks, verb: "Read the verdict", body: "Every score cites the exact verified field it relied on. Missing data fails the category instead of being estimated." },
];

export default function EnterprisePage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
            For enterprises and institutions
          </p>
          <h1 className="mt-4 max-w-3xl font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
            Hire, admit, and screen against proof, not paper.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-slate-600 md:text-lg">
            Query cryptographically verified candidate records through an API that enforces
            consent on every call. No document collection, no storage liability, no forged
            certificates getting through.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup/organization"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-hover active:scale-[0.98]"
            >
              <span>Create organization account</span>
              <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/docs"
              className="liquid-glass-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white/90 active:scale-[0.98]"
            >
              API documentation
            </Link>
            <AppDownloadButtons size="sm" />
          </div>

          <p className="mt-5 text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login/organization" className="font-semibold text-brand-green hover:text-brand-green-hover">
              Sign in to your dashboard
            </Link>
          </p>
        </Reveal>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal>
            <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Where teams use it
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <Reveal key={useCase.title} delay={index * 90}>
                <LiquidGlassCard className="h-full rounded-2xl p-7" intensity="medium">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-light text-brand-green">
                    <useCase.icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 font-poppins text-base font-bold">{useCase.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{useCase.body}</p>
                </LiquidGlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
            From requirement to verdict in one call
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((step, index) => (
            <Reveal key={step.verb} delay={index * 90}>
              <LiquidGlassCard className="h-full rounded-2xl p-6" intensity="subtle">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-light text-brand-green">
                  <step.icon size={18} strokeWidth={1.8} />
                </div>
                <p className="mt-4 font-poppins text-base font-bold">{step.verb}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </LiquidGlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Interactive Multi-Agent Screening Scenario Studio */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="liquid-glass-pill px-3.5 py-1 text-xs font-bold text-emerald-700">
                Live Verification Studio
              </span>
              <h2 className="mt-3 font-poppins text-2xl font-bold tracking-tight md:text-3xl text-slate-900">
                Experience Multi-Agent Verification Live
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Select an institutional scenario to observe live SHA-256 integrity verification, zero-hallucination rubric scoring, and fraud radar inspection.
              </p>
            </div>
          </Reveal>
          <InteractiveStudio />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
                Built for your stack
              </h2>
              <p className="mt-4 max-w-[55ch] text-sm leading-relaxed text-slate-600">
                The M2M API is designed for ATS platforms, admissions systems, and border
                tooling. Dual-key authentication means your organization key alone returns
                nothing; the candidate's consent key is required on every query.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <ul className="space-y-3">
                {[
                  "Dual-key model: organization key plus candidate consent key",
                  "Batch screening endpoint for parallel candidate queues",
                  "Webhooks for key revocation and tamper alerts",
                  "Query quotas and expiry enforced per consent key",
                ].map((item) => (
                  <li key={item} className="liquid-glass-card flex items-start gap-3 rounded-xl p-4 text-sm text-slate-700">
                    <Webhook size={16} className="mt-0.5 shrink-0 text-brand-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <LiquidGlassCard className="rounded-3xl border border-brand-green/30 bg-brand-green-light/60 px-6 py-12 text-center md:px-12" intensity="subtle">
            <h2 className="mx-auto max-w-xl font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Screen your next cohort against verified records.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Register your organization, get an API key, and set up your first requirement
              rubric in the enterprise dashboard.
            </p>
            <Link
              href="/signup/organization"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-hover active:scale-[0.98]"
            >
              <span>Create organization account</span>
              <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </LiquidGlassCard>
        </Reveal>
      </section>
    </main>
  );
}
