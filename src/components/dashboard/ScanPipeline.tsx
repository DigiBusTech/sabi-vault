"use client";

import React, { useEffect, useState } from "react";
import { Check, FileText, Loader2, ShieldCheck } from "lucide-react";

const STAGES = [
  "🛡️ Sentinel Classifier Agent: Identifying layout, seals & document domain",
  "🔬 Forensic Integrity Radar: Verifying cryptographic authenticity & notary tier",
  "⚙️ Schema Normalizer: Extracting zero-hallucination NDPC/GDPR structured JSON",
  "⛓️ Base Sepolia Anchor: Committing mathematical SHA-256 hash on-chain",
  "🧭 Sovereign Advisor: Updating target readiness & auto-synthesizing persona dossiers",
] as const;

interface ScanPipelineProps {
  /** True while the sync request is in flight. */
  active: boolean;
  /** Set true when the API resolves successfully; completes all stages. */
  done: boolean;
  fileName: string;
}

/**
 * Staged scan simulation shown while a document streams through the
 * ephemeral parser. Stage timing is illustrative; the final stage only
 * completes when the API actually resolves (fail-honest, not a fake
 * progress bar). All motion is CSS/composited and reduced-motion safe.
 */
export function ScanPipeline({ active, done, fileName }: ScanPipelineProps) {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    setStage(0);
    const timer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 2));
    }, 750);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (done) setStage(STAGES.length - 1);
  }, [done]);

  const resolvedStage = done ? STAGES.length - 1 : stage;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      {/* Document under scan */}
      <div className="relative mx-auto mb-4 flex h-24 w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
        <FileText className="h-8 w-8 text-slate-300" />
        <span className="absolute bottom-2 left-1/2 max-w-[85%] -translate-x-1/2 truncate text-[10px] font-semibold text-slate-500">
          {fileName}
        </span>
        {!done && (
          <span
            aria-hidden="true"
            className="absolute left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
            style={{ animation: "simScanBeam 1.6s ease-in-out infinite" }}
          />
        )}
        {done && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/85">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white"
              style={{ animation: "preloaderCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
              <ShieldCheck className="h-5 w-5" />
            </span>
          </span>
        )}
      </div>

      {/* Stage list */}
      <ol className="space-y-2">
        {STAGES.map((label, i) => {
          const isComplete = i < resolvedStage || done;
          const isCurrent = !done && i === resolvedStage;
          return (
            <li key={label} className="flex items-center gap-2.5 text-xs">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  isComplete
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : isCurrent
                    ? "border-emerald-500 bg-white text-emerald-600"
                    : "border-slate-200 bg-white text-slate-300"
                }`}
                style={isCurrent ? { animation: "scanStagePulse 1.2s ease-out infinite" } : undefined}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : isCurrent ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                )}
              </span>
              <span
                className={`font-medium transition-colors duration-300 ${
                  isComplete ? "text-emerald-800" : isCurrent ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Hash stream strip */}
      <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5">
        <div
          className="whitespace-nowrap font-mono text-[10px] text-emerald-400/80"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(52,211,153,0.25) 0%, rgba(52,211,153,0.9) 50%, rgba(52,211,153,0.25) 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            animation: done ? "none" : "hashStream 1.4s linear infinite",
          }}
        >
          {done
            ? "sha256 anchored · buffer zeroed · zero raw storage"
            : "9f2c41ab07e6d5c3 1a8f0e4b92d7c6a5 f3e8b1d40c97a2b6 5d0c3f8e1a4b6972"}
        </div>
      </div>
    </div>
  );
}
