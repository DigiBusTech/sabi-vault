"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Smartphone } from "lucide-react";
import { ArrowRightAnimated } from "@/components/ui/animated-icons";

export function AppDownloadButtons({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onOpen = (p: "ios" | "android") => {
    setPlatform(p);
    setDone(false);
    setEmail("");
    setOpen(true);
  };

  const pad = size === "sm" ? "px-3 py-1.5" : size === "lg" ? "px-5 py-3" : "px-4 py-2";

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        <button
          type="button"
          onClick={() => onOpen("ios")}
          className={`inline-flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-[#0f172a] ${pad} text-white shadow-md transition-all hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98]`}
        >
          <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-wider text-slate-300">Download on the</span>
            <span className="text-xs font-bold leading-tight font-poppins">App Store</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpen("android")}
          className={`inline-flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-[#0f172a] ${pad} text-white shadow-md transition-all hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98]`}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" fill="#059669" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-[8px] uppercase tracking-wider text-slate-300">GET IT ON</span>
            <span className="text-xs font-bold leading-tight font-poppins">Google Play</span>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-800">
              <X size={14} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <Smartphone size={20} />
              </span>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <Sparkles size={10} className="text-emerald-600" />
                  {platform === "ios" ? "iOS TestFlight" : "Android Google Play"}
                </span>
                <h3 className="font-poppins text-base font-bold text-slate-900">Sabi Mobile Vault</h3>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Native mobile app in private beta: biometric FaceID unlock, zero-raw cloud document sync, and offline QR-scoped sharing.
            </p>
            <div className="mt-4 border-t border-slate-100 pt-4">
              {done ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-900">
                    You&apos;re on the list! We&apos;ll notify {email} when {platform === "ios" ? "TestFlight" : "Google Play"} drops.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }} className="space-y-2.5">
                  <input
                    type="email"
                    required
                    placeholder="Enter email for private beta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#059669] py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98]">
                    <span>Get Notified on Launch</span>
                    <ArrowRightAnimated size={12} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
