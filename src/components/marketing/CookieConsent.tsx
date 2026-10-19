"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "sabi_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        const timer = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Storage unavailable (private mode); do not nag the visitor.
    }
  }, []);

  const choose = (value: "accepted" | "declined") => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString() })
      );
    } catch {
      // Ignore storage failures; the banner simply reappears next visit.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-500 sm:left-auto sm:right-6"
      style={{ transform: "translateY(0)" }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green-light text-brand-green">
          <Cookie size={17} />
        </span>
        <div>
          <h2 className="font-poppins text-sm font-bold text-brand-dark">Cookies on SabiProfile</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            We use essential cookies to keep you signed in. With your consent, we also use
            privacy-respecting analytics to improve the product. Read our{" "}
            <Link href="/legal/privacy" className="font-semibold text-brand-green underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-3.5 flex gap-2.5">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-green-hover active:scale-[0.98]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("declined")}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
