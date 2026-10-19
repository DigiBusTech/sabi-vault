"use client";

import React from "react";
import Link from "next/link";
import { Building2, Landmark, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { ArrowRightAnimated } from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";

export function AudienceCards() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 font-sans">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
            Target Sectors &amp; Gateways
          </span>
          <h2 className="mt-3 font-poppins text-3xl font-extrabold text-[#0f172a] sm:text-4xl">
            Sovereign Infrastructure by Sector
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Engineered specifically for national regulators and international hiring organizations.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-8 md:grid-cols-2">
        {/* For Governments Card */}
        <Reveal>
          <LiquidGlassCard className="h-full p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
                <Landmark size={24} />
              </span>
              <span className="mt-6 inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                Sovereign States &amp; Regulators
              </span>
              <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                For Governments &amp; Border Security
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Deploy regional sovereign database nodes satisfying NDPC and GDPR data residency. Inspect real-time national fraud telemetry and collect 40% of verification fees via Base Sepolia smart contract.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/government"
                className="group inline-flex items-center gap-2 font-poppins text-sm font-bold text-[#059669] hover:text-[#047857]"
              >
                <span>Explore Government Hub &amp; Revenue Splitter</span>
                <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </LiquidGlassCard>
        </Reveal>

        {/* For Enterprises Card */}
        <Reveal delay={100}>
          <LiquidGlassCard className="h-full p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
                <Building2 size={24} />
              </span>
              <span className="mt-6 inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                Hiring &amp; University Admissions
              </span>
              <h3 className="mt-3 font-poppins text-2xl font-bold text-[#0f172a]">
                For Enterprises &amp; Institutions
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Query candidate credentials through our M2M API with programmatic consent. Ingest unstructured job descriptions into strict criteria rubrics with our 5-agent zero-hallucination screening engine.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/enterprise"
                className="group inline-flex items-center gap-2 font-poppins text-sm font-bold text-[#059669] hover:text-[#047857]"
              >
                <span>Explore Enterprise API &amp; Screening Studio</span>
                <ArrowRightAnimated size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </LiquidGlassCard>
        </Reveal>
      </div>
    </section>
  );
}
