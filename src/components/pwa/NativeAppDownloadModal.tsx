"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  CheckCircle2,
  Download,
  Star,
  Share2,
  Shield,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Check,
  Lock,
  Cpu,
  Globe2,
  ArrowLeft,
  Search,
  MoreVertical,
  Key,
} from "lucide-react";
import { ShieldCheckAnimated, ArrowRightAnimated } from "@/components/ui/animated-icons";

export interface NativeAppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: "ios" | "android";
}

export function NativeAppDownloadModal({
  isOpen,
  onClose,
  initialPlatform = "ios",
}: NativeAppDownloadModalProps) {
  const [platform, setPlatform] = useState<"ios" | "android">(initialPlatform);
  const [mounted, setMounted] = useState(false);
  const [installState, setInstallState] = useState<"idle" | "downloading" | "installing" | "installed">("idle");
  const [progress, setProgress] = useState(0);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlatform(initialPlatform);
    setInstallState("idle");
    setProgress(0);
  }, [initialPlatform, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleInstallClick = async () => {
    if (typeof window !== "undefined" && window.deferredPwaPrompt) {
      try {
        window.deferredPwaPrompt.prompt();
        const { outcome } = await window.deferredPwaPrompt.userChoice;
        if (outcome === "accepted") {
          setInstallState("installed");
          window.deferredPwaPrompt = null;
          return;
        }
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
    }

    if (installState === "installed") {
      window.location.href = "/pwa";
      return;
    }

    // High-fidelity install simulation
    setInstallState("downloading");
    setProgress(20);

    setTimeout(() => {
      setProgress(60);
      setInstallState("downloading");
    }, 450);

    setTimeout(() => {
      setProgress(95);
      setInstallState("installing");
    }, 900);

    setTimeout(() => {
      setProgress(100);
      setInstallState("installed");
    }, 1350);
  };

  const screenshots = [
    {
      title: "Sovereign Citizen Vault",
      subtitle: "6 domains of cryptographic identity",
      badge: "Citizen OS",
      content: (
        <div className="space-y-2 p-3 text-left text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900">Active Profile</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
              Verified
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2 text-[10px] space-y-1 border border-slate-100">
            <p className="font-semibold text-slate-900">Chinwe Okafor</p>
            <p className="text-slate-500">B.Sc Computer Science • 4.80 GPA</p>
            <p className="text-emerald-700 font-mono text-[9px]">Hash: 0x8f3c...e421</p>
          </div>
        </div>
      ),
    },
    {
      title: "Biometric Hardware Enclave",
      subtitle: "FaceID & NFC Attestation",
      badge: "Security",
      content: (
        <div className="space-y-2 p-3 text-left text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900">Enclave Attestation</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
              Active
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2 text-[10px] space-y-1 border border-slate-100">
            <p className="font-semibold text-slate-900">Biometric Verification: Passed</p>
            <p className="text-slate-500">Physical files never leave private cloud</p>
            <p className="text-emerald-700 font-mono text-[9px]">Base Sepolia: Block #19,421,802</p>
          </div>
        </div>
      ),
    },
    {
      title: "Zero-Hallucination Screening",
      subtitle: "Enterprise Deterministic RAG",
      badge: "Enterprise",
      content: (
        <div className="space-y-2 p-3 text-left text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-slate-900">Multi-Agent Audit</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
              Score: 94/100
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-2 text-[10px] space-y-1 border border-slate-100">
            <p className="font-semibold text-slate-900">Integrity Agent: TAMPER_FREE</p>
            <p className="text-slate-500">Direct schema evaluation in 2.4s</p>
            <p className="text-emerald-700 font-mono text-[9px]">4ms Cryptographic Check</p>
          </div>
        </div>
      ),
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-screen h-[100dvh] max-w-[100vw] overflow-y-auto bg-white text-slate-900 flex flex-col sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-[2.5rem] sm:shadow-2xl sm:border sm:border-slate-200/80 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP STATUS BAR & PLATFORM SWITCHER */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-700">
              {platform === "ios" ? "Apple App Store" : "Google Play Store"}
            </span>
          </div>

          {/* Platform Toggle Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setPlatform("ios");
                setInstallState("idle");
                setProgress(0);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                platform === "ios"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
              </svg>
              <span>iOS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlatform("android");
                setInstallState("idle");
                setProgress(0);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                platform === "android"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" fill="#059669" />
              </svg>
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 ml-1"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* STORE PRODUCT HEADER */}
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* App Icon */}
            <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] shadow-xl shadow-emerald-700/20 ring-1 ring-white/60">
              <svg className="h-11 w-11 sm:h-14 sm:w-14 text-white fill-current" viewBox="0 0 512 512">
                <path d="M256 64L392 124V252C392 344.4 334.4 429.2 256 452C177.6 429.2 120 344.4 120 252V124L256 64Z" />
              </svg>
            </div>

            {/* App Title & Metadata */}
            <div className="flex-1 min-w-0">
              <h2 className="font-poppins text-lg sm:text-2xl font-extrabold text-slate-900 leading-tight">
                SabiProfile: Sovereign Vault
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">
                Sabi AI Technologies Ltd
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {platform === "ios"
                  ? "Identity & Cryptographic Proofs • In-App Purchases"
                  : "Verified by Play Protect • No Ads"}
              </p>

              {/* Install / GET Action Button */}
              <div className="mt-3.5">
                {installState === "idle" && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                      platform === "ios"
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
                        : "bg-[#059669] text-white hover:bg-[#047857] shadow-emerald-700/25"
                    }`}
                  >
                    <Download size={14} />
                    <span>{platform === "ios" ? "GET" : "Install"}</span>
                  </button>
                )}

                {installState === "downloading" && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-slate-700">Downloading {progress}%...</span>
                  </div>
                )}

                {installState === "installing" && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-slate-700">Installing to device...</span>
                  </div>
                )}

                {installState === "installed" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = "/pwa";
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-700/25 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>OPEN APP</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* STORE STATS BAR */}
          <div className="mt-6 grid grid-cols-4 divide-x divide-slate-100 rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
            <div>
              <p className="font-poppins text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-center gap-0.5">
                <span>4.9</span>
                <Star size={11} className="fill-amber-400 text-amber-400" />
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">2.4K Ratings</p>
            </div>
            <div>
              <p className="font-poppins text-xs sm:text-sm font-extrabold text-slate-900">#1</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Identity</p>
            </div>
            <div>
              <p className="font-poppins text-xs sm:text-sm font-extrabold text-slate-900">4+</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Age Rated</p>
            </div>
            <div>
              <p className="font-poppins text-xs sm:text-sm font-extrabold text-slate-900">18 MB</p>
              <p className="text-[10px] text-slate-500 mt-0.5">App Size</p>
            </div>
          </div>

          {/* PREVIEW SCREENSHOTS CAROUSEL */}
          <div className="mt-6">
            <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              App Preview &amp; Screenshots
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {screenshots.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                      {item.badge}
                    </span>
                    <h4 className="mt-2 font-poppins text-xs font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500">{item.subtitle}</p>
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION SECTION */}
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-2 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900">
              About this app
            </h3>
            <p>
              SabiProfile is sovereign data infrastructure and decentralized identity platform. Turn physical documents, degrees, passports, and bank statements into tamper-proof, schema-validated cryptographic credentials.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-700 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Zero Central Storage
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                4ms Cryptographic Verification
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                NDPC &amp; GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
