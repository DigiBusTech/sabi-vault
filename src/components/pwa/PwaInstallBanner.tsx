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
    if (standalone) {
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
    const onReady = (e: any) => { if (e.detail) setDeferredPrompt(e.detail); };

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
    const prompt = deferredPrompt || window.deferredPwaPrompt;
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setVisible(false);
          setDeferredPrompt(null);
          window.deferredPwaPrompt = null;
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

      {/* Desktop Floating Card */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block max-w-sm animate-fadeIn">
        <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-700/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                <Sparkles size={9} />
                <span>Enterprise PWA</span>
              </div>
              <h4 className="mt-1 font-poppins text-sm font-bold text-slate-900">Install SabiProfile App</h4>
              <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">Fast standalone window &amp; biometric enclave.</p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#059669] py-2 text-xs font-bold text-white shadow-sm hover:bg-[#047857] active:scale-95 transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Install to Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>Guide</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
      <PwaInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
