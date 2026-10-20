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

  const handleSimulateInstall = async () => {
    // If real browser beforeinstallprompt is present, fire it first
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setInstallState("installed");
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn("Native prompt deferred, running simulation.", err);
      }
    }

    // Interactive high-fidelity simulation
    setInstallState("installing");
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setInstallState("installed");
          }, 800);
          return 100;
        }
        return prev + 20;
      });
    }, 280);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Device Switcher Pills (Allows testing iOS, Android, or Desktop view) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 pr-10">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <Download size={14} />
            </span>
            <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-700">
              Progressive Web App
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setDeviceType("desktop"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor size={12} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => { setDeviceType("ios"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "ios" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone size={12} />
              <span>iOS</span>
            </button>
            <button
              type="button"
              onClick={() => { setDeviceType("android"); setInstallState("idle"); }}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                deviceType === "android" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone size={12} />
              <span>Android</span>
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

            {/* Install Button & Progress */}
            <div className="pt-2">
              {installState === "idle" && (
                <button
                  type="button"
                  onClick={handleSimulateInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  <Download size={15} />
                  <span>Install SabiProfile on Desktop</span>
                </button>
              )}

              {installState === "installing" && (
                <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      Registering Service Worker & Caching Assets...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {installState === "installed" && (
                <div className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                    <Check size={18} className="text-emerald-600" />
                    <span>SabiProfile Installed Successfully!</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    SabiProfile is now registered on your system. You can launch it anytime.
                  </p>
                  <a
                    href="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <span>Launch SabiProfile App</span>
                    <ArrowRight size={13} />
                  </a>
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

            {/* Test Simulation Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSimulateInstall}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
              >
                {installState === "installed" ? (
                  <>
                    <Check size={14} />
                    <span>Home Screen Icon Verified! Open Vault</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Simulate Mobile Installation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {deviceType === "android" && (
          <div className="mt-5 space-y-4">
            <p className="text-xs leading-relaxed text-slate-600">
              One-tap direct PWA install on Android Chrome. Gives you instant NFC tap-to-verify, hardware FaceID unlock, and offline QR consent keys.
            </p>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Instant Android App Drawer integration</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Hardware Biometric unlock (Fingerprint / Face Unlock)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600" />
                <span>Offline cryptographic verification proofs</span>
              </div>
            </div>

            <div className="pt-2">
              {installState === "idle" && (
                <button
                  type="button"
                  onClick={handleSimulateInstall}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#047857] transition-all"
                >
                  <Download size={15} />
                  <span>Add SabiProfile to Home Screen</span>
                </button>
              )}

              {installState === "installing" && (
                <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      Installing SabiProfile PWA...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {installState === "installed" && (
                <div className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                    <Check size={18} className="text-emerald-600" />
                    <span>Added to Home Screen!</span>
                  </div>
                  <a
                    href="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <span>Launch Android App</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              )}
            </div>
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

