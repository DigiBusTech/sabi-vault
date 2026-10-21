"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { PwaInstallModal } from "@/components/pwa/PwaInstallModal";

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    const isPwa = window.location.pathname.startsWith("/pwa");


    if (standalone || isPwa) {
      setIsStandalone(true);
      return;
    }

    if (sessionStorage.getItem("sabi_pwa_dismissed") === "true") return;
    if (window.deferredPwaPrompt) setDeferredPrompt(window.deferredPwaPrompt);

    const onBefore = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPwaPrompt = e;
    };
    const onReady = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        window.deferredPwaPrompt = e.detail;
      }
    };

    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("sabi:pwa-ready", onReady);
    const timer = setTimeout(() => setVisible(true), 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("sabi:pwa-ready", onReady);
    };
  }, []);

  if (isStandalone || !visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("sabi_pwa_dismissed", "true");
  };

  const handleInstall = async () => {
    const prompt = deferredPrompt || (typeof window !== "undefined" ? window.deferredPwaPrompt : null);
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setVisible(false);
          setDeferredPrompt(null);
          if (typeof window !== "undefined") window.deferredPwaPrompt = null;
          return;
        }
      } catch (err) {
        console.warn("[PWA] Prompt error", err);
      }
    }
    setModalOpen(true);
  };

  return (
    <>
      {/* Mobile Floating Bar */}
      <div className="fixed bottom-16 left-3 right-3 z-30 md:hidden animate-fadeIn">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-3 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-poppins text-xs font-bold text-white">Install SabiProfile</p>
              <p className="truncate text-[10px] text-emerald-300">1-tap biometric &amp; offline access</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Download size={12} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Floating Pill */}
      <div className="fixed bottom-5 right-5 z-30 hidden md:block animate-fadeIn">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 pr-4 text-slate-900 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-poppins text-xs font-bold text-slate-900">Get SabiProfile Desktop App</p>
            <p className="text-[11px] text-slate-500">Standalone workstation with hardware crypto</p>
          </div>
          <button
            type="button"
            onClick={handleInstall}
            className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-[#059669] px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#047857] active:scale-95 transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Full-Screen / Modal PWA Prompt */}
      <PwaInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
