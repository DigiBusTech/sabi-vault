"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    deferredPwaPrompt?: any;
  }
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Capture beforeinstallprompt globally
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent("sabi:pwa-ready", { detail: e }));
      console.log("[PWA] Captured beforeinstallprompt event.");
    };

    const handleAppInstalled = () => {
      window.deferredPwaPrompt = null;
      window.dispatchEvent(new CustomEvent("sabi:pwa-installed"));
      console.log("[PWA] SabiProfile app successfully installed.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 2. Register Service Worker universally for PWA installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service worker active:", reg.scope);
        })
        .catch((err) => {
          console.debug("[PWA] Service worker registration error:", err);
        });
    }

    // 3. Standalone PWA detection: launch into native PWA onboarding route
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      new URLSearchParams(window.location.search).get("pwa") === "true";

    if (isStandalone && window.location.pathname === "/") {
      window.location.replace("/pwa");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}


