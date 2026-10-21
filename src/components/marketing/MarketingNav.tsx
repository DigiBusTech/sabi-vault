"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ShieldCheckAnimated } from "@/components/ui/animated-icons";
import { LiquidGlassFilter } from "@/components/ui/LiquidGlass";

const links = [
  { href: "/about", label: "About Us" },
  { href: "/government", label: "Government" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),inset_0_1px_1px_0_rgba(255,255,255,0.9)]">
      <LiquidGlassFilter />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        <Link href="/" className="group flex items-center gap-2 sm:gap-2.5 shrink-0" aria-label="SabiProfile home">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-green text-white shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0">
            <ShieldCheckAnimated size={17} strokeWidth={2} />
          </span>
          <span className="font-poppins text-sm sm:text-base font-extrabold tracking-tight text-brand-dark">
            SabiProfile
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "text-brand-green font-semibold"
                  : "text-slate-600 hover:text-brand-dark"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="liquid-glass-pill px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:text-brand-dark"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green-hover hover:shadow hover:scale-[1.02] active:scale-[0.98]"
          >
            Create vault
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3 border-t border-slate-100 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-brand-green px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Create vault
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
