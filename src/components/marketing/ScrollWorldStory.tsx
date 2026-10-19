"use client";

import React, { useState } from "react";
import { CheckCircle2Animated, SparklesAnimated, ArrowRightAnimated } from "@/components/ui/animated-icons";
import { LiquidGlassCard } from "@/components/ui/LiquidGlass";
import { Reveal } from "@/components/marketing/Reveal";

const STAGES = [
  {
    step: "01",
    tag: "Zero-Raw Sync",
    title: "Files stay in your private cloud drive.",
    desc: "Connect Google Drive or Dropbox with OAuth 2.0. We stream documents into an ephemeral in-memory buffer, compute SHA-256, and immediately wipe the memory buffer to 0x00.",
    badge: "Ephemeral Memory",
    codeLabel: "Memory Sanitization",
    code: `const sha256 = crypto.sha256(fileBuffer);\nconst data = await parse(fileBuffer);\nfileBuffer.fill(0); // 0x00 wiped`,
    stats: [{ label: "Server Files", val: "0" }, { label: "Memory Retention", val: "0 ms" }],
  },
  {
    step: "02",
    tag: "Blockchain Anchor",
    title: "Anchored to Base Sepolia L2 contracts.",
    desc: "Every credential's SHA-256 hash is committed on-chain. When checked by an employer or visa officer, our integrity engine recomputes the hash in 4ms. Alterations fail closed.",
    badge: "Smart Contract",
    codeLabel: "Anti-Tamper Check",
    code: `const isMatch = onChainHash === computedHash;\nif (!isMatch) {\n  return { status: "REJECTED_TAMPER_DETECTED" };\n}`,
    stats: [{ label: "Tamper Proof", val: "100%" }, { label: "Ledger Check", val: "4 ms" }],
  },
  {
    step: "03",
    tag: "Scoped Keys",
    title: "Mint scoped, expiring keys with kill-switch.",
    desc: "Stop emailing PDF copies of passports and degrees. Mint a cryptographic key exposing only permitted categories (e.g. academics only), set a query quota, and revoke anytime.",
    badge: "Scoped API Keys",
    codeLabel: "Scoped Key Policy",
    code: `{\n  "vaultId": "usr_chinwe_okafor",\n  "allowedScopes": ["academics"],\n  "maxQueries": 5,\n  "expiresAt": 1792740298\n}`,
    stats: [{ label: "Selective Scope", val: "6 Domains" }, { label: "Revoke Speed", val: "Instant" }],
  },
];

export function ScrollWorldStory() {
  const [active, setActive] = useState(0);
  const cur = STAGES[active];

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 font-sans">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="liquid-glass-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-[#059669]">
            <SparklesAnimated size={13} />
            <span>Cryptographic Architecture</span>
          </div>
          <h2 className="mt-3 font-poppins text-3xl font-extrabold text-[#0f172a] sm:text-4xl">
            How SabiProfile Protects Data
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            From your private cloud drive to on-chain verification, personal data is protected by mathematical invariants.
          </p>
        </div>
      </Reveal>

      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="liquid-glass-pill inline-flex p-1.5 gap-1.5 rounded-full border border-slate-200 bg-white/70">
          {STAGES.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setActive(idx)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all font-poppins whitespace-nowrap ${
                active === idx ? "bg-[#059669] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className={`h-4 w-4 rounded-full text-[10px] flex items-center justify-center ${active === idx ? "bg-white/20" : "bg-slate-200"}`}>{s.step}</span>
              <span>{s.tag}</span>
            </button>
          ))}
        </div>
      </div>

      <Reveal key={active}>
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          <LiquidGlassCard className="lg:col-span-6 p-7 rounded-3xl flex flex-col justify-between border border-slate-200 shadow-md">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-extrabold text-[#059669]">Stage {cur.step}/03</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">{cur.badge}</span>
              </div>
              <h3 className="mt-4 font-poppins text-2xl font-extrabold text-[#0f172a]">{cur.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{cur.desc}</p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
              {cur.stats.map((st) => (
                <div key={st.label} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">{st.label}</p>
                  <p className="mt-1 font-poppins text-lg font-bold text-[#059669]">{st.val}</p>
                </div>
              ))}
            </div>
          </LiquidGlassCard>

          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-[#0f172a] text-white p-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs text-slate-400">{cur.codeLabel}</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">ENFORCED IN CODE</span>
            </div>
            <pre className="my-4 overflow-x-auto text-xs font-mono text-emerald-300 p-2">
              <code>{cur.code}</code>
            </pre>
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2Animated size={13} className="text-emerald-400" /> Base Sepolia L2</span>
              <button type="button" onClick={() => setActive((active + 1) % STAGES.length)} className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span>Next</span> <ArrowRightAnimated size={12} />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
