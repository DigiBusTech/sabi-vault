import { AlertTriangle, FileText, Hash, Link2, Pencil } from "lucide-react";
import { CheckCircle2Animated } from "@/components/ui/animated-icons";

/**
 * Problem-section visual: contrasts a static PDF (editable after issue, unverifiable)
 * with a Sabi Vault record (hash-anchored, verifiable in real time). CSS-only motion,
 * neutralized globally under prefers-reduced-motion.
 */
export function TamperVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg space-y-4"
      role="img"
      aria-label="Comparison: a static PDF can be edited after issue with no way to detect it, while a Sabi Vault record is hash-anchored and verified in real time"
    >
      {/* The paper way */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <FileText size={17} strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-poppins text-sm font-bold text-brand-dark">degree-certificate.pdf</p>
              <p className="text-xs text-slate-500">Static document · emailed as attachment</p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700"
            style={{ animation: "simTamperFlicker 3.2s ease-in-out infinite" }}
          >
            <Pencil size={11} />
            edited after issue
          </span>
        </div>
        <div className="mt-3.5 space-y-1.5" aria-hidden="true">
          <div className="h-1.5 w-10/12 rounded-full bg-slate-200/80" />
          <div className="h-1.5 w-7/12 rounded-full bg-slate-200/80" />
          <div className="h-1.5 w-9/12 rounded-full bg-slate-200/80" />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5 text-xs font-semibold text-red-700">
          <AlertTriangle size={14} />
          No proof the content is unchanged. Every recipient re-verifies from zero.
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-2" aria-hidden="true">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">replaced by</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* The Sabi Vault way */}
      <div className="liquid-glass-card rounded-2xl border-brand-green/30 bg-emerald-50/70 p-5 shadow-[0_12px_30px_-18px_rgba(5,150,105,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-green shadow-sm">
              <FileText size={17} strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-poppins text-sm font-bold text-brand-dark">BSc Computer Engineering</p>
              <p className="text-xs text-slate-600">Structured record · anchored on-chain</p>
            </div>
          </div>
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <span
              className="absolute inset-0 rounded-full bg-brand-green"
              style={{ animation: "simPulseRing 2s ease-out infinite" }}
              aria-hidden="true"
            />
            <CheckCircle2Animated size={13} className="relative text-white" />
            <span className="relative">integrity proven</span>
          </span>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="liquid-glass-pill inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] text-slate-700 shadow-sm">
            <Hash size={11} className="text-brand-green" />
            a3f9c18d…e34f07
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-3 py-1.5 font-mono text-[11px] text-white">
            <Link2 size={11} />
            block 8,421,077
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-brand-green/20 pt-3.5 text-xs font-semibold text-brand-green-hover">
          <CheckCircle2Animated size={15} />
          Hash recomputed on every query. One changed character fails the check.
        </div>
      </div>
    </div>
  );
}
