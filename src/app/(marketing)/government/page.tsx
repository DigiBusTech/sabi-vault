import type { Metadata } from "next";
import Link from "next/link";
import { Coins, Radar } from "lucide-react";
import {
  ArrowRightAnimated,
  Globe2Animated,
  LandmarkAnimated,
  ShieldCheckAnimated,
} from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";
import { GovTechCalculator } from "@/components/marketing/GovTechCalculator";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";

export const metadata: Metadata = {
  title: "For Governments | Sabi Vault",
  description:
    "Sovereign regional data nodes, NDPC and GDPR residency, national verification telemetry, and a smart-contract revenue share for host states.",
};

const borderFlow = [
  { verb: "Receive", body: "The applicant shares a scoped key at the visa or border desk. No emailed PDFs, no notarized photocopies in a folder." },
  { verb: "Verify", body: "The Integrity Agent recomputes each record's hash against the on-chain anchor before any content is read." },
  { verb: "Decide", body: "Officers see only the consented categories, with Tier 2 legalized documents carrying the notary seal on-chain." },
];

export default function GovernmentPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="mx-auto max-w-7xl px-5 pt-20 pb-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
            For governments & sovereign authorities
          </p>
          <h1 className="mt-4 max-w-3xl font-poppins text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
            Sovereign verification, on infrastructure your state controls.
          </h1>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-slate-600 md:text-lg">
            Sabi Vault hosts structured citizen records on regional database nodes inside your
            jurisdiction, anchors cryptographic proofs to Base Sepolia, and distributes 40% of query
            revenue directly to the host sovereign nation via smart contract.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-hover active:scale-[0.98]"
            >
              <span>Pilot a Sovereign Hub</span>
              <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <AppDownloadButtons size="sm" />
          </div>
        </Reveal>
      </section>

      {/* GovTech 40% Smart Contract Revenue Calculator */}
      <section className="border-t border-slate-200 bg-slate-50/50 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="liquid-glass-pill px-3 py-1 text-xs font-bold text-emerald-700">
                SabiRevenueSplitter.sol
              </span>
              <h2 className="mt-3 font-poppins text-2xl font-bold tracking-tight md:text-3xl text-slate-900">
                40% Sovereign Host Fiscal Micro-Transaction Calculator
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Calculate projected monthly revenue distributions disbursed on-chain to your national digital identity or regulatory authority.
              </p>
            </div>
          </Reveal>
          <GovTechCalculator />
        </div>
      </section>


      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal>
            <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Border and immigration, without the paperwork chase
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {borderFlow.map((step, index) => (
              <Reveal key={step.verb} delay={index * 90}>
                <LiquidGlassCard className="h-full rounded-2xl p-6" intensity="subtle">
                  <p className="font-poppins text-lg font-bold text-brand-green">{step.verb}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </LiquidGlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Globe2Animated,
              title: "Data residency by design",
              body: "Structured records are partitioned across regional nodes so citizen data stays under NDPC, GDPR, or your local residency law. Raw documents never enter the platform at all.",
            },
            {
              icon: Radar,
              title: "National integrity telemetry",
              body: "A fraud radar aggregates tamper alerts, revoked keys, and verification outcomes across the node, giving regulators a live view of credential integrity.",
            },
            {
              icon: Coins,
              title: "A revenue share, enforced in code",
              body: "The splitter contract routes 40% of every query fee to the sovereign node host and 60% to the platform. The split executes on-chain, not by invoice.",
            },
          ].map((card, index) => (
            <Reveal key={card.title} delay={index * 90}>
              <LiquidGlassCard className="h-full rounded-2xl p-7" intensity="medium">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green-light text-brand-green">
                  <card.icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-poppins text-base font-bold">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{card.body}</p>
              </LiquidGlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="font-poppins text-2xl font-bold tracking-tight md:text-3xl">
                  Deployment model
                </h2>
                <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-slate-600">
                  A sovereign node is a dedicated PostgreSQL or Supabase instance inside your
                  region, paired with the national notary registry and the verification API.
                  Citizens keep their documents in their own cloud storage; the node holds only
                  structured, schema-validated records and audit logs.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Regional database node under your jurisdiction",
                  "Accredited notary onboarding for Tier 2 attestation",
                  "On-chain hash anchoring with public auditability",
                  "Programmatic 40% revenue disbursement to the host",
                ].map((item) => (
                  <li key={item} className="liquid-glass-card flex items-start gap-3 rounded-xl p-4 text-sm text-slate-700">
                    <ShieldCheckAnimated size={16} className="mt-0.5 shrink-0 text-brand-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <LiquidGlassCard className="rounded-3xl border border-brand-green/30 bg-brand-green-light/60 px-6 py-12 text-center md:px-12" intensity="subtle">
            <LandmarkAnimated size={32} className="mx-auto text-brand-green" strokeWidth={1.8} />
            <h2 className="mx-auto mt-4 max-w-xl font-poppins text-2xl font-bold tracking-tight md:text-3xl">
              Pilot a sovereign node with us.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              We work with a small number of host governments at a time. Start the conversation.
            </p>
            <Link
              href="/contact"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-hover active:scale-[0.98]"
            >
              <span>Talk to us</span>
              <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </LiquidGlassCard>
        </Reveal>
      </section>
    </main>
  );
}
