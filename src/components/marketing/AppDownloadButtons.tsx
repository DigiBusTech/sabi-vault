"use client";

import React, { useState } from "react";
import { NativeAppDownloadModal } from "@/components/pwa/NativeAppDownloadModal";

export function AppDownloadButtons({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");

  const onOpen = (p: "ios" | "android") => {
    setPlatform(p);
    setModalOpen(true);
  };

  const pad = size === "sm" ? "px-3 py-1.5" : size === "lg" ? "px-5 py-3" : "px-4 py-2";

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        <button
          type="button"
          onClick={() => onOpen("ios")}
          className={`inline-flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-[#0f172a] ${pad} text-white shadow-md transition-all hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
          aria-label="Download on Apple App Store"
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
          className={`inline-flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-[#0f172a] ${pad} text-white shadow-md transition-all hover:border-emerald-500/60 hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
          aria-label="Get it on Google Play"
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

      {/* Full-Screen Native Store Modal (rendered via document.body portal) */}
      <NativeAppDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlatform={platform}
      />
    </>
  );
}
