"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Check,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

export interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaInstallModal({ isOpen, onClose }: PwaInstallModalProps) {
  const [mounted, setMounted] = useState(false);
  const [deviceType, setDeviceType] = useState<"desktop" | "ios" | "android">("desktop");
  const [installState, setInstallState] = useState<"idle" | "installing" | "installed">("idle");
  const [progress, setProgress] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Detect User Agent
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) {
      setDeviceType("ios");
    } else if (/Android/.test(ua)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }

    // Capture native PWA install prompt event if available
    if (typeof window !== "undefined" && window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleSabiPwaReady = (e: any) => {
      if (e.detail) setDeferredPrompt(e.detail);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("sabi:pwa-ready", handleSabiPwaReady);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("sabi:pwa-ready", handleSabiPwaReady);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setInstallState("idle");
      setProgress(0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleNativeInstall = async () => {
    const prompt = deferredPrompt || (typeof window !== "undefined" ? window.deferredPwaPrompt : null);
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setInstallState("installed");
          setDeferredPrompt(null);
          if (typeof window !== "undefined") window.deferredPwaPrompt = null;
        }
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 bg-white p-5 sm:p-7 text-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Device Switcher Pills (Allows testing iOS, Android, or Desktop view) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 pr-8">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <Download size={13} />
            </span>
            <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-700">
              Install App
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setDeviceType("android"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "android" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone size={11} />
              <span>Android</span>
            </button>
            <button
              type="button"
              onClick={() => { setDeviceType("ios"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "ios" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone size={11} />
              <span>iOS</span>
            </button>
            <button
              type="button"
              onClick={() => { setDeviceType("desktop"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor size={11} />
              <span className="hidden sm:inline">Desktop</span>
              <span className="sm:hidden">PC</span>
            </button>
          </div>
        </div>

        {/* PWA App Identity Card */}
        <div className="mt-5 flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] shadow-md shadow-emerald-700/20">
            <svg className="h-9 w-9" viewBox="0 0 512 512" fill="none">
              <path
                d="M256 64L392 124V252C392 344.4 334.4 429.2 256 452C177.6 429.2 120 344.4 120 252V124L256 64Z"
                fill="#ffffff"
              />
              <circle cx="256" cy="220" r="44" fill="#059669" />
              <path d="M240 236H272L282 320H230L240 236Z" fill="#059669" />
            </svg>
          </div>
          <div>
            <h3 className="font-poppins text-lg font-extrabold text-slate-900 leading-tight">
              SabiProfile Enterprise App
            </h3>
            <p className="text-xs text-slate-500">
              https://sabiprofile.org • Sovereign Client
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={11} className="text-emerald-600" />
                Verified Standalone
              </span>
              <span className="text-[10px] text-slate-400">Zero App Store Fees</span>
            </div>
          </div>
        </div>

        {/* Body content based on selected device */}
        {deviceType === "desktop" && (
          <div className="mt-5 space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Install SabiProfile to run as a dedicated desktop workstation. You get lightning-fast launch from your Dock or Taskbar, hardware cryptographic acceleration, and offline verification proofs without browser tabs.
            </p>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Runs in dedicated standalone window without URL bars</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Offline credential caching with cryptographic SHA-256 checks</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Zero system footprint (less than 2 MB memory cache)</span>
              </div>
            </div>

            {/* Install Button / Guide */}
            <div className="pt-2">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Install SabiProfile on Desktop</span>
                </button>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-2">
                  <p className="font-bold text-slate-900">Install via Browser Address Bar:</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Look for the <strong>Install icon (⊕ or ⬇)</strong> on the right side of your browser address bar (Chrome, Edge, Brave), then click <strong>Install</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Check System Prompt</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {deviceType === "ios" && (
          <div className="mt-5 space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              Install SabiProfile directly on your iPhone or iPad via Safari for full-screen biometric execution.
            </p>

            {/* iOS Step-by-Step Instruction Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-xs shrink-0">
                  1
                </span>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    Tap the Share Icon
                    <Share size={13} className="text-emerald-700 inline" />
                  </p>
                  <p className="text-slate-500 text-[11px]">Located in the bottom Safari toolbar.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-xs shrink-0">
                  2
                </span>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    Select &quot;Add to Home Screen&quot;
                    <PlusSquare size={13} className="text-emerald-700 inline" />
                  </p>
                  <p className="text-slate-500 text-[11px]">Scroll down the share sheet to locate this option.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                  3
                </span>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-900">Tap &quot;Add&quot; in the Top Right</p>
                  <p className="text-slate-500 text-[11px]">SabiProfile will instantly appear on your Home Screen.</p>
                </div>
              </div>
            </div>

            {/* iOS Tip Box */}
            <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200/80">
              <strong>Tip:</strong> If you are viewing this inside Chrome or another browser on iOS, please copy the URL and open it in <strong>Safari</strong> to enable the Home Screen installation feature.
            </div>
          </div>
        )}

        {deviceType === "android" && (
          <div className="mt-4 space-y-3.5">
            <p className="text-xs leading-relaxed text-slate-600">
              Install SabiProfile directly on Android Chrome for full-screen biometric execution, offline keys, and zero browser bars.
            </p>

            {deferredPrompt ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] active:scale-95 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Install SabiProfile on This Phone</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Tap above to trigger Android&apos;s system install sheet.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  How to Add to Home Screen in Chrome:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      1
                    </span>
                    <p className="text-slate-700">
                      Tap the <strong>three dots menu</strong> (<MoreVertical size={12} className="inline text-slate-600" />) in the top-right corner of Chrome.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      2
                    </span>
                    <p className="text-slate-700">
                      Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      3
                    </span>
                    <p className="text-slate-700">
                      Tap <strong>&quot;Install&quot;</strong> to place SabiProfile on your phone&apos;s home screen.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Check for System Install Prompt</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-5 border-t border-slate-100 pt-3 text-center text-[11px] text-slate-400">
          Encrypted client • NDPC & GDPR Compliant • Powered by Base Sepolia
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

