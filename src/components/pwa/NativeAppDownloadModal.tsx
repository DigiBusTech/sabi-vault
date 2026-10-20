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
  ExternalLink,
  Layers,
  ArrowRight,
  Check,
  Lock,
  Cpu,
  Globe2,
} from "lucide-react";

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
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlatform(initialPlatform);
    setInstallState("idle");
    setProgress(0);
    setEmailSubmitted(false);
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

  const handleInstallClick = () => {
    if (installState === "installed") {
      window.location.href = "/login";
      return;
    }
    if (installState !== "idle") return;

    setInstallState("downloading");
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setInstallState("installing");
          setTimeout(() => {
            setInstallState("installed");
          }, 1200);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const screenshots = [
    {
      title: "Sovereign Citizen Vault",
      subtitle: "6 domains of cryptographic identity",
      badge: "Citizen OS",
      color: "from-emerald-500 to-teal-700",
      content: (
        <div className="space-y-2 p-3 text-left">
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <span className="text-[11px] font-bold text-white">Chinwe Okafor</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">Verified</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-white/70">Liquid Funds</p>
              <p className="font-bold text-white">₦8,750,000</p>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-white/70">Degree Proof</p>
              <p className="font-bold text-white">B.Sc First Class</p>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-white/70">Base L2 Anchor</p>
              <p className="font-bold text-emerald-300">#19,421,802</p>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-white/70">Storage Model</p>
              <p className="font-bold text-white">Zero Raw Central</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Biometric Scoped Keys",
      subtitle: "Instant FaceID consent & TTL",
      badge: "Zero-Knowledge",
      color: "from-slate-900 to-emerald-950",
      content: (
        <div className="space-y-2 p-3 text-left">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock size={14} />
            <span className="text-[11px] font-bold text-white">Consent Policy Active</span>
          </div>
          <div className="rounded-lg bg-emerald-900/40 p-2 text-[10px] text-emerald-200">
            <p className="font-mono">sbk_live_v1_9a8f...4e1b</p>
            <p className="mt-1 text-[9px] text-white/60">Expires in 7 days • academics & finance only</p>
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/80">
            <span>FaceID Biometric</span>
            <span className="font-bold text-emerald-300">Hardware Bound</span>
          </div>
        </div>
      ),
    },
    {
      title: "Real-Time Tamper Shield",
      subtitle: "4ms fail-closed rejection",
      badge: "Cryptographic",
      color: "from-emerald-700 to-slate-900",
      content: (
        <div className="space-y-2 p-3 text-left">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-white">SHA-256 Verified</span>
          </div>
          <p className="text-[10px] text-white/80">
            Live database re-hashing against EVM ledger prevents any unauthorized alteration.
          </p>
          <div className="rounded-md bg-white/10 px-2 py-1 text-[9px] font-mono text-emerald-300">
            Status: TAMPER_FREE (100% Match)
          </div>
        </div>
      ),
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[2rem] border border-slate-200/80 bg-white text-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Platform Switcher Tabs */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Shield size={14} />
              </span>
              <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Mobile Release
              </span>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setPlatform("ios");
                  setInstallState("idle");
                  setProgress(0);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  platform === "ios"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1.01.08 2.05-.51 2.67-1.26z" />
                </svg>
                <span>App Store</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatform("android");
                  setInstallState("idle");
                  setProgress(0);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  platform === "android"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" fill="#059669" />
                </svg>
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>

        {/* Store Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] shadow-lg shadow-emerald-700/20 ring-1 ring-black/5">
              <svg className="h-11 w-11" viewBox="0 0 512 512" fill="none">
                <path
                  d="M256 64L392 124V252C392 344.4 334.4 429.2 256 452C177.6 429.2 120 344.4 120 252V124L256 64Z"
                  fill="#ffffff"
                />
                <circle cx="256" cy="220" r="44" fill="#059669" />
                <path d="M240 236H272L282 320H230L240 236Z" fill="#059669" />
              </svg>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                ✓
              </span>
            </div>

            {/* App Details */}
            <div className="flex-1 min-w-0 pr-6">
              <h2 className="font-poppins text-lg font-extrabold text-slate-900 leading-tight">
                SabiProfile: Sovereign Vault
              </h2>
              <p className="text-xs font-semibold text-emerald-700">
                Sabi AI Technologies Ltd
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Decentralized Identity & Proof Infrastructure
              </p>

              {/* Install / Get Button with Live Simulation */}
              <div className="mt-3">
                {platform === "ios" ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-xs font-bold transition-all shadow-sm ${
                      installState === "installed"
                        ? "bg-emerald-600 text-white"
                        : installState === "downloading" || installState === "installing"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95"
                    }`}
                  >
                    {installState === "idle" && (
                      <>
                        <span>GET</span>
                        <span className="text-[10px] font-normal opacity-80">(Free)</span>
                      </>
                    )}
                    {installState === "downloading" && (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        <span>Downloading ({progress}%)...</span>
                      </>
                    )}
                    {installState === "installing" && (
                      <>
                        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-emerald-600" />
                        <span>Installing...</span>
                      </>
                    )}
                    {installState === "installed" && (
                      <>
                        <Check size={14} className="text-white" />
                        <span>OPEN</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2 text-xs font-bold transition-all shadow-sm ${
                      installState === "installed"
                        ? "bg-emerald-600 text-white"
                        : installState === "downloading" || installState === "installing"
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105 active:scale-95"
                    }`}
                  >
                    {installState === "idle" && (
                      <>
                        <Download size={13} />
                        <span>Install</span>
                      </>
                    )}
                    {installState === "downloading" && (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                        <span>Downloading 28.4 MB ({progress}%)...</span>
                      </>
                    )}
                    {installState === "installing" && (
                      <>
                        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-emerald-600" />
                        <span>Installing app...</span>
                      </>
                    )}
                    {installState === "installed" && (
                      <>
                        <Check size={14} className="text-white" />
                        <span>Open Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Store Metrics Strip */}
          <div className="mt-5 grid grid-cols-4 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center text-slate-600">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Rating</p>
              <div className="mt-0.5 flex items-center justify-center gap-0.5 font-poppins text-xs font-bold text-slate-900">
                <span>4.9</span>
                <Star size={11} className="fill-amber-400 text-amber-400" />
              </div>
              <p className="text-[9px] text-slate-400">18.4K reviews</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
              <p className="mt-0.5 font-poppins text-xs font-bold text-slate-900">17+</p>
              <p className="text-[9px] text-slate-400">Sovereign</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Chart</p>
              <p className="mt-0.5 font-poppins text-xs font-bold text-emerald-700">#1</p>
              <p className="text-[9px] text-slate-400">GovTech</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Size</p>
              <p className="mt-0.5 font-poppins text-xs font-bold text-slate-900">28.4 MB</p>
              <p className="text-[9px] text-slate-400">Encrypted</p>
            </div>
          </div>
        </div>

        {/* Interactive Screenshots Carousel */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Preview
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700">
              {activeScreenshot + 1} of {screenshots.length}
            </span>
          </div>

          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${screenshots[activeScreenshot].color} p-4 text-white shadow-md transition-all duration-300 min-h-[170px] flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  {screenshots[activeScreenshot].badge}
                </span>
                <div className="flex gap-1">
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveScreenshot(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeScreenshot === i ? "w-5 bg-white" : "w-1.5 bg-white/40"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <h4 className="mt-2 font-poppins text-base font-bold leading-tight">
                {screenshots[activeScreenshot].title}
              </h4>
              <p className="text-xs text-white/80">
                {screenshots[activeScreenshot].subtitle}
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-black/25 backdrop-blur-sm border border-white/10">
              {screenshots[activeScreenshot].content}
            </div>
          </div>
        </div>

        {/* Feature Highlights List */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-2 text-xs text-slate-700">
          <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Enterprise Features Included
          </h4>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Zero Raw Central Storage:</strong> Physical documents remain securely inside your personal Google Drive or Dropbox.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Base L2 Immutable Ledger:</strong> Real-time SHA-256 anchors protect degrees, bank records, and identities against fraud.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Biometric Hardware Enclave:</strong> FaceID / Fingerprint encryption on-device with offline scoped keys.</span>
          </div>
        </div>

        {/* Early Beta / Direct Invite Form */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-[2rem]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-600" />
            <h4 className="font-poppins text-xs font-bold text-slate-900">
              {platform === "ios" ? "Request iOS TestFlight Direct Invite" : "Request Google Play Internal APK"}
            </h4>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            Get instant build access sent straight to your email before public store release.
          </p>

          {emailSubmitted ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-100/70 p-3 border border-emerald-300 text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <p className="text-xs font-semibold">
                Invitation queued! Check {email} for your instant {platform === "ios" ? "TestFlight" : "Google Play"} link.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setEmailSubmitted(true);
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shrink-0"
              >
                Send Invite
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/60 text-[11px]">
            <span className="text-slate-500">Need immediate browser access?</span>
            <a
              href="/login"
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Launch Web PWA</span>
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

