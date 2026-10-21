"use client";

import { usePathname } from "next/navigation";
﻿import Link from "next/link";
import { ShieldCheckAnimated } from "@/components/ui/animated-icons";
import { AppDownloadButtons } from "@/components/marketing/AppDownloadButtons";

const columns = [

  {
    title: "Platform",
    links: [
      { href: "/government", label: "For Governments" },
      { href: "/enterprise", label: "For Enterprises" },
      { href: "/docs", label: "Documentation" },
      { href: "/blog", label: "Blog" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
    ],
  },
];

export function MarketingFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green text-white shadow-sm">
                <ShieldCheckAnimated size={17} strokeWidth={2} />
              </span>
              <span className="font-poppins text-sm font-extrabold tracking-tight text-brand-dark">
                SabiProfile
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Sovereign data infrastructure. Citizen-owned credentials, verified on-chain,
              shared by consent.
            </p>
            <div className="mt-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Mobile Vault (Beta)
              </span>
              <AppDownloadButtons size="sm" />
            </div>
          </div>


          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-brand-green"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{year} SabiProfile. All rights reserved.</p>
          <p>Architected for NDPC and GDPR compliance. Raw documents never leave your storage.</p>
        </div>
      </div>
    </footer>
  );
}
