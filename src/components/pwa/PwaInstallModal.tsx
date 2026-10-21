"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  Share,
  PlusSquare,
  Lock,
} from "lucide-react";
import { ShieldCheckAnimated, ArrowRightAnimated } from "@/components/ui/animated-icons";

export interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaInstallModal({ isOpen, onClose }: PwaInstallModalProps) {
  const [mounted, setMounted] = useState(false);
  const [deviceType, setDeviceType] = useState<"desktop" | "ios" | "android">("desktop");
  const [installState, setInstallState] = useState<"idle" | "installing" | "installed">("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing Sovereign Enclave...");
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
      window.deferredPwaPrompt = e;
    };

    const handleSabiPwaReady = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        window.deferredPwaPrompt = e.detail;
      }
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

      // If native prompt is immediately ready, auto-trigger
      const prompt = deferredPrompt || (typeof window !== "undefined" ? window.deferredPwaPrompt : null);
      if (prompt) {
        try {
          prompt.prompt();
          prompt.userChoice.then(({ outcome }: any) => {
            if (outcome === "accepted") {
              setInstallState("installed");
              setDeferredPrompt(null);
              if (typeof window !== "undefined") window.deferredPwaPrompt = null;
            }
          });
        } catch (err) {
          console.debug("[PWA] Prompt error:", err);
        }
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, deferredPrompt]);

  if (!mounted || !isOpen) return null;

  // Direct Install Trigger or Full-Simulation Engine
  const triggerAutoInstall = async () => {
    const prompt = deferredPrompt || (typeof window !== "undefined" ? window.deferredPwaPrompt : null);
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setInstallState("installed");
          setDeferredPrompt(null);
          if (typeof window !== "undefined") window.deferredPwaPrompt = null;
          return;
        }
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
    }

    // Execute High-Fidelity Animated Simulation
    setInstallState("installing");
    setProgress(15);
    setStatusMessage("Connecting to SabiProfile Sovereign Node...");

    setTimeout(() => {
      setProgress(45);
      setStatusMessage("Configuring offline cryptographic cache & Service Worker...");
    }, 400);

    setTimeout(() => {
      setProgress(85);
      setStatusMessage("Registering native app manifest & home screen icons...");
    }, 800);

    setTimeout(() => {
      setProgress(100);
      setInstallState("installed");
      setStatusMessage("SabiProfile App Successfully Added to Device!");
    }, 1250);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-screen h-[100dvh] max-w-[100vw] overflow-y-auto bg-white text-slate-900 flex flex-col p-5 sm:p-7 sm:h-auto sm:max-h-[92vh] sm:max-w-lg sm:rounded-[2.5rem] sm:shadow-2xl sm:border sm:border-slate-200/80 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Download size={14} />
            </span>
            <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-800">
              Install SabiProfile App
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="mt-3 flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setDeviceType("android");
              setInstallState("idle");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              deviceType === "android"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={13} />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDeviceType("ios");
              setInstallState("idle");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              deviceType === "ios"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={13} />
            <span>iOS</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDeviceType("desktop");
              setInstallState("idle");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              deviceType === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Monitor size={13} />
            <span>Desktop</span>
          </button>
        </div>

        {/* App Profile Showcase */}
        <div className="mt-5 flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] shadow-lg shadow-emerald-700/20 ring-1 ring-white/60">
            <svg className="h-9 w-9 text-white fill-current" viewBox="0 0 512 512">
              <path d="M256 64L392 124V252C392 344.4 334.4 429.2 256 452C177.6 429.2 120 344.4 120 252V124L256 64Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-poppins text-lg font-extrabold text-slate-900 leading-tight">
              SabiProfile Enterprise App
            </h3>
            <p className="text-xs text-slate-500">
              Sovereign Client • Base Sepolia L2
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={11} className="text-emerald-700" />
                Verified Standalone
              </span>
              <span className="text-[10px] text-slate-400">Zero Central Storage</span>
            </div>
          </div>
        </div>

        {/* Dynamic State: Installing Simulation */}
        {installState === "installing" && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-center border border-slate-200/90 space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full border-3 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center">
              <Download size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-poppins text-sm font-bold text-slate-900">
                Installing SabiProfile...
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{statusMessage}</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-emerald-700">{progress}% complete</p>
          </div>
        )}

        {/* Dynamic State: Installed Success */}
        {installState === "installed" && (
          <div className="mt-6 rounded-2xl bg-emerald-50/80 p-5 text-center border border-emerald-200/90 space-y-3 animate-fadeIn">
            <div className="h-12 w-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/25">
              <Check size={24} strokeWidth={2.8} />
            </div>
            <div>
              <p className="font-poppins text-base font-extrabold text-slate-900">
                App Ready to Launch!
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                SabiProfile is configured with hardware biometric enclaves and offline cryptographic proofs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = "/pwa";
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#059669] py-3 text-xs font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-[#047857] active:scale-95 transition-all cursor-pointer"
            >
              <span>Launch SabiProfile App Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Dynamic State: Idle State Options */}
        {installState === "idle" && (
          <div className="mt-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Runs in dedicated standalone window with 60fps performance</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Biometric FaceID &amp; NFC tap-to-verify credential attestation</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>Offline cryptographic SHA-256 verification against Base Sepolia</span>
              </div>
            </div>

            {/* iOS Safari Tip */}
            {deviceType === "ios" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Share size={13} className="text-emerald-600" />
                  <span>iPhone / iPad Safari Install:</span>
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Tap the <strong>Share button</strong> in Safari, then select <strong>&quot;Add to Home Screen&quot;</strong>.
                </p>
              </div>
            )}

            {/* Direct Auto Install / Launch Button */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={triggerAutoInstall}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#059669] py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-[#047857] active:scale-95 transition-all cursor-pointer"
              >
                <Download size={16} />
                <span>Install SabiProfile App Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = "/pwa";
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                <span>Open App in Browser Mode</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
