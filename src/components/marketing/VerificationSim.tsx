"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  FileText,
  Hash,
  Link2,
  SearchCheck,
} from "lucide-react";
import { CheckCircle2Animated } from "@/components/ui/animated-icons";

const STAGES = [
  { id: "scan", label: "Scanning document", duration: 2200 },
  { id: "extract", label: "Extracting structured fields", duration: 2000 },
  { id: "hash", label: "Computing SHA-256", duration: 2200 },
  { id: "anchor", label: "Anchoring on-chain", duration: 2000 },
  { id: "query", label: "Enterprise query", duration: 3200 },
] as const;

const NODES = [
  { icon: FileText, label: "Scan" },
  { icon: Hash, label: "Hash" },
  { icon: Boxes, label: "Anchor" },
  { icon: SearchCheck, label: "Query" },
] as const;

const HASH_VALUE = "a3f9c18d2b74e6f05c91d8a2b6e34f07";

const EXTRACTED_FIELDS = [
  ["degree", "BSc Computer Engineering"],
  ["gpa", "4.62 / 5.0"],
  ["issuer", "University of Lagos"],
] as const;

function stageToNode(stageIndex: number): number {
  if (stageIndex <= 1) return 0;
  return stageIndex - 1;
}

/**
 * Looping simulation of the Sabi Vault verification pipeline:
 * scan a document, extract structured fields, hash it, anchor on-chain,
 * then answer a consented enterprise query. Transform/opacity only;
 * collapses to the final verified state under prefers-reduced-motion.
 */
export function VerificationSim() {
  const [stageIndex, setStageIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
      setStageIndex(STAGES.length - 1);
      return;
    }
    let cancelled = false;
    let timer: number;

    const advance = (index: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const next = (index + 1) % STAGES.length;
        setStageIndex(next);
        advance(next);
      }, STAGES[index].duration);
    };
    advance(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const stage = STAGES[stageIndex];
  const activeNode = stageToNode(stageIndex);

  return (
    <div
      className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl liquid-glass-card shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)]"
      role="img"
      aria-label="Simulation of a document being scanned, hashed, anchored on-chain, and verified by an enterprise query"
    >
      {/* Header: live stage indicator */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!reducedMotion && (
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-brand-green"
                style={{ animation: "simPulseRing 1.6s ease-out infinite" }}
              />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Live verification
          </span>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STAGES.map((s, index) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === stageIndex ? "w-5 bg-brand-green" : index < stageIndex ? "w-1.5 bg-brand-green/50" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Document with scan beam */}
      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-green shadow-sm">
              <FileText size={17} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-poppins text-sm font-bold text-brand-dark">
                BSc Computer Engineering
              </p>
              <p className="text-xs text-slate-500">University of Lagos · degree-certificate.pdf</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5" aria-hidden="true">
            <div className="h-1.5 w-11/12 rounded-full bg-slate-200/80" />
            <div className="h-1.5 w-8/12 rounded-full bg-slate-200/80" />
            <div className="h-1.5 w-9/12 rounded-full bg-slate-200/80" />
          </div>
          {stage.id === "scan" && !reducedMotion && (
            <div
              className="pointer-events-none absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-brand-green/25 to-transparent"
              style={{ animation: "simScanBeam 1.8s ease-in-out infinite" }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Pipeline nodes */}
      <div className="flex items-center justify-between px-7 py-4">
        {NODES.map((node, index) => {
          const isDone = reducedMotion || index < activeNode || (index === activeNode && stage.id === "query");
          const isActive = !reducedMotion && index === activeNode;
          return (
            <div key={node.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "border-brand-green bg-brand-green text-white"
                      : isDone
                        ? "border-brand-green/40 bg-brand-green-light text-brand-green"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2Animated size={16} strokeWidth={2} />
                  ) : (
                    <node.icon size={16} strokeWidth={1.8} />
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-300 ${
                    isActive ? "text-brand-green" : isDone ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {node.label}
                </span>
              </div>
              {index < NODES.length - 1 && (
                <div
                  className={`mx-1 mb-5 h-px flex-1 transition-colors duration-500 ${
                    index < activeNode || reducedMotion ? "bg-brand-green/50" : "bg-slate-200"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage detail panel (fixed height prevents layout shift) */}
      <div className="h-[7.5rem] border-t border-slate-100 bg-slate-50/50 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-green">
          {stage.label}
        </p>

        {stage.id === "scan" && (
          <div key="scan" style={{ animation: "simFadeSlide 0.35s ease-out" }}>
            <p className="mt-2 font-mono text-xs text-slate-600">
              drive://vault/degree-certificate.pdf
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Read-only OAuth · parsed in memory · buffer wiped after
            </p>
          </div>
        )}

        {stage.id === "extract" && (
          <div key="extract" className="mt-2 flex flex-wrap gap-1.5">
            {EXTRACTED_FIELDS.map(([field, value], index) => (
              <span
                key={field}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700"
                style={{ animation: `simFadeSlide 0.35s ease-out ${index * 120}ms both` }}
              >
                {field}: <span className="font-semibold text-brand-dark">{value}</span>
              </span>
            ))}
          </div>
        )}

        {stage.id === "hash" && (
          <div key="hash" style={{ animation: "simFadeSlide 0.35s ease-out" }}>
            <div className="mt-2 flex items-center gap-1 font-mono text-xs text-brand-dark">
              <span className="text-slate-500">sha256:</span>
              <span
                className="inline-block overflow-hidden whitespace-nowrap"
                style={{ animation: reducedMotion ? "none" : "simTyping 1.4s steps(32) both" }}
              >
                {HASH_VALUE}
              </span>
              {!reducedMotion && (
                <span
                  className="inline-block h-3.5 w-1.5 bg-brand-green"
                  style={{ animation: "simCaretBlink 0.8s step-end infinite" }}
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">One character changed, and this hash no longer matches.</p>
          </div>
        )}

        {stage.id === "anchor" && (
          <div key="anchor" style={{ animation: "simFadeSlide 0.35s ease-out" }}>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-lg bg-brand-dark px-2 py-1 font-mono text-[11px] font-semibold text-white">
                block 8,421,077
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                <Link2 size={12} /> tx 0x7f3e…c91a
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Anchored to the public registry. Cannot be edited later.</p>
          </div>
        )}

        {stage.id === "query" && (
          <div key="query" style={{ animation: "simFadeSlide 0.35s ease-out" }}>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700">
                GET /vault/query · scope: academics
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-bold text-white"
                style={{ animation: reducedMotion ? "none" : "simFadeSlide 0.4s ease-out 0.5s both" }}
              >
                <CheckCircle2Animated size={12} /> Verified · Tier 2 · hash match
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
