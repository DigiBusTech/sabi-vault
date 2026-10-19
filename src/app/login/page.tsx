"use client";

import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

const assurances = [
  "Your documents never leave your own cloud storage.",
  "Every record is hashed with SHA-256 and anchored on-chain.",
  "You approve exactly who sees what, and can revoke it anytime.",
];

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] bg-white text-brand-dark lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark px-12 py-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Back to homepage">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
            <ShieldCheck size={17} strokeWidth={2} />
          </span>
          <span className="font-poppins text-sm font-extrabold tracking-tight">SABI VAULT</span>
        </Link>

        <div>
          <h2 className="max-w-md font-poppins text-3xl font-extrabold leading-[1.12] tracking-tight">
            Your records. Your keys. Their proof.
          </h2>
          <ul className="mt-8 space-y-4">
            {assurances.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand-green" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Sovereign identity infrastructure for immigration, education, and labour.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex min-h-[100dvh] items-center justify-center px-5 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden" aria-label="Back to homepage">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white">
              <ShieldCheck size={17} strokeWidth={2} />
            </span>
            <span className="font-poppins text-sm font-extrabold tracking-tight text-brand-dark">
              SABI VAULT
            </span>
          </Link>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

