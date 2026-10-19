"use client";

import React, { useState } from "react";
import {
  LandmarkAnimated,
  ShieldCheckAnimated,
  Building2Animated,
  ArrowRightAnimated,
  SparklesAnimated,
} from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";

export function GovTechCalculator() {
  const [monthlyQueries, setMonthlyQueries] = useState<number>(50000);
  const feePerQuery = 1.0; // $1.00 USD standard API query cost

  const totalMonthlyVolumeUsd = monthlyQueries * feePerQuery;
  const platformRevenue = totalMonthlyVolumeUsd * 0.6; // 60%
  const sovereignHostPayout = totalMonthlyVolumeUsd * 0.4; // 40%
  const annualSovereignHostPayout = sovereignHostPayout * 12;

  return (
    <section className="border-y border-slate-200 bg-slate-50/60 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#059669]">
              Sovereign Partnership Model
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
              GovTech 60/40 Smart Contract Revenue Engine
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Sabi Vault aligns sovereign nation state incentives. For every enterprise query verifying citizen credentials, 40% of the query fee is atomically routed to the sovereign host government’s digital identity hub.
            </p>
          </div>
        </Reveal>

        {/* Double-Bezel Interactive Calculator Enclosure */}
        <div className="mt-14 max-w-4xl mx-auto rounded-[2rem] border border-slate-200 bg-white p-2 shadow-xl">
          <div className="rounded-[calc(2rem-0.5rem)] border border-slate-200 bg-slate-50/50 p-6 md:p-10">
            {/* Slider Control */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="query-slider" className="font-poppins text-sm font-bold text-[#0f172a]">
                  Simulated Monthly Enterprise Verifications
                </label>
                <span className="font-poppins text-2xl font-extrabold text-[#059669]">
                  {monthlyQueries.toLocaleString()} <span className="text-sm font-normal text-slate-500">queries/mo</span>
                </span>
              </div>

              <input
                id="query-slider"
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={monthlyQueries}
                onChange={(e) => setMonthlyQueries(Number(e.target.value))}
                className="mt-5 w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
              />

              <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
                <span>5,000 queries</span>
                <span>250,000 queries</span>
                <span>500,000 queries</span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-xs font-bold text-[#0f172a] mb-2">
                <span>Platform Treasury (60%)</span>
                <span>Sovereign Host Hub (40%)</span>
              </div>
              <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-200 p-0.5">
                <div
                  className="h-full rounded-l-full bg-[#0f172a] transition-all duration-300"
                  style={{ width: "60%" }}
                />
                <div
                  className="h-full rounded-r-full bg-[#059669] transition-all duration-300"
                  style={{ width: "40%" }}
                />
              </div>
            </div>

            {/* Output Metric Cards */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Query Gross */}
              <LiquidGlassCard className="p-6 rounded-2xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Monthly Volume
                </span>
                <p className="mt-2 font-poppins text-3xl font-extrabold text-[#0f172a]">
                  ${totalMonthlyVolumeUsd.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Based on standard $1.00 query unit fee
                </p>
              </LiquidGlassCard>

              {/* Sovereign Host State Payout */}
              <LiquidGlassCard className="p-6 rounded-2xl border-emerald-200/80 bg-emerald-50/70 shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                  Host Nation Hub Payout (40%)
                </span>
                <p className="mt-2 font-poppins text-3xl font-extrabold text-[#059669]">
                  ${sovereignHostPayout.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> /mo</span>
                </p>
                <p className="mt-1 text-xs text-[#047857]">
                  <strong>${annualSovereignHostPayout.toLocaleString()}</strong> projected annually
                </p>
              </LiquidGlassCard>

              {/* Sabi Platform Treasury */}
              <LiquidGlassCard className="p-6 rounded-2xl sm:col-span-2 lg:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Platform Operations (60%)
                </span>
                <p className="mt-2 font-poppins text-3xl font-extrabold text-[#0f172a]">
                  ${platformRevenue.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> /mo</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Maintains regional consensus nodes &amp; AI
                </p>
              </LiquidGlassCard>
            </div>

            {/* Smart Contract Guarantee Footnote */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/60 pt-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheckAnimated size={16} className="text-[#059669]" />
                <span>Non-custodial split executed by smart contract on Base Sepolia.</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
                <span>Zero intermediaries • Zero counterparty risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

