"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  User,
  Key,
  Layers,
  LogIn,
} from "lucide-react";

export function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState<"solutions" | "vault" | "verify" | "login">("solutions");

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0.375rem))]"
    >
      <div className="grid grid-cols-4 items-center text-center">
        {/* 1. Solutions Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("solutions");
            scrollToSection("solutions-section");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "solutions"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              activeTab === "solutions"
                ? "bg-emerald-100 text-emerald-800 shadow-xs"
                : ""
            }`}
          >
            <Sparkles size={16} />
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Solutions</span>
        </button>

        {/* 2. Sovereign Vault Tab */}
        <Link
          href="/login?mode=signup"
          onClick={() => setActiveTab("vault")}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "vault"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              activeTab === "vault"
                ? "bg-emerald-100 text-emerald-800 shadow-xs"
                : ""
            }`}
          >
            <Key size={16} />
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">New Vault</span>
        </Link>

        {/* 3. Anti-Tamper Verify Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("verify");
            scrollToSection("tamper-simulation-section");
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "verify"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              activeTab === "verify"
                ? "bg-emerald-100 text-emerald-800 shadow-xs"
                : ""
            }`}
          >
            <ShieldCheck size={16} />
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Verify</span>
        </button>

        {/* 4. Log In Tab */}
        <Link
          href="/login"
          onClick={() => setActiveTab("login")}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "login"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              activeTab === "login"
                ? "bg-emerald-100 text-emerald-800 shadow-xs"
                : ""
            }`}
          >
            <LogIn size={16} />
          </span>
          <span className="text-[10px] tracking-tight mt-0.5">Log In</span>
        </Link>
      </div>
    </nav>
  );
}
