"use client";

import React, { useEffect, useState, useCallback } from "react";

const DISPLAY_MS = 1400;
const EXIT_MS = 380;

/**
 * SabiProfile Native Mobile-First App Preloader.
 * High-performance, luxury 2D brand splash optimized for mobile screens (100dvh)
 * and responsive desktop viewports with zero horizontal overflow or displacement.
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

  return (
    <div
      role="status"
      aria-label="Loading SabiProfile"
      onClick={dismiss}
      className={`fixed inset-0 top-0 left-0 w-screen h-[100dvh] max-w-[100vw] z-[99999] overflow-hidden flex flex-col items-center justify-center p-6 bg-white cursor-pointer select-none transition-all duration-380 ease-out ${
        phase === "exiting"
          ? "opacity-0 scale-[1.02] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient soft glow (bounded to viewport) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Center Native App Icon Assembly */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulse / Orbit Ring */}
        <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-[2rem] border border-emerald-300/40"
            style={{ animation: "preloaderOrbit 3s linear infinite" }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(5,150,105,0.8)]" />
          </span>

          {/* App Squircle Icon */}
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] shadow-xl shadow-emerald-700/25 ring-1 ring-white/60">
            <svg
              viewBox="0 0 64 64"
              className="h-10 w-10 sm:h-12 sm:w-12 text-white"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M32 6 L52 14 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V14 Z"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeDasharray="320"
                strokeDashoffset="320"
                style={{
                  animation:
                    "preloaderDraw 0.75s cubic-bezier(0.16,1,0.3,1) 0.05s forwards",
                }}
              />
              <path
                d="M23 32 L29.5 38.5 L42 25"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  opacity: 0,
                  animation:
                    "preloaderCheckPop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.6s forwards",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Clean Modern Typography */}
        <div className="mt-5 text-center">
          <h1 className="font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
            SabiProfile
          </h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
            <span>Sovereign OS • Base Sepolia</span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-5 h-1.5 w-36 sm:w-44 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.6)]"
            style={{
              transform: "scaleX(0)",
              animation: `preloaderBar ${DISPLAY_MS}ms cubic-bezier(0.16,1,0.3,1) 0.05s forwards`,
            }}
          />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Tap anywhere to skip
        </p>
      </div>
    </div>
  );
}
