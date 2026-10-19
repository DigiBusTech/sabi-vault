"use client";

import React, { useEffect, useState, useCallback } from "react";

const DISPLAY_MS = 1350;
const EXIT_MS = 400;

/**
 * SabiProfile site preloader.
 * High-performance, luxury 2D brand assembly with liquid glass accents.
 * Unlocks scroll immediately upon exit; click to skip enabled.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"shown" | "exiting" | "hidden">("shown");

  const dismiss = useCallback(() => {
    setPhase("exiting");
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "";
    }
    window.setTimeout(() => {
      setPhase("hidden");
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof document !== "undefined") {
      document.documentElement.style.overflow = "hidden";
    }

    const exitTimer = window.setTimeout(() => {
      dismiss();
    }, DISPLAY_MS);

    return () => {
      window.clearTimeout(exitTimer);
      if (typeof document !== "undefined") {
        document.documentElement.style.overflow = "";
      }
    };
  }, [dismiss]);

  if (phase === "hidden") return null;

  const letters = "SabiProfile".split("");

  return (
    <div
      role="status"
      aria-label="Loading SabiProfile"
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-center bg-white/95 backdrop-blur-2xl transition-all duration-400 ease-out ${
        phase === "exiting" ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 400px at 50% 45%, rgba(5,150,105,0.12), transparent 70%)",
        }}
      />

      {/* Brand Icon Assembly */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Orbit ring with emerald satellite */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-emerald-300/60"
          style={{ animation: "preloaderOrbit 2.4s linear infinite" }}
        >
          <span className="absolute -top-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(5,150,105,0.8)]" />
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full border border-dashed border-slate-200"
          style={{ animation: "preloaderOrbit 4s linear infinite reverse" }}
        />

        {/* Shield draw */}
        <svg
          viewBox="0 0 64 64"
          className="h-14 w-14 drop-shadow-sm"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M32 6 L52 14 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V14 Z"
            stroke="#059669"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeDasharray="320"
            strokeDashoffset="320"
            style={{ animation: "preloaderDraw 0.8s cubic-bezier(0.16,1,0.3,1) 0.05s forwards" }}
          />
          <path
            d="M23 32 L29.5 38.5 L42 25"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 0,
              animation: "preloaderCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.65s forwards",
            }}
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="mt-5 flex items-center gap-[3px]" aria-hidden="true">
        {letters.map((ch, i) => (
          <span
            key={i}
            className="font-poppins text-lg font-extrabold tracking-[0.34em] text-slate-900"
            style={{
              opacity: 0,
              animation: `preloaderRise 0.35s cubic-bezier(0.16,1,0.3,1) ${0.35 + i * 0.035}s forwards`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <p
        className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-600/90"
        style={{ opacity: 0, animation: "preloaderRise 0.3s ease 0.65s forwards" }}
      >
        Sovereign Data Infrastructure
      </p>

      {/* Progress bar */}
      <div className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full w-full origin-left rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.6)]"
          style={{
            transform: "scaleX(0)",
            animation: `preloaderBar ${DISPLAY_MS}ms cubic-bezier(0.16,1,0.3,1) 0.05s forwards`,
          }}
        />
      </div>

      <span className="mt-4 text-[10px] font-medium text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
        Click anywhere to skip
      </span>
    </div>
  );
}

