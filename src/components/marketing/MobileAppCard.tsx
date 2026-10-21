"use client";

import React from "react";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";
import { Smartphone, Lock, QrCode, ShieldCheck, Sparkles } from "lucide-react";

export function MobileAppCard() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full max-w-full overflow-hidden">
      <Reveal>
        <LiquidGlassCard className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-br from-white/95 via-emerald-50/30 to-white/95 p-5 sm:p-8 md:p-14 shadow-xl">
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="liquid-glass-pill inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                <Sparkles size={13} className="text-emerald-600" />
                <span>Mobile App Available</span>
              </span>

              <h2 className="mt-4 font-poppins text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Your verified credentials, <br />
                <span className="text-emerald-700">always in your pocket.</span>
              </h2>

              <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-600 max-w-xl">
                Access your degrees, bank statements, and ID cards anytime from your phone. Log in securely with Face ID or fingerprint, and share verified proof with a simple QR code scan.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-3 border border-slate-200/70 shadow-xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <Lock size={15} />
                  </span>
                  <span className="font-medium">Face ID &amp; Fingerprint Security</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/80 p-3 border border-slate-200/70 shadow-xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <QrCode size={15} />
                  </span>
                  <span className="font-medium">Instant 1-Tap QR Sharing</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Available on iOS (TestFlight) &amp; Android
                </p>
                <AppDownloadButtons size="lg" />
              </div>
            </div>

            {/* Right Mini Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-xs rounded-[2.5rem] bg-[#0f172a] p-6 text-white shadow-2xl border-4 border-slate-800">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-poppins font-bold">Sabi Mobile</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">v2.4 Beta</span>
                </div>

                <div className="my-6 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck size={28} />
                  </div>
                  <h4 className="font-poppins font-bold text-sm">Biometric Key Active</h4>
                  <p className="text-[11px] text-slate-400">
                    1-Tap Consent • 0 Raw Storage • Base L2
                  </p>
                </div>

                <div className="rounded-xl bg-slate-800/80 p-3 text-[11px] font-mono text-emerald-300 border border-slate-700/80 flex items-center justify-between">
                  <span>sbk_live_v1_...</span>
                  <span className="text-slate-400">7d TTL</span>
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </Reveal>
    </section>
  );
}
